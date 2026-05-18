import { getCollection, type CollectionEntry } from "astro:content";

export type Article = CollectionEntry<"articles">;

export function assertUniqueSlugs(articles: Article[]): void {
  const seen = new Map<string, string>();

  for (const article of articles) {
    const existingId = seen.get(article.slug);
    if (existingId) {
      throw new Error(
        `Duplicate article slug "${article.slug}" in ${existingId} and ${article.id}`
      );
    }
    seen.set(article.slug, article.id);
  }
}

export async function getAllArticles(): Promise<Article[]> {
  const articles = await getCollection("articles");
  assertUniqueSlugs(articles);
  return articles;
}

export async function getPublishedArticles(): Promise<Article[]> {
  const articles = await getAllArticles();

  return articles
    .filter((article) => !article.data.draft)
    .sort(
      (a, b) =>
        b.data.publishedAt.getTime() - a.data.publishedAt.getTime() ||
        a.data.title.localeCompare(b.data.title)
    );
}

export function getArticleUrl(slug: string): string {
  return `/article/${slug}/`;
}

export function collectTags(articles: Article[]): string[] {
  return Array.from(new Set(articles.flatMap((article) => article.data.tags))).sort(
    (a, b) => a.localeCompare(b)
  );
}
