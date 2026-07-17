import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import remarkGfm from 'remark-gfm';
import { BlogPost, BlogPostMetadata } from '@/types/blog';

const postsDirectory = path.join(process.cwd(), 'content/blog');

/** Strip the leading markdown H1 — the page template renders a single H1 from frontmatter. */
function stripLeadingH1(content: string): string {
  return content.replace(/^#\s+.+\n+/, '');
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content: rawContent } = matter(fileContents);
      const content = stripLeadingH1(rawContent);

      // Process markdown to HTML
      const processedContent = remark()
        .use(remarkGfm)
        .use(remarkHtml)
        .processSync(content);

      return {
        ...(data as BlogPostMetadata),
        content,
        htmlContent: String(processedContent),
      } as BlogPost;
    })
    .filter((post) => post.slug) // Filter out posts without required fields
    .sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });

  return allPostsData;
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find((post) => post.slug === slug) || null;
}

export function getPostsByCategory(category: string): BlogPost[] {
  const posts = getAllPosts();
  return posts.filter((post) => post.category === category);
}

export function getAllCategories(): string[] {
  const posts = getAllPosts();
  const categories = new Set(posts.map((post) => post.category));
  return Array.from(categories).sort();
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const posts = getAllPosts();
  const current = posts.find((post) => post.slug === slug);
  if (!current) {
    return [];
  }

  const normalizeTag = (tag: string) =>
    tag.toLowerCase().replace(/[\s_-]+/g, "");

  const currentTags = new Set(current.tags.map(normalizeTag));

  const scored = posts
    .filter((post) => post.slug !== slug)
    .map((post) => {
      const sharedTags = post.tags.filter((tag) =>
        currentTags.has(normalizeTag(tag))
      ).length;
      const sameCategory = post.category === current.category ? 1 : 0;
      return { post, score: sharedTags * 2 + sameCategory };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1));

  return scored.slice(0, limit).map(({ post }) => post);
}
