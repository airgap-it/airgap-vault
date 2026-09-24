#!/usr/bin/env python3
"""
Phase 1 of the signature-DB pipeline: refresh the curated signature list from
the Sourcify public data export.

This is the *heavy*, occasionally-run step. It reads Sourcify's Parquet export
(https://export.sourcify.dev) directly over HTTP with DuckDB, and produces a
small, committed, deterministic artifact:

    scripts/signatures.curated.ndjson.gz   (selector, signature, collisions)

Phase 2 (scripts/build-signature-db.js, pure Node, no deps) packs that artifact
into the binary src/assets/evm/signatures.db at build time.

Why Sourcify (not 4byte.directory):
  - Every signature comes from a *source-verified* deployed contract, so there
    is no open-submission spam or deliberate selector-collision noise.
  - The 4-byte selector is precomputed in the export (no keccak needed here).
  - Official, dated, reproducible exports with a manifest.

Ranking:
  - Only `signature_type = 'function'` rows are considered (calldata decoding).
  - Popularity = number of verified-contract compilations that use the
    signature (row count in compiled_contracts_signatures). The N most-used
    4-byte selectors are kept.
  - For a selector with multiple distinct signatures (a real collision), the
    most-used signature wins; the number of distinct colliding signatures is
    recorded so the UI can warn about ambiguity.

Output is sorted by selector ASC for diff-stable commits.

Usage:
    python3 -m venv .venv && .venv/bin/pip install -r scripts/requirements.txt
    .venv/bin/python scripts/refresh-signatures-sourcify.py

Env knobs:
    SIGDB_TOP_N        number of selectors to keep         (default: 500000)
    SIGDB_MEMORY       DuckDB memory_limit                 (default: 8GB)
    SIGDB_THREADS      DuckDB threads                      (default: 4)
    SIGDB_JOIN_FILES   cap join-table files (debug/sample) (default: all)
    SIGDB_EXPORT_BASE  override export base URL            (default: sourcify)
"""

import gzip
import json
import os
import sys
import urllib.request

try:
    import duckdb
except ImportError:
    sys.exit("duckdb not installed. Run: pip install -r scripts/requirements.txt")

EXPORT_BASE = os.environ.get("SIGDB_EXPORT_BASE", "https://export.sourcify.dev/")
TOP_N = int(os.environ.get("SIGDB_TOP_N", "500000"))
MEMORY = os.environ.get("SIGDB_MEMORY", "8GB")
THREADS = int(os.environ.get("SIGDB_THREADS", "4"))
JOIN_CAP = int(os.environ.get("SIGDB_JOIN_FILES", "0"))  # 0 = all

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_NDJSON = os.path.join(HERE, "signatures.curated.ndjson")
OUT_GZ = OUT_NDJSON + ".gz"
META = os.path.join(HERE, "signatures.curated.meta.json")
TMP_DIR = os.path.join(HERE, ".duckdb_tmp")


def sql_list(items):
    return "[" + ",".join("'%s'" % x for x in items) + "]"


def main():
    print(f"fetching manifest from {EXPORT_BASE} ...")
    manifest = json.load(urllib.request.urlopen(EXPORT_BASE + "manifest.json", timeout=60))
    export_date = manifest.get("dateStr")
    files = manifest["files"]
    sig_files = [EXPORT_BASE + f for f in files["signatures"]]
    join_files = [EXPORT_BASE + f for f in files["compiled_contracts_signatures"]]
    if JOIN_CAP > 0:
        join_files = join_files[:JOIN_CAP]
    print(f"export date        : {export_date}")
    print(f"signatures files   : {len(sig_files)}")
    print(f"join-table files   : {len(join_files)}{' (capped)' if JOIN_CAP else ''}")
    print(f"keeping top         : {TOP_N:,} function selectors by usage")

    os.makedirs(TMP_DIR, exist_ok=True)
    con = duckdb.connect()
    con.execute("INSTALL httpfs; LOAD httpfs;")
    con.execute(f"SET memory_limit='{MEMORY}'; SET threads={THREADS};")
    con.execute(f"SET temp_directory='{TMP_DIR}'; SET preserve_insertion_order=false;")

    # Popularity per function signature -> join to text/selector -> pick canonical
    # signature per 4-byte selector -> keep the TOP_N most-used selectors.
    query = f"""
    COPY (
      WITH fn_usage AS (
        SELECT signature_hash_32, count(*)::BIGINT AS usage
        FROM read_parquet({sql_list(join_files)})
        WHERE signature_type = 'function'
        GROUP BY 1
      ),
      joined AS (
        SELECT s.signature_hash_4 AS sel4, s.signature AS sig, u.usage
        FROM fn_usage u
        JOIN read_parquet({sql_list(sig_files)}) s USING (signature_hash_32)
      ),
      ranked AS (
        SELECT
          sel4, sig,
          row_number() OVER (PARTITION BY sel4 ORDER BY usage DESC, length(sig), sig) AS rn,
          count(*)      OVER (PARTITION BY sel4) AS collisions,
          sum(usage)    OVER (PARTITION BY sel4) AS sel_usage
        FROM joined
      ),
      top AS (
        SELECT lower(hex(sel4)) AS selector, sig AS signature, collisions
        FROM ranked
        WHERE rn = 1
        ORDER BY sel_usage DESC
        LIMIT {TOP_N}
      )
      SELECT selector, signature, collisions
      FROM top
      ORDER BY selector ASC
    ) TO '{OUT_NDJSON}' (FORMAT JSON);
    """
    print("running DuckDB pipeline (this reads the full join table; may take a while) ...")
    con.execute(query)

    # Count + gzip the NDJSON.
    count = 0
    with open(OUT_NDJSON, "rb") as fin, gzip.open(OUT_GZ, "wb", compresslevel=9) as fout:
        for line in fin:
            if line.strip():
                count += 1
            fout.write(line)
    os.remove(OUT_NDJSON)

    meta = {
        "source": "sourcify",
        "sourcifyExportDate": export_date,
        "topN": TOP_N,
        "curatedCount": count,
    }
    with open(META, "w") as f:
        json.dump(meta, f, indent=2)
        f.write("\n")

    gz_mb = os.path.getsize(OUT_GZ) / 1024 / 1024
    print("---")
    print(f"curated selectors  : {count:,}")
    print(f"export date        : {export_date}")
    print(f"output             : {OUT_GZ} ({gz_mb:.1f} MB)")
    print(f"meta               : {META}")
    print("Next: yarn build:signatures  (packs the binary)")


if __name__ == "__main__":
    main()
