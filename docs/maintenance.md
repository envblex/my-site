# Maintenance

## Project Structure

```
my-blog/
├── apps/
│   └── latex-preview/     # React SPA (apps.env.skin)
│       ├── src/           # React components and styles
│       ├── index.html
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── wrangler.toml  # Cloudflare Workers config for apps.env.skin
│       └── package.json
├── src/                   # Astro blog (env.skin)
│   ├── content/
│   │   ├── articles/      # Markdown/MDX article source files
│   │   └── config.ts      # Content Collections schema
│   ├── layouts/
│   ├── lib/
│   ├── pages/             # Astro routes
│   └── styles/
├── public/
├── .github/workflows/
│   └── deploy.yml         # CI/CD for both blog and app
├── wrangler.toml          # Cloudflare Workers config for env.skin
└── package.json
```

## Local Development

### Blog (env.skin)

```sh
# Start the Astro dev server with hot reload
pnpm dev

# Lint (astro check)
pnpm lint

# Typecheck (astro check)
pnpm typecheck

# Build to dist/
pnpm build

# Preview the built site locally
pnpm preview
```

The dev server runs at `http://localhost:4321` by default.

### App (apps.env.skin / latex-preview)

```sh
cd apps/latex-preview

# Start the Vite dev server with hot reload
pnpm dev

# Typecheck (tsc --noEmit)
pnpm typecheck

# Build to dist/
pnpm build

# Preview the built app locally
pnpm preview
```

The Vite dev server runs at `http://localhost:5173` by default.

### Factory Reset

Remove generated artifacts:

```sh
rm -rf dist/ apps/latex-preview/dist/ apps/latex-preview/node_modules/ node_modules/
```

Then reinstall and rebuild:

```sh
pnpm install && pnpm build
cd apps/latex-preview && pnpm install && pnpm build
```

## Full CI Simulation

Run the same checks as the CI pipeline:

```sh
# Blog
pnpm lint
pnpm typecheck
pnpm build

# App
cd apps/latex-preview
pnpm typecheck
pnpm build
```

## Adding a New Article

1. Add a `.md` or `.mdx` file to `src/content/articles/`
2. Include required frontmatter: `title`, `description`, `slug`, `publishedAt`
3. Use `draft: true` to hide from production routes
4. Run `pnpm lint && pnpm build` to verify
5. Commit and push

See `README.md` for the full article format specification.

## Adding a New Web App

1. Create a new directory under `apps/` following the same pattern
2. Set up `package.json`, `wrangler.toml`, and build tooling
3. Register the app route in Cloudflare dashboard
4. Add the link to `src/pages/index.astro`
5. Extend `.github/workflows/deploy.yml` with build and deploy steps
6. Update this document's structure table

## Package Management

This project uses pnpm workspaces (root) and independent `package.json` files per app.

```sh
# Blog dependencies (root)
pnpm add <package>

# App dependencies
cd apps/latex-preview && pnpm add <package>
```

Keep `pnpm-lock.yaml` up to date. Use `--frozen-lockfile` in CI.

## Environment Variables

| Variable                     | Used by | Required | Description                       |
| ---------------------------- | ------- | -------- | --------------------------------- |
| `PUBLIC_GA_MEASUREMENT_ID`   | blog    | no       | Google Analytics 4 measurement ID |
| `CLOUDFLARE_API_TOKEN`       | CI      | yes      | Wrangler deploy auth token        |
| `CLOUDFLARE_ACCOUNT_ID`      | CI      | yes      | Cloudflare account identifier     |

## Troubleshooting

### Astro build fails with duplicate id

Content Collections logs a warning when two articles share the same slug. Check `src/content/articles/` for duplicate `slug` values.

### App typecheck fails with JSX errors

If root `pnpm lint` reports errors in `apps/`, ensure `tsconfig.json` excludes the `apps` directory.

### Wrangler deploy fails

Verify `CLOUDFLARE_API_TOKEN` has Workers deploy permission and `CLOUDFLARE_ACCOUNT_ID` matches the target account. Run `pnpm wrangler deploy --dry-run` locally to validate configuration.

### Port conflicts

- Astro dev server: `:4321`
- Vite dev server: `:5173`
Change ports with `--port` flag if needed.
