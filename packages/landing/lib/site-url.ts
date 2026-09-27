/** Canonical public marketing origin (apex, no trailing slash). */
export function getSiteBaseUrl(): string {
  let base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://notecompanion.ai');

  base = base.replace(/\/$/, '');
  base = base.replace(/^https:\/\/www\./i, 'https://');
  return base;
}

export const HOME_OG_IMAGE_PATH = '/notecompanion.png';
