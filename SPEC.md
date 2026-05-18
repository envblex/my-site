# My Blog Specification

## Purpose

Build a personal blog at `env.skin` where articles are written locally as Markdown and published by pushing to GitHub.

The project must use Git as the publishing workflow. It must not include a CMS, database, admin panel, authentication, or comment system in the initial version.

## Background or Source Notes Summary

The blog exists so the owner can publish thoughts, development records, and design notes under their own domain and control. Zenn and Qiita are useful for technical articles, but they are not the desired personal space for this project. Article source and assets should stay in this repository where practical.

The intended publishing flow is:

1. Clone the repository.
2. Write Markdown or MDX articles in `src/content/articles`.
3. Push to GitHub.
4. GitHub Actions installs dependencies, checks the project, builds with Astro, and deploys to Cloudflare Workers from `main`.
5. The site is reflected at `https://env.skin`.

## Current Scope

This scope is `v0.1.0`.

The initial implementation must create a minimal, production-publishable static blog using:

- Astro
- TypeScript
- Markdown or MDX
- Astro Content Collections
- GitHub Actions
- Cloudflare Workers
- Wrangler
- pnpm

The site must include:

- `/`
- `/article/[slug]`
- `/404`
- `/feed.xml`
- `/sitemap.xml`
- `/robots.txt`
- GitHub Actions checks and deployment
- Optional Google Analytics insertion when configured

## Non-Goals

The current scope must not include:

- CMS or admin panel
- Database
- Authentication
- Comment function
- Site search
- Tag archive pages
- Article series function
- Dark mode
- Automatic OGP image generation
- Direct SEO processing inside GitHub Actions

## User Stories or Usage Flow

- As the site owner, I can create a new article by adding a Markdown or MDX file under `src/content/articles`.
- As the site owner, I can mark an article as draft and know it will not appear in production pages, RSS, or sitemap output.
- As the site owner, I can push to `main` and have GitHub Actions deploy the built site to Cloudflare Workers.
- As the site owner, I can open a pull request and have GitHub Actions run checks without deploying.
- As a reader, I can view the homepage, open published articles, browse article tags shown on the homepage, and subscribe via RSS.
- As a crawler, I can read sitemap and robots files generated for the published site.

## Functional Requirements

### Article Content

- Articles must live in `src/content/articles`.
- Articles must be written as Markdown or MDX.
- Article frontmatter must support this shape:

```markdown
---
title: "Article Title"
description: "Article Description"
slug: "article-slug"
publishedAt: "2026-05-18"
updatedAt: "2026-05-18"
tags: ["astro", "cloudflare"]
draft: false
---
Body Text
```

- `title` is required and must not be empty.
- `description` is required and must not be empty.
- `slug` is required and must not be empty.
- `publishedAt` is required.
- `updatedAt` is optional but, when present, must be displayed on article pages.
- `tags` must be supported.
- `draft` must be supported and defaults to `false` if omitted.
- Articles with `draft: true` must not be published in production listings, article routes, RSS, or sitemap output.
- Duplicate slugs are prohibited and must fail validation, type checking, or build.

### Homepage `/`

The homepage must show:

- Site name
- Brief self-introduction
- Latest published articles list
- Tag list for published articles
- RSS link

The homepage must not list draft articles.

### Article Page `/article/[slug]`

Each published article page must show:

- Article title
- Publication date
- Update date when available
- Tags
- Body content

Each article page must generate:

- HTML `title`
- Meta description
- Canonical URL
- OGP metadata
- Twitter card metadata
- Structured data suitable for a blog article

Draft articles must not generate public article pages in production.

### 404 Page `/404`

The 404 page must show:

- A clear explanation that the requested page does not exist
- A link back to `/`

Missing article slugs must resolve to the 404 behavior.

### RSS `/feed.xml`

RSS must include only published articles.

Each feed item must include at least:

- Title
- Description
- Link
- Publication date

### Sitemap `/sitemap.xml`

The sitemap must include only public pages and published articles.

Draft articles must not appear in the sitemap.

### Robots `/robots.txt`

The robots file must allow normal crawling and reference the sitemap URL for `https://env.skin/sitemap.xml`.

### Google Analytics

- Google Analytics is optional.
- The Google tag must be inserted only when `PUBLIC_GA_MEASUREMENT_ID` is set.
- The site must build successfully when `PUBLIC_GA_MEASUREMENT_ID` is not set.
- `PUBLIC_GA_MEASUREMENT_ID` is public configuration and does not need secret handling.

### GitHub Actions

GitHub Actions must:

- Run on pull requests without deploying.
- Run on pushes to `main` and deploy only after checks pass.
- Use pnpm for dependency installation.
- Run install, lint, typecheck, and build steps.
- Deploy to Cloudflare Workers using Wrangler only on pushes to `main`.

Required GitHub Secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Optional configuration:

- `PUBLIC_GA_MEASUREMENT_ID`

## Output Files or Interfaces

The implementation is expected to provide or configure:

- Astro project files
- `src/content/articles` content collection
- Homepage route
- Article route at `/article/[slug]`
- 404 page
- RSS endpoint at `/feed.xml`
- Sitemap output at `/sitemap.xml`
- Robots output at `/robots.txt`
- Shared SEO metadata generation
- Optional GA tag injection
- Cloudflare Workers and Wrangler configuration
- GitHub Actions workflow for checks and deployment

## Constraints

- The site must be primarily light mode.
- Design must be minimalist and prioritize readability.
- Code blocks must be easy to read.
- Layout must work on mobile and desktop.
- Styling should be inspired by Google Material Design's use of spacing, rounded corners, and icons.
- Animation must be minimal.
- GitHub Actions must not directly perform SEO optimization; Astro must generate metadata, RSS, sitemap, robots, and structured data.
- Cloudflare API credentials must be stored only in GitHub Secrets.

## Completion Criteria

The implementation is complete when:

- A published article in `src/content/articles` appears on `/`, `/article/[slug]`, `/feed.xml`, and `/sitemap.xml`.
- A draft article does not appear on `/`, `/article/[slug]`, `/feed.xml`, or `/sitemap.xml` in production output.
- Missing required article fields fail validation or build.
- Duplicate slugs fail validation or build.
- The site builds without `PUBLIC_GA_MEASUREMENT_ID`.
- The GA tag is present only when `PUBLIC_GA_MEASUREMENT_ID` is set.
- `/404` exists and provides a link to `/`.
- GitHub Actions deploys only from pushes to `main`.
- Pull requests run checks but do not deploy.

## Test/Check Expectations

Implementation agents must run the available checks before claiming completion. At minimum, the project should support:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

If additional tests are added, they must be documented in `README.md` and run before completion.
