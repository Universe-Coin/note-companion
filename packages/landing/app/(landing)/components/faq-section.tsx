'use client';

import { Plus, Minus } from 'lucide-react';
import { useId, useState } from 'react';
import { FAQ_ITEMS } from '../data/faq-items';

function FaqItem({
  question,
  answer,
  panelId,
}: {
  question: string;
  answer: string;
  panelId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonId = `${panelId}-trigger`;

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-card shadow-sm transition-colors duration-200 ${
        isOpen
          ? 'border-primary/30 ring-1 ring-primary/10'
          : 'border-border hover:border-primary/20'
      }`}
    >
      <button
        id={buttonId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-6 sm:py-5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="min-w-0 flex-1 font-semibold leading-snug text-foreground">
          {question}
        </span>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors"
          aria-hidden
        >
          {isOpen ? (
            <Minus className="h-4 w-4" strokeWidth={2} />
          ) : (
            <Plus className="h-4 w-4" strokeWidth={2} />
          )}
        </span>
      </button>
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="border-t border-border bg-muted/30 px-5 py-4 sm:px-6 sm:py-5"
        >
          <div
            className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base [&_strong]:font-semibold [&_strong]:text-foreground"
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        </div>
      )}
    </div>
  );
}

export function FaqSection() {
  const baseId = useId().replace(/:/g, '');

  return (
    <section
      className="w-full bg-muted/50 py-20 md:py-28"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <h2
            id="faq-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            FAQ
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Setup, models, privacy, and how to get help.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:gap-4">
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              panelId={`faq-panel-${baseId}-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
