import { NextResponse } from 'next/server';
import { getGitHubStars } from '@/lib/github';

export async function GET() {
  const stars = await getGitHubStars();

  return NextResponse.json(
    { stars },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}
