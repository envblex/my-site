# Operations

## Policy

* Secrets are managed through GitHub Secrets only.
* Production deployment is performed only by GitHub Actions from `main`.
* Direct push to `main` is forbidden.
* External resource creation requires human approval.

## Environments

| Environment | Branch                               | Deploy path             | Notes                 |
| ----------- | ------------------------------------ | ----------------------- | --------------------- |
| local       | any                                  | local dev only          | no production secrets |
| production  | main                                 | GitHub Actions only     | protected             |

## GitHub Secrets

| Name                   | Environment | Purpose                          | Required | Set manually |
| ---------------------- | ----------- | -------------------------------- | -------- | ------------ |
| CLOUDFLARE_API_TOKEN   | production  | Wrangler deploy authentication   | yes      | yes          |
| CLOUDFLARE_ACCOUNT_ID  | production  | Cloudflare account identifier    | yes      | yes          |

## GitHub Variables

| Name                      | Environment | Purpose                        | Required | Set manually |
| ------------------------- | ----------- | ------------------------------ | -------- | ------------ |
| PUBLIC_GA_MEASUREMENT_ID  | production  | Google Analytics 4 measurement | no       | yes          |

## Cloudflare resources

This project is a static blog deployed to Cloudflare Workers via Wrangler's static assets mode.
No persistent Cloudflare resources are required.

| Resource type   | Binding | Environment | Purpose                    | Status      |
| --------------- | ------- | ----------- | -------------------------- | ----------- |
| Workers (static) | N/A     | production  | Serve static HTML/CSS/X    | configured  |

No KV namespaces, R2 buckets, D1 databases, or Durable Objects are needed.

## Domain

| Domain          | Type   | Proxy | Status      |
| --------------- | ------ | ----- | ----------- |
| blog.env.skin   | custom | yes   | configured  |

## Manual setup steps

### 1. GitHub Secrets

Set the following secrets in the repository's Settings > Secrets and variables > Actions:

```
gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
```

The `CLOUDFLARE_API_TOKEN` must have Workers deploy permission scoped to the correct account.

### 2. GitHub Variable (optional)

If Google Analytics tracking is desired:

```
gh variable set PUBLIC_GA_MEASUREMENT_ID
```

### 3. Cloudflare Workers static assets

The `wrangler.toml` configures static asset serving from `./dist/`.
No additional Cloudflare resource creation is required.
The Worker is created automatically on first `wrangler deploy`.

## Validation steps

```
pnpm lint
pnpm typecheck
pnpm build
pnpm wrangler deploy --dry-run
```

## Rollback notes

Since this is a static site deployed via Wrangler, rollback is performed by:

1. Reverting the bad commit on `main`
2. Merging the revert PR
3. GitHub Actions redeploys the previous version

Alternatively, use `wrangler rollback` manually (requires `CLOUDFLARE_API_TOKEN`).

## Known risks

* No staging environment exists — all PR checks run lint/typecheck/build but cannot verify runtime behavior.
* No D1/KV/R2 resources are used, so no data loss risk on redeploy.
* The domain `blog.env.skin` is managed in Cloudflare dashboard, not in this repository.
* The Worker name `my-blog` is hardcoded in `wrangler.toml` — renaming requires manual coordination with the Cloudflare dashboard.
