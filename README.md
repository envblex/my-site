# My Blog

A personal blog for `blog.env.skin`.

This project publishes writing from Markdown or MDX files stored in the repository. There is no CMS. Git is the editing and publishing workflow: write locally, commit, push, build, and deploy.

## What This Solves

The goal is to keep thoughts, development records, and design notes under the owner's own domain and source control. The site should be small, static, readable, and easy to publish through GitHub Actions and Cloudflare Workers.

## Expected Workflow

1. Clone the repository.
2. Install dependencies with `pnpm install`.
3. Add or edit articles in `src/content/articles`.
4. Run `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
5. Commit and push changes.
6. Pull requests run checks only.
7. Pushes to `main` build and deploy to Cloudflare Workers.

## Commands

- `pnpm dev`: start the local Astro development server
- `pnpm lint`: run `astro check`
- `pnpm typecheck`: run `astro check`
- `pnpm build`: build the static site into `dist`
- `pnpm preview`: preview the built site locally

## Article Format

Articles use frontmatter like this:

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

Required fields:

- `title`
- `description`
- `slug`
- `publishedAt`

Draft articles use `draft: true`. Drafts must not appear in production article pages, homepage listings, RSS, or sitemap output.

## Pages

The initial site provides:

- `/`: homepage with site name, short profile, latest articles, tags, and RSS link
- `/article/[slug]`: published article pages
- `/404`: not found page
- `/feed.xml`: RSS feed
- `/sitemap.xml`: search engine sitemap
- `/robots.txt`: crawler rules

## Deployment

GitHub Actions is responsible for installing dependencies, checking the project, building with Astro, and deploying to Cloudflare Workers from `main`.

Required GitHub Secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Optional environment variable:

- `PUBLIC_GA_MEASUREMENT_ID`

Google Analytics is inserted only when `PUBLIC_GA_MEASUREMENT_ID` is set. The site must still build when it is unset.

## Important Files

- `SPEC.md`: current implementation scope and acceptance criteria
- `TODO.md`: deferred work and open questions
- `AGENT.md`: rules for future implementation and review agents
- `src/content/articles`: Markdown and MDX article source files
- `src/content/config.ts`: Astro Content Collections schema
- `src/pages`: Astro routes for pages, RSS, and sitemap output
- `public/robots.txt`: crawler rules and sitemap reference
- `wrangler.toml`: Cloudflare Workers static assets deployment configuration
- `.github/workflows/deploy.yml`: pull request checks and `main` deployment workflow

## Out of Scope for Now

The first version intentionally excludes tag archive pages, search, automatic OGP image generation, comments, an administration panel, dark mode, and article series features.
