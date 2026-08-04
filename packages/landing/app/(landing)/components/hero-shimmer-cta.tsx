'use client';

import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Purple fill: brighter mid-tones so the pill reads on dark hero; still deeper at bottom. */
const heroCtaFill =
  'radial-gradient(ellipse 80% 50% at 50% 118%, hsl(var(--primary)) 0%, hsl(258 46% 44%) 48%, hsl(258 40% 26%) 100%)';

type HeroShimmerCtaProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function HeroShimmerCta({
  href,
  children,
  className,
}: HeroShimmerCtaProps) {
  const cssVars = {
    '--spread': '90deg',
    '--radius': '100px',
    '--cut': '2px',
    '--hero-shimmer-speed': '2.25s',
    '--shimmer-peak': 'color-mix(in srgb, white 70%, hsl(var(--primary)) 30%)',
  } as CSSProperties;

  const shimmerBackground =
    'conic-gradient(from calc(270deg - (var(--spread) * 0.5)), transparent 0deg, var(--shimmer-peak) var(--spread), transparent var(--spread))';

  return (
    <a
      href={href}
      className={cn(
        'group relative mx-auto inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap px-8 py-3.5 text-sm font-semibold text-primary-foreground',
        'rounded-[var(--radius)] transition-all duration-300',
        'hover:scale-[1.04] hover:shadow-[0_0_36px_8px_hsl(var(--primary)/0.45)] motion-reduce:hover:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      style={{
        ...cssVars,
        background: heroCtaFill,
      }}
    >
      <div className="hero-shimmer-layer pointer-events-none absolute inset-0 overflow-visible [container-type:size]">
        {/* cqw/cqh from this layer (not the <a>) so the link is not size-contained. */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square max-w-none -translate-x-1/2 -translate-y-1/2"
          style={{ width: 'max(100cqw, 100cqh)' }}
        >
          <div
            className="hero-shimmer-spin absolute inset-[-100%] animate-hero-shimmer-spin [transform-origin:center]"
            style={{ background: shimmerBackground }}
          />
        </div>
      </div>
      <div
        className="pointer-events-none absolute rounded-[var(--radius)] [inset:var(--cut)]"
        style={{ background: heroCtaFill }}
      />
      <span className="relative z-10 flex items-center gap-2 leading-none tracking-tight">
        {children}
      </span>
    </a>
  );
}
