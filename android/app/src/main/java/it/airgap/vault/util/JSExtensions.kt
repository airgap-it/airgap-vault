package it.airgap.vault.util

import com.getcapacitor.JSObject

fun JSObject.assign(other: JSObject): JSObject {
    val otherNames = buildList {
        val names = other.names()
        for (i in 0 until (names?.length() ?: 0)) {
            names?.getString(i)?.let { add(it) }
        }
    }

    return putAll(otherNames, other, this)
}

private fun putAll(names: List<String>, source: JSObject, target: JSObject): JSObject {
    val name = names.firstOrNull() ?: return target

    return putAll(names.drop(1), source, target.put(name, source.get(name)))
}