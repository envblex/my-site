# Deployment

## Policy

Production deploys are only performed by GitHub Actions from `main`.

Direct push to `main` is forbidden.

## Deploy flow

```
feature branch
-> pull request
-> review (lint, typecheck, build pass)
-> merge to main
-> GitHub Actions deploy (wrangler deploy)
```

## Required GitHub Secrets

| Name                  | Purpose                        |
| --------------------- | ------------------------------ |
| CLOUDFLARE_API_TOKEN  | Wrangler deploy authentication |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare account identifier  |

## Required GitHub Variables (optional)

| Name                      | Purpose                        |
| ------------------------- | ------------------------------ |
| PUBLIC_GA_MEASUREMENT_ID  | Google Analytics 4 measurement |

## Required Cloudflare resources

| Resource          | Binding | Environment | Created           |
| ----------------- | ------- | ----------- | ----------------- |
| Workers (static)  | N/A     | production  | auto on deploy    |

## GitHub Actions workflow

File: `.github/workflows/deploy.yml`

### Check job (runs on all PRs and push to main)

1. Checkout repository
2. Setup pnpm 9 + Node 22
3. `pnpm install --frozen-lockfile`
4. `pnpm lint`
5. `pnpm typecheck`
6. `pnpm build`

### Deploy job (only on push to main)

1. Checkout repository
2. Setup pnpm 9 + Node 22
3. `pnpm install --frozen-lockfile`
4. `pnpm build`
5. `pnpm wrangler deploy`

The deploy job uses `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from GitHub Secrets.

## Local validation

```
pnpm lint
pnpm typecheck
pnpm build
pnpm wrangler deploy --dry-run
```

## Production deploy

Production deployment is automatic after merge to `main`.

Do not run local production deploy.

## Rollback

1. Revert the offending commit on `main`
2. Open a PR with the revert
3. Merge the PR
4. GitHub Actions deploys the previous version

Or use the Wrangler CLI (requires `CLOUDFLARE_API_TOKEN`):

```
pnpm wrangler rollback
```

## Troubleshooting

### Build fails in CI but passes locally

- Ensure `pnpm install --frozen-lockfile` was run locally and `pnpm-lock.yaml` is up to date.
- Check for platform-specific dependencies.

### Deploy fails with authentication error

- Verify `CLOUDFLARE_API_TOKEN` is set in GitHub Secrets.
- Confirm the token has Workers deploy permission for the correct account.
- Verify `CLOUDFLARE_ACCOUNT_ID` matches the target account.

### Deploy succeeds but site returns error

- Check the Cloudflare Workers dashboard for the deployment version.
- The Worker is in static assets mode — verify `wrangler.toml` has `[assets]` configured.
- If `404-page` handling is not working, verify `dist/404.html` exists after build.
