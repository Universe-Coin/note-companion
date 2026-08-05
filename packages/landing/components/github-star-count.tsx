'use client';

import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

const FALLBACK_STARS = 530;

type GitHubStarCountProps = {
  className?: string;
};

export function GitHubStarCount({ className }: GitHubStarCountProps) {
  const [stars, setStars] = useState(FALLBACK_STARS);

  useEffect(() => {
    const controller = new AbortController();

    void fetch('/api/github-stars', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { stars?: number } | null) => {
        if (data?.stars) {
          setStars(data.stars);
        }
      })
      .catch(() => {
        // Keep fallback on network errors or abort.
      });

    return () => controller.abort();
  }, []);

  return (
    <a
      href="https://github.com/Nexus-JPF/note-companion"
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ??
        'inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80'
      }
    >
      <Star className="h-4 w-4" />
      <span>{stars}</span>
    </a>
  );
}
