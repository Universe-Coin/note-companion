'use client'

import dynamic from 'next/dynamic'

const Demo = dynamic(
  () => import('../demo/demo').then((mod) => ({ default: mod.Demo })),
  { ssr: false }
)

export function DemoSection() {
  return (
    <div className="hidden w-full max-w-[1200px] px-6 py-20 md:py-28 bg-muted/50 backdrop-blur-sm lg:block">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          What it looks like in your vault
        </h2>
        <p className="text-lg text-muted-foreground">
          Experience how Note Companion transforms your workflow
        </p>
      </div>
      <Demo />
    </div>
  )
}
