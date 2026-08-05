import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { GitHubStarCount } from '@/components/github-star-count';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <div className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2.5 text-foreground"
                aria-label="Note Companion home"
              >
                <Image
                  src="/notecompanion.png"
                  alt=""
                  width={30}
                  height={30}
                />
                <span className="text-lg font-semibold tracking-tight sm:text-xl">
                  Note Companion
                </span>
              </Link>
              <div className="flex items-center space-x-4">
                <a
                  href="https://www.youtube.com/watch?v=NQjZcL4sThs&list=PLgRcC-DFR5jdUxbSBuNeymwYTH_FSVxio"
                  className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  tutorials
                </a>

                <Link
                  href="/blog"
                  className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  blog
                </Link>

                <GitHubStarCount />
                <Link href="https://accounts.notecompanion.ai/sign-up">
                  <Button variant="default" size="sm">
                    Start
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full">{children}</div>
      </div>
    </div>
  );
}
