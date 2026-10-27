const fs = require('fs')
const path = require('path')

const scannerSource = path.join('node_modules', 'cordova-plugin-qrscanner-11', 'src', 'android', 'QRScanner.java')
const marker = '// AirGap TalkBack QR guidance'

let source = fs.readFileSync(scannerSource, 'utf8').replace(/\r\n/g, '\n')

if (source.includes(marker)) {
  process.exit(0)
}

function replaceOnce(before, after) {
  if (!source.includes(before)) {
    throw new Error(`Could not apply TalkBack QR guidance patch: expected scanner source was not found.`)
  }

  source = source.replace(before, after)
}

replaceOnce('import android.graphics.Color;\n', 'import android.graphics.Color;\nimport android.graphics.Rect;\nimport android.os.SystemClock;\n')

replaceOnce(
  '    private boolean appPausedWithActivePreview = false;\n',
  String.raw`    private boolean appPausedWithActivePreview = false;

    // AirGap TalkBack QR guidance
    private static final float GUIDANCE_CENTER_TOLERANCE = 0.15f;
    private static final float GUIDANCE_MIN_SPAN = 0.25f;
    private static final float GUIDANCE_MAX_SPAN = 0.70f;
    private static final int GUIDANCE_STABLE_FRAME_COUNT = 2;
    private static final long GUIDANCE_ANNOUNCEMENT_INTERVAL_MS = 1200L;
    private String lastGuidanceAnnouncement;
    private long lastGuidanceAnnouncementAt;
    private String pendingGuidance;
    private int pendingGuidanceFrames;
`
)

replaceOnce(
  String.raw`    @Override
    public void possibleResultPoints(List<ResultPoint> list) {
    }
`,
  String.raw`    @Override
    public void possibleResultPoints(List<ResultPoint> list) {
        if (!scanning || mBarcodeView == null || list == null || list.size() < 3) {
            return;
        }

        Rect framingRect = mBarcodeView.getPreviewFramingRect();
        if (framingRect == null || framingRect.width() <= 0 || framingRect.height() <= 0) {
            return;
        }

        float minX = Float.MAX_VALUE;
        float maxX = -Float.MAX_VALUE;
        float minY = Float.MAX_VALUE;
        float maxY = -Float.MAX_VALUE;
        int pointCount = 0;

        for (ResultPoint point : list) {
            if (point == null) {
                continue;
            }

            minX = Math.min(minX, point.getX());
            maxX = Math.max(maxX, point.getX());
            minY = Math.min(minY, point.getY());
            maxY = Math.max(maxY, point.getY());
            pointCount++;
        }

        if (pointCount < 3) {
            return;
        }

        float centerX = ((minX + maxX) / 2f - framingRect.left) / framingRect.width();
        float centerY = ((minY + maxY) / 2f - framingRect.top) / framingRect.height();
        float span = Math.max(maxX - minX, maxY - minY) / Math.min(framingRect.width(), framingRect.height());

        String guidance = guidanceFor(centerX, centerY, span);
        announceGuidance(guidance);
    }

    private String guidanceFor(float centerX, float centerY, float span) {
        if (centerX < 0.5f - GUIDANCE_CENTER_TOLERANCE) {
            return "Move right";
        }
        if (centerX > 0.5f + GUIDANCE_CENTER_TOLERANCE) {
            return "Move left";
        }
        if (centerY < 0.5f - GUIDANCE_CENTER_TOLERANCE) {
            return "Move down";
        }
        if (centerY > 0.5f + GUIDANCE_CENTER_TOLERANCE) {
            return "Move up";
        }
        if (span < GUIDANCE_MIN_SPAN) {
            return "Move closer";
        }
        if (span > GUIDANCE_MAX_SPAN) {
            return "Move farther away";
        }

        return "Hold steady";
    }

    private void announceGuidance(final String guidance) {
        if (guidance.equals(pendingGuidance)) {
            pendingGuidanceFrames++;
        } else {
            pendingGuidance = guidance;
            pendingGuidanceFrames = 1;
        }

        if (pendingGuidanceFrames < GUIDANCE_STABLE_FRAME_COUNT) {
            return;
        }

        long now = SystemClock.elapsedRealtime();
        if (guidance.equals(lastGuidanceAnnouncement) || now - lastGuidanceAnnouncementAt < GUIDANCE_ANNOUNCEMENT_INTERVAL_MS) {
            return;
        }

        lastGuidanceAnnouncement = guidance;
        lastGuidanceAnnouncementAt = now;
        cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (mBarcodeView != null) {
                    mBarcodeView.announceForAccessibility(guidance);
                }
            }
        });
    }

    private void resetGuidance() {
        lastGuidanceAnnouncement = null;
        lastGuidanceAnnouncementAt = 0L;
        pendingGuidance = null;
        pendingGuidanceFrames = 0;
    }
`
)

replaceOnce(
  String.raw`    private void destroy(CallbackContext callbackContext) {
        prepared = false;
`,
  String.raw`    private void destroy(CallbackContext callbackContext) {
        resetGuidance();
        prepared = false;
`
)

fs.writeFileSync(scannerSource, source)
