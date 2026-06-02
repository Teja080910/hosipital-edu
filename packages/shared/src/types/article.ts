export interface ArticleDto {
  id: string;
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  content: Record<string, string>;
  coverImage?: string;
  categoryId?: string;
  authorId: string;
  authorName?: string;
  isPublished: boolean;
  publishedAt?: string;
  isSubscriberOnly: boolean;
  tags: string[];
  createdAt: string;
}

export interface ArticleCategoryDto {
  id: string;
  slug: string;
  name: Record<string, string>;
}