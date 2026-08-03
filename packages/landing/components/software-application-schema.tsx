const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Note Companion',
  url: 'https://www.notecompanion.ai',
  image: 'https://www.notecompanion.ai/notecompanion.png',
  description:
    'AI-powered Obsidian plugin that transcribes audio and YouTube videos, chats with your vault, and auto-organizes notes into folders, tags, and titles.',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Windows, macOS, Linux',
  downloadUrl: 'https://obsidian.md/plugins?id=fileorganizer2000',
  codeRepository: 'https://github.com/Nexus-JPF/note-companion',
  author: {
    '@type': 'Organization',
    name: 'Note Companion',
    url: 'https://www.notecompanion.ai',
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Self-hosted',
      price: '0',
      priceCurrency: 'USD',
      category: 'Free',
    },
    {
      '@type': 'Offer',
      name: 'Subscription (monthly)',
      price: '15',
      priceCurrency: 'USD',
      category: 'Subscription',
    },
    {
      '@type': 'Offer',
      name: 'Subscription (yearly)',
      price: '119',
      priceCurrency: 'USD',
      category: 'Subscription',
    },
  ],
};

export function SoftwareApplicationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
