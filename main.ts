import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_IMAGE_BYTES = 1_048_576;

/** Verifies the output image fits within the competition byte cap and has complete PNG or JPEG framing. */
function assertValidImageBuffer(buf: Buffer): void {
  if (buf.length === 0 || buf.length > MAX_IMAGE_BYTES) {
    throw new Error(`Invalid image size: ${buf.length} bytes (expected 1..${MAX_IMAGE_BYTES})`);
  }
  const isPng =
    buf.length >= 24 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) &&
    buf.subarray(buf.length - 8, buf.length - 4).equals(Buffer.from('IEND', 'ascii'));
  const isJpeg =
    buf.length >= 4 &&
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff &&
    buf[buf.length - 2] === 0xff &&
    buf[buf.length - 1] === 0xd9;
  if (!isPng && !isJpeg) {
    throw new Error('entry.png is neither a complete PNG nor a complete JPEG image');
  }
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(currentDir, 'entry.png');
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const destinationPath = resolve(outputDir, 'entry.png');

const imageBytes = readFileSync(sourcePath);
assertValidImageBuffer(imageBytes);
mkdirSync(outputDir, { recursive: true });
writeFileSync(destinationPath, imageBytes);
