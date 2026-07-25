import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/handleAuthorization';
import {
  extractUserId,
  verifyUnkeyApiKeyWithFallbacks,
} from '@/lib/unkey-client';

export async function POST(request: NextRequest) {
  try {
    // Skip key verification if user management is disabled
    // This allows self-hosting without Unkey setup
    if (process.env.ENABLE_USER_MANAGEMENT !== 'true') {
      return NextResponse.json(
        {
          message: 'Valid key',
          userId: 'user',
        },
        { status: 200 }
      );
    }

    const token = getToken(request);

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    let result = null;
    let extractedError = null;

    try {
      const verification = await verifyUnkeyApiKeyWithFallbacks(token);
      result = verification.result;
      extractedError = verification.error;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Unkey verification error:', error);
    }

    if (extractedError || !result || !result.valid) {
      console.log('Key verification failed:', {
        hasResult: !!result,
        resultValid: result?.valid,
        error: extractedError?.message || extractedError?.detail,
      });
      return NextResponse.json(
        {
          error: 'Invalid key',
          message: 'Please provide a valid license key',
        },
        { status: 401 }
      );
    }

    const userId = extractUserId(result);
    return NextResponse.json(
      {
        message: 'Valid key',
        userId: userId || 'unknown',
      },
      { status: 200 }
    );
  } catch (error) {
    console.log('Error checking key', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Invalid key' }, { status: 401 });
  }
}
