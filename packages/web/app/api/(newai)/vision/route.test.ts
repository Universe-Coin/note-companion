import { NextRequest } from 'next/server';
import { POST } from './route';
import { generateText } from 'ai';
import { incrementAndLogTokenUsage } from '@/lib/incrementAndLogTokenUsage';
import { getModel } from '@/lib/models';

// Mock dependencies
jest.mock('ai', () => ({
  generateText: jest.fn(),
}));

jest.mock('@/lib/incrementAndLogTokenUsage', () => ({
  incrementAndLogTokenUsage: jest.fn(),
}));

jest.mock('@/lib/models', () => ({
  getModel: jest.fn(),
}));

jest.mock('@/lib/handleAuthorization', () => ({
  handleAuthorizationV2: jest.fn().mockResolvedValue({ userId: 'test-user-id' }),
  AuthorizationError: class AuthorizationError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

const VALID_IMAGE = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('POST /api/(newai)/vision', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getModel as jest.Mock).mockReturnValue({ modelId: 'gpt-4o-mini' });
    (incrementAndLogTokenUsage as jest.Mock).mockResolvedValue({
      remaining: 1000,
      usageError: false,
    });
  });

  describe('Happy Path', () => {
    it('should extract text from image and return text', async () => {
      const mockResponse = {
        text: 'Extracted text from image',
        usage: { totalTokens: 200 },
      };
      (generateText as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({
          image: VALID_IMAGE,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.text).toBe('Extracted text from image');
      expect(generateText).toHaveBeenCalled();
      expect(incrementAndLogTokenUsage).toHaveBeenCalledWith(
        'test-user-id',
        200
      );
    });

    it('should use default instruction when no custom instructions provided', async () => {
      const mockResponse = {
        text: 'Extracted text',
        usage: { totalTokens: 150 },
      };
      (generateText as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({
          image: VALID_IMAGE,
        }),
      });

      await POST(request);

      const callArgs = (generateText as jest.Mock).mock.calls[0][0];
      expect(callArgs.messages[0].content[0].text).toContain(
        'Extract all text from the image comprehensively'
      );
      expect(callArgs.messages[0].content[0].text).toContain(
        'Respond with only the extracted text'
      );
    });

    it('should use custom instructions when provided', async () => {
      const mockResponse = {
        text: 'Extracted text',
        usage: { totalTokens: 150 },
      };
      (generateText as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({
          image: VALID_IMAGE,
          instructions: 'Focus on handwritten text only',
        }),
      });

      await POST(request);

      const callArgs = (generateText as jest.Mock).mock.calls[0][0];
      expect(callArgs.messages[0].content[0].text).toContain(
        'Focus on handwritten text only'
      );
    });

    it('should include image in message content as a data URL', async () => {
      const mockResponse = {
        text: 'Extracted text',
        usage: { totalTokens: 150 },
      };
      (generateText as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({
          image: VALID_IMAGE,
        }),
      });

      await POST(request);

      const callArgs = (generateText as jest.Mock).mock.calls[0][0];
      expect(callArgs.messages[0].content).toHaveLength(2);
      expect(callArgs.messages[0].content[1].type).toBe('image');
      expect(callArgs.messages[0].content[1].image).toBe(
        `data:image/png;base64,${VALID_IMAGE}`
      );
    });

    it('should sniff image bytes for data URLs instead of trusting declared media type', async () => {
      const mockResponse = {
        text: 'Extracted text',
        usage: { totalTokens: 150 },
      };
      (generateText as jest.Mock).mockResolvedValueOnce(mockResponse);

      const dataUrl = `data:image/jpeg;base64,${VALID_IMAGE}`;
      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({
          image: dataUrl,
        }),
      });

      await POST(request);

      const callArgs = (generateText as jest.Mock).mock.calls[0][0];
      expect(callArgs.messages[0].content[1].image).toBe(
        `data:image/png;base64,${VALID_IMAGE}`
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication failures', async () => {
      const { handleAuthorizationV2, AuthorizationError } =
        require('@/lib/handleAuthorization');
      handleAuthorizationV2.mockRejectedValueOnce(
        new AuthorizationError('Unauthorized', 401)
      );

      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({
          image: VALID_IMAGE,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
      expect(generateText).not.toHaveBeenCalled();
    });

    it('should reject missing image data with 400', async () => {
      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing or invalid image data');
      expect(generateText).not.toHaveBeenCalled();
    });

    it('should reject empty image data with 400', async () => {
      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({ image: '   ' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing or invalid image data');
      expect(generateText).not.toHaveBeenCalled();
    });

    it('should reject invalid base64 image data with 400', async () => {
      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({ image: 'not!!!base64' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Image data is not valid base64');
      expect(generateText).not.toHaveBeenCalled();
    });

    it('should authenticate before validating the image payload', async () => {
      const { handleAuthorizationV2, AuthorizationError } =
        require('@/lib/handleAuthorization');
      handleAuthorizationV2.mockRejectedValueOnce(
        new AuthorizationError('Unauthorized', 401)
      );

      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({ image: 'not!!!base64' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
      expect(generateText).not.toHaveBeenCalled();
    });

    it('should handle AI service errors with 500', async () => {
      (generateText as jest.Mock).mockRejectedValueOnce(
        new Error('AI service unavailable')
      );

      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({
          image: VALID_IMAGE,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('AI service unavailable');
    });

    it('should handle errors with status codes', async () => {
      const error = new Error('Rate limit exceeded') as any;
      error.status = 429;
      (generateText as jest.Mock).mockRejectedValueOnce(error);

      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({
          image: VALID_IMAGE,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
    });

    it('should still return text when token increment fails', async () => {
      const mockResponse = {
        text: 'Extracted text',
        usage: { totalTokens: 150 },
      };
      (generateText as jest.Mock).mockResolvedValueOnce(mockResponse);
      (incrementAndLogTokenUsage as jest.Mock).mockRejectedValueOnce(
        new Error('Token increment failed')
      );

      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({
          image: VALID_IMAGE,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.text).toBe('Extracted text');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty instructions string', async () => {
      const mockResponse = {
        text: 'Extracted text',
        usage: { totalTokens: 150 },
      };
      (generateText as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({
          image: VALID_IMAGE,
          instructions: '',
        }),
      });

      await POST(request);

      const callArgs = (generateText as jest.Mock).mock.calls[0][0];
      expect(callArgs.messages[0].content[0].text).toContain(
        'Extract all text from the image comprehensively'
      );
    });

    it('should handle whitespace-only instructions', async () => {
      const mockResponse = {
        text: 'Extracted text',
        usage: { totalTokens: 150 },
      };
      (generateText as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({
          image: VALID_IMAGE,
          instructions: '   ',
        }),
      });

      await POST(request);

      const callArgs = (generateText as jest.Mock).mock.calls[0][0];
      expect(callArgs.messages[0].content[0].text).toContain(
        'Extract all text from the image comprehensively'
      );
    });

    it('should handle missing request body with 400', async () => {
      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing or invalid image data');
    });

    it('should handle invalid JSON in request body with an error response', async () => {
      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(data).toHaveProperty('error');
    });

    it('should handle zero tokens', async () => {
      const mockResponse = {
        text: 'Extracted text',
        usage: { totalTokens: 0 },
      };
      (generateText as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({
          image: VALID_IMAGE,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(incrementAndLogTokenUsage).toHaveBeenCalledWith(
        'test-user-id',
        0
      );
    });

    it('should estimate tokens when usage metadata is missing', async () => {
      const mockResponse = {
        text: 'Extracted text',
      };
      (generateText as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/vision', {
        method: 'POST',
        body: JSON.stringify({
          image: VALID_IMAGE,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.text).toBe('Extracted text');
      expect(incrementAndLogTokenUsage).toHaveBeenCalledWith(
        'test-user-id',
        Math.ceil('Extracted text'.length / 4)
      );
    });
  });
});
