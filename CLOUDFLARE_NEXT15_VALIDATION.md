# Next.js 15 + OpenNext isolated validation

This branch is an isolated compatibility experiment based on `cloudflare-migration`.

## Guardrails

- Never deploy from this branch.
- Do not change `main`, `cloudflare-migration`, Vercel settings, the production site, DNS, or custom domains.
- Do not add credentials or API keys to GitHub.
- Do not use `--force`, `--legacy-peer-deps`, or equivalent peer-dependency bypasses.
- Keep Cloudflare preview local until a separate approval is given.

## Target to validate

- Next.js 15 latest patched 15.5 release accepted by the currently supported `@opennextjs/cloudflare` peer range.
- React and React DOM 19 with matching React type packages.
- `eslint-config-next` aligned to the chosen Next.js release.
- OpenNext Cloudflare and Wrangler pinned to verified compatible releases.

## Validation order

1. Record base SHA and current lockfile state.
2. Check official OpenNext peer requirements and security patch floor; select exact versions.
3. Update package metadata and lockfile without peer bypasses.
4. Apply Next.js codemod and migrate async request APIs (`params`, `searchParams`, `cookies`, `headers`, `draftMode`) explicitly.
5. Run `npm ci`, quality checks and normal Next.js build.
6. Run OpenNext build and local Wrangler preview only.
7. Compare static route count (baseline: 2,585), route/API behavior, SEO output and affiliate safety against the existing baseline.
8. Record results and unresolved failures here. Do not deploy.

## Current status

- Branch created from `cloudflare-migration` for isolated validation.
- Dependency upgrade and app code migration have not yet been applied.
- No build has been run on this validation branch.
