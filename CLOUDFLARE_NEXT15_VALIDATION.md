# Next.js 15 + OpenNext isolated validation

This branch is an isolated compatibility experiment based on `cloudflare-migration`.

## Guardrails

- No deployment is performed from this branch.
- Do not change `main`, `cloudflare-migration`, Vercel settings, the production site, DNS, or custom domains.
- Do not add credentials or API keys to GitHub.
- Do not use `--force`, `--legacy-peer-deps`, or equivalent peer-dependency bypasses.
- Cloudflare checks remain local until a separate deployment decision is made.

## Candidate versions

- Next.js `15.5.29`
- React and React DOM `19.3.1`
- `eslint-config-next` `15.5.29`
- `@types/react` and `@types/react-dom` `19.3.0`
- `@opennextjs/cloudflare` `1.20.17`
- Wrangler `4.165.0`
- Node.js `22` in CI

The remaining application dependencies were kept at their existing declared ranges. Installation used the normal peer dependency resolver.

## Completed validation

- Isolated branch: `cloudflare-next15-opennext-validation`
- Normal `npm ci` completed without peer bypass flags.
- `npm run quality` passed (data validation, SEO validation, lint, TypeScript).
- Next.js production build passed and generated all **2,585 static pages**.
- OpenNext Cloudflare Worker build passed.
- Local Wrangler Worker smoke test passed:
  - Home route returned HTTP 200 and contained the expected site title.
  - `/api/sakes/search-index` returned a JSON array with **997** items.
- CI workflow run: [44510052275](https://github.com/keaaaa777/sake-catalog/actions/runs/44510052275)
- The successfully validated change set was saved to this branch at commit `36d966bb346cc187d63a4c92688f5949700d4f94`.

## Changes present in this validation branch

- Next.js/React and matching type/lint dependencies were updated to the versions above.
- Next.js async request API codemod changes were applied to relevant pages and routes.
- OpenNext/Wrangler config and local preview/type-generation scripts were added.
- The Next.js 14-specific patch `patches/next+14.2.35.patch` was removed because it is obsolete and prevented a clean Next.js 15 install.
- No deployment command was run.

## Not yet verified

The passing CI is build and smoke-test evidence, not complete functional acceptance. These still need dedicated checks:

- Rakuten affiliate redirect behavior and click logging with unset, valid, and failing Supabase settings.
- Search interactions in a real browser (filters, sorting, URL restoration and pagination).
- Sitemap/canonical/robots output and metadata/structured data across representative routes.
- All 2,585 generated URLs and dynamic route edge cases.
- Image behavior and production-like Cloudflare bindings/secrets.
- A non-production Cloudflare-hosted preview, if separately authorized.

## Next safe steps

1. Run focused local browser/API checks for affiliate and SEO behavior.
2. Review the validation branch diff against `cloudflare-migration`.
3. If those checks pass, decide whether to authorize a non-production `workers.dev` deployment. Until then, do not deploy or change DNS/custom domains.
4. Keep the current Vercel production deployment available for any later rollback.

## Work history

| Date | Change | Result |
|---|---|---|
| 2026-11-19 | Created isolated Next.js 15 validation branch from `cloudflare-migration` | Base and production branches left unchanged |
| 2026-11-19 | Updated framework dependencies and migrated async request APIs in the isolated branch | Normal dependency resolution; no peer bypass |
| 2026-11-19 | Ran quality, full build, OpenNext build and local Worker smoke checks | All passed; 2,585 static pages and 997 search index items |
| 2026-11-19 | Saved the verified changes to the isolated branch | Commit `36d966bb346cc187d63a4c92688f5949700d4f94`; no deployment |
