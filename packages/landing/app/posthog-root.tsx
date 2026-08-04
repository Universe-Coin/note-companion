'use client'

import { useEffect, useState } from 'react'
import { PostHogProvider } from 'posthog-js/react'
import PostHogPageView from './PostHogPageView'

type PostHogClient = typeof import('posthog-js').default

export default function PostHogRoot() {
  const [client, setClient] = useState<PostHogClient | null>(null)

  useEffect(() => {
    void import('posthog-js').then(({ default: posthog }) => {
      posthog.init('phc_f004Gv83AkfXh2WJ9XQ7zqaujgajgiS3YXEYa52Evfp', {
        api_host: '/ingest',
        ui_host: 'https://us.posthog.com',
        capture_pageview: false,
        capture_pageleave: true,
        disable_session_recording: true,
      })
      setClient(posthog)
    })
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
