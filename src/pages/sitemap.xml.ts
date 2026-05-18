import type { APIContext } from "astro";

import { getArticleUrl, getPublishedArticles } from "@/lib/articles";
import { SITE } from "@/lib/site";

function createUrlEntry(path: string): string {
  const url = new URL(path, SITE.url).toString();
  return `  <url>\n    <loc>${url}</loc>\n  </url>`;
}

export async function GET(_context: APIContext) {
  const articles = await getPublishedArticles();
  const publicPaths = ["/", ...articles.map((article) => getArticleUrl(article.slug))];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPaths
    .map(createUrlEntry)
    .join("\n")}\n</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
