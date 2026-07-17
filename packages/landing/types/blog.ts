export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogPostMetadata {
  title: string;
  headline?: string;
  slug: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  excerpt: string;
  image?: string;
  faq?: BlogFaqItem[];
}

export interface BlogPost extends BlogPostMetadata {
  content: string;
  htmlContent: string;
}
