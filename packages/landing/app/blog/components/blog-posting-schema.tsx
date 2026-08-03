import { BlogPost } from '@/types/blog';

interface BlogPostingSchemaProps {
  post: BlogPost;
}

const siteUrl = 'https://www.notecompanion.ai';

export function BlogPostingSchema({ post }: BlogPostingSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.headline ?? post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    ...(post.image && { image: `${siteUrl}${post.image}` }),
    author: {
      '@type': 'Organization',
      name: 'Note Companion',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Note Companion',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/notecompanion.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
