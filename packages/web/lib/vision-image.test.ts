import {
  detectImageMediaTypeFromBase64,
  getMaxVisionImageBytes,
  normalizeVisionImage,
  validateVisionImageInput,
} from "./vision-image";

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

// Minimal valid WebP (RIFF....WEBP)
const WEBP_BASE64 = Buffer.from(
  "RIFF\x24\x00\x00\x00WEBPVP8 \x18\x00\x00\x00\x30\x01\x00\x9d\x01\x2a\x01\x00\x01\x00\x02\x00\x34\x25\xa4\x00\x03\x70\x00\xfe\x94\x2b\x2e",
  "binary"
).toString("base64");

describe("vision-image", () => {
  describe("detectImageMediaTypeFromBase64", () => {
    it("detects PNG", () => {
      expect(detectImageMediaTypeFromBase64(PNG_BASE64)).toBe("image/png");
    });

    it("detects WebP", () => {
      expect(detectImageMediaTypeFromBase64(WEBP_BASE64)).toBe("image/webp");
    });
  });

  describe("validateVisionImageInput", () => {
    it("accepts raw base64 PNG", () => {
      const result = validateVisionImageInput(PNG_BASE64, 1024 * 1024);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.mediaType).toBe("image/png");
        expect(result.base64).toBe(PNG_BASE64);
      }
    });

    it("accepts data URLs and sniffs bytes for media type", () => {
      const result = validateVisionImageInput(
        `data:image/png;base64,${WEBP_BASE64}`,
        1024 * 1024
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.mediaType).toBe("image/webp");
      }
    });

    it("rejects invalid base64 characters", () => {
      const result = validateVisionImageInput("not!!!base64", 1024 * 1024);
      expect(result).toEqual({
        ok: false,
        error: "Image data is not valid base64",
        status: 400,
      });
    });

    it("rejects payloads over the size limit", () => {
      const result = validateVisionImageInput(PNG_BASE64, 8);
      expect(result.ok).toBe(false);
      if (result.ok === false) {
        expect(result.status).toBe(413);
      }
    });
  });

  describe("normalizeVisionImage", () => {
    it("builds a data URL with the sniffed media type", () => {
      expect(normalizeVisionImage(WEBP_BASE64, "image/webp")).toBe(
        `data:image/webp;base64,${WEBP_BASE64}`
      );
    });
  });

  describe("getMaxVisionImageBytes", () => {
    const original = process.env.MAX_FILE_SIZE;

    afterEach(() => {
      if (original === undefined) {
        delete process.env.MAX_FILE_SIZE;
      } else {
        process.env.MAX_FILE_SIZE = original;
      }
    });

    it("uses MAX_FILE_SIZE when set", () => {
      process.env.MAX_FILE_SIZE = "2048";
      expect(getMaxVisionImageBytes()).toBe(2048);
    });
  });
});
