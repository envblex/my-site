import rss from "@astrojs/rss";
import type { APIContext } from "astro";

import { getArticleUrl, getPublishedArticles } from "@/lib/articles";
import { SITE } from "@/lib/site";

export async function GET(context: APIContext) {
  const articles = await getPublishedArticles();

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      link: getArticleUrl(article.slug),
      pubDate: article.data.publishedAt
    }))
  });
}
