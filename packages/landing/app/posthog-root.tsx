'use client'

import { useEffect, useState } from 'react'
import { PostHogProvider } from 'posthog-js/react'
import PostHogPageView from './PostHogPageView'

type PostHogClient = typeof import('posthog-js').default

export default function PostHogRoot() {
  const [client, setClient] = useState<PostHogClient | null>(null)

  useEffect(() => {
    const initPostHog = () => {
      void import('posthog-js').then(({ default: posthog }) => {
        posthog.init('phc_f004Gv83AkfXh2WJ9XQ7zqaujgajgiS3YXEYa52Evfp', {
          api_host: '/ingest',
          ui_host: 'https://us.posthog.com',
          capture_pageview: false,
          capture_pageleave: true,
          disable_session_recording: true,
          capture_performance: { web_vitals: true },
        })
        setClient(posthog)
      })
    }

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(initPostHog, { timeout: 3000 })
      return () => window.cancelIdleCallback(id)
    }

    const timeoutId = window.setTimeout(initPostHog, 2000)
    return () => window.clearTimeout(timeoutId)
  }, [])

  if (!client) {
    return null
  }

  return (
    <PostHogProvider client={client}>
      <PostHogPageView />
    </PostHogProvider>
  )
}
