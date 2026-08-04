'use client'

import dynamic from 'next/dynamic'

const PostHogRoot = dynamic(() => import('./posthog-root'), {
  ssr: false,
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PostHogRoot />
      {children}
    </>
  )
}
