export const DEFAULT_MAX_VISION_IMAGE_BYTES = 10 * 1024 * 1024;

const BASE64_IMAGE_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

export type VisionImageValidationResult =
  | { ok: true; base64: string; mediaType: string }
  | { ok: false; error: string; status: number };

export function getMaxVisionImageBytes(): number {
  const raw = process.env.MAX_FILE_SIZE;
  if (!raw) {
    return DEFAULT_MAX_VISION_IMAGE_BYTES;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MAX_VISION_IMAGE_BYTES;
}

function extractBase64Payload(image: string): string {
  if (!image.startsWith("data:")) {
    return image;
  }

  const commaIndex = image.indexOf(",");
  if (commaIndex === -1) {
    throw new Error("Invalid data URL format");
  }

  const metadata = image.slice(5, commaIndex);
  if (!metadata.includes("base64")) {
    throw new Error("Invalid data URL format");
  }

  return image.slice(commaIndex + 1);
}

export function detectImageMediaTypeFromBase64(base64: string): string | null {
  try {
    const binary = Buffer.from(base64.slice(0, 32), "base64");
    if (
      binary.length >= 4 &&
      binary[0] === 0x89 &&
      binary[1] === 0x50 &&
      binary[2] === 0x4e &&
      binary[3] === 0x47
    ) {
      return "image/png";
    }
    if (
      binary.length >= 3 &&
      binary[0] === 0xff &&
      binary[1] === 0xd8 &&
      binary[2] === 0xff
    ) {
      return "image/jpeg";
    }
    if (
      binary.length >= 12 &&
      binary.toString("ascii", 0, 4) === "RIFF" &&
      binary.toString("ascii", 8, 12) === "WEBP"
    ) {
      return "image/webp";
    }
    if (binary.length >= 3 && binary.toString("ascii", 0, 3) === "GIF") {
      return "image/gif";
    }
    return null;
  } catch {
    return null;
  }
}

export function validateVisionImageInput(
  image: unknown,
  maxBytes = getMaxVisionImageBytes()
): VisionImageValidationResult {
  if (!image || typeof image !== "string" || !image.trim()) {
    return { ok: false, error: "Missing or invalid image data", status: 400 };
  }

  let base64: string;
  try {
    base64 = extractBase64Payload(image.trim());
  } catch {
    return { ok: false, error: "Invalid image data URL format", status: 400 };
  }

  if (!base64 || !BASE64_IMAGE_PATTERN.test(base64)) {
    return { ok: false, error: "Image data is not valid base64", status: 400 };
  }

  const estimatedBytes = Math.floor((base64.length * 3) / 4);
  if (estimatedBytes > maxBytes) {
    return {
      ok: false,
      error: `Image exceeds maximum size of ${maxBytes} bytes`,
      status: 413,
    };
  }

  const mediaType = detectImageMediaTypeFromBase64(base64);
  if (!mediaType) {
    return { ok: false, error: "Unrecognized image format", status: 400 };
  }

  return { ok: true, base64, mediaType };
}

export function normalizeVisionImage(base64: string, mediaType: string): string {
  return `data:${mediaType};base64,${base64}`;
}
