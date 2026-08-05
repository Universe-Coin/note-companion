'use client';

import dynamic from 'next/dynamic';

const FaqSection = dynamic(() =>
  import('./faq-section').then((mod) => ({ default: mod.FaqSection }))
);

export function FaqSectionLazy() {
  return <FaqSection />;
}
