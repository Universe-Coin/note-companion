import { Button } from '@/components/ui/button';
import { HeroShimmerCta } from './components/hero-shimmer-cta';
import { YouTubeEmbed } from '@/components/youtube-embed';
import { ArrowRight, Play } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 md:py-20 lg:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
        <div className="hero-stagger flex flex-col text-center lg:text-left">
          <p className="mb-6 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            AI plugin for Obsidian
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span>Keep your Vault</span>
            <span className="block text-primary">Organized</span>
          </h1>
          <p className="mt-4 text-lg font-medium leading-snug tracking-tight text-muted-foreground sm:text-xl">
            without the hassle
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Note Companion is an AI-powered Obsidian plugin that improves your
            workflow by automatically organizing and formatting your notes—so you
            don&apos;t have to.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <HeroShimmerCta
              href="https://accounts.notecompanion.ai/sign-up"
              className="lg:mx-0"
            >
              Get Started
              <ArrowRight className="h-4 w-4" aria-hidden />
            </HeroShimmerCta>
            <a href="#demo" className="lg:hidden">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-primary/25 hover:border-primary/40 hover:bg-primary/5"
              >
                <Play className="h-4 w-4" />
                Watch demo
              </Button>
            </a>
          </div>
        </div>

        <div id="demo" className="hero-fade-up relative w-full scroll-mt-24">
          <YouTubeEmbed
            videoId="X4yN4ykTJIo"
            title="Note Companion demo video"
          />
        </div>
      </div>
    </div>
  );
}
