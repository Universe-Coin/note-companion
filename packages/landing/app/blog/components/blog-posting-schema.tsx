import { BlogPost } from '@/types/blog';

interface BlogPostingSchemaProps {
  post: BlogPost;
}

const siteUrl = 'https://www.notecompanion.ai';

/** Frontmatter dates are plain YYYY-MM-DD; Article schema requires a timezone. */
function toIsoDateTime(date: string): string {
  return date.includes('T') ? date : `${date}T00:00:00Z`;
}

export function BlogPostingSchema({ post }: BlogPostingSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.headline ?? post.title,
    description: post.excerpt,
    datePublished: toIsoDateTime(post.date),
    dateModified: toIsoDateTime(post.updated ?? post.date),
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
