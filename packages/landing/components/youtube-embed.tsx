'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

type YouTubeEmbedProps = {
  videoId: string;
  title: string;
  className?: string;
  /** Use for above-the-fold thumbnails (e.g. hero). */
  thumbnailPriority?: boolean;
};

export function YouTubeEmbed({
  videoId,
  title,
  className,
  thumbnailPriority = false,
}: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const embedSrc = `https://www.youtube.com/embed/${videoId}?iv_load_policy=3&rel=0&modestbranding=1&playsinline=1&autoplay=1`;

  if (isPlaying) {
    return (
      <div
        className={cn(
          'relative aspect-video overflow-hidden rounded-2xl ring-1 ring-border shadow-sm',
          className
        )}
      >
        <iframe
          title={title}
          src={embedSrc}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
          suppressHydrationWarning
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsPlaying(true)}
      className={cn(
        'group relative aspect-video w-full overflow-hidden rounded-2xl ring-1 ring-border shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      aria-label={`Play video: ${title}`}
    >
      <Image
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={thumbnailPriority}
        loading={thumbnailPriority ? undefined : 'lazy'}
        className="object-cover"
      />
      <span
        className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35"
        aria-hidden
      />
      <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform group-hover:scale-105 motion-reduce:group-hover:scale-100">
          <Play className="h-7 w-7 fill-current pl-1" />
        </span>
      </span>
    </button>
  );
}
