# Agent Instructions

## Required Reading

Before working, read:

- `SPEC.md`
- `TODO.md`
- `README.md`
- `AGENT.md`

## Scope Rules

- Implement only the current scope defined in `SPEC.md`.
- Do not implement `TODO.md` Later items unless the user explicitly requests them.
- Keep the project centered on Git-managed Markdown publishing.
- Do not add a CMS, database, authentication, admin panel, or comment system for `v0.1.0`.
- Keep changes small and easy to review.

## Implementation Rules

- Prefer Astro, TypeScript, Astro Content Collections, Markdown or MDX, pnpm, GitHub Actions, Cloudflare Workers, and Wrangler.
- Generate SEO metadata, canonical URLs, OGP, Twitter cards, structured data, RSS, sitemap, and robots output on the Astro side.
- GitHub Actions should only install, check, build, and deploy.
- Deploy only from pushes to `main`.
- Pull requests must run checks but must not deploy.
- Treat `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub Secrets.
- Treat `PUBLIC_GA_MEASUREMENT_ID` as optional public configuration.

## Documentation Rules

- Keep `README.md` consistent with actual behavior.
- If commands, article format, or deployment behavior change, update `README.md`.
- Keep deferred work in `TODO.md` instead of expanding the current scope.

## Verification Rules

Before claiming completion, run the available build/check/test commands.

Expected commands after implementation:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

If a command cannot be run, explain why and what remains unverified.
