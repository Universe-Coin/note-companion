'use client';

import dynamic from 'next/dynamic';

const PricingCards = dynamic(() =>
  import('./pricing-cards').then((mod) => ({ default: mod.PricingCards }))
);

export function PricingSection() {
  return <PricingCards />;
}
