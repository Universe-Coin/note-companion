import { NextRequest, NextResponse } from 'next/server';
import { db, UserUsageTable } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { getToken } from '@/lib/handleAuthorization';
import { extractUserId, verifyUnkeyApiKey } from '@/lib/unkey-client';

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const { result } = await verifyUnkeyApiKey(token);

    if (!result || !result.valid) {
      return NextResponse.json(
        {
          error: 'Invalid key',
          message: 'Please provide a valid license key',
        },
        { status: 401 }
      );
    }

    const userId = extractUserId(result);
    if (!userId) {
      return NextResponse.json(
        {
          error: 'Invalid key',
          message: 'No user ID found in verification result',
        },
        { status: 401 }
      );
    }

    const userUsage = await db
      .select()
      .from(UserUsageTable)
      .where(eq(UserUsageTable.userId, userId))
      .limit(1);

    if (!userUsage.length) {
      return NextResponse.json({
        tokenUsage: 0,
        maxTokenUsage: 100000,
        audioTranscriptionMinutes: 0,
        maxAudioTranscriptionMinutes: 0,
        subscriptionStatus: 'inactive',
        currentPlan: 'Free Plan',
        isActive: false,
      });
    }

    const isActive =
      userUsage[0].billingCycle === 'lifetime' ||
      userUsage[0].subscriptionStatus === 'active';

    return NextResponse.json({
      tokenUsage: userUsage[0].tokenUsage || 0,
      maxTokenUsage: userUsage[0].maxTokenUsage || 100000,
      audioTranscriptionMinutes: userUsage[0].audioTranscriptionMinutes || 0,
      maxAudioTranscriptionMinutes:
        userUsage[0].maxAudioTranscriptionMinutes || 0,
      subscriptionStatus: userUsage[0].subscriptionStatus || 'inactive',
      currentPlan: userUsage[0].currentPlan || 'Free Plan',
      isActive,
    });
  } catch (error) {
    console.error('Error fetching public usage data:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch usage data',
      },
      { status: 500 }
    );
  }
}
