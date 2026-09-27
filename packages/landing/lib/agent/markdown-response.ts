import { NextResponse } from 'next/server';
import { getSiteBaseUrl } from '@/lib/site-url';

export { getSiteBaseUrl };

export function markdownResponse(body: string, status = 200): NextResponse {
  return new NextResponse(body, {
    status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
    },
  });
}
