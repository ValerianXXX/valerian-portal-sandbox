# Valerian Portal Synthetic Sandbox

Explore a business workflow: save a reusable business profile, describe an operating need, inspect preparation with sources, edit and confirm it, and continue to an internal follow-up. Everything is an original synthetic example stored in your browser.

Live site: `https://valerianxxx.github.io/valerian-portal-sandbox/`

The live site may lag this branch. The October 27 journey and October 29 recovery changes are prepared for review; deployment has not been performed.

## Run and verify

Serve this folder over HTTP (modules do not run reliably from `file://`):

```sh
python -m http.server 8771 --bind 127.0.0.1
```

Open `http://127.0.0.1:8771/` and use the business journey in Command Center. No account or API key is needed. Use synthetic inputs only; the browser is not a secure document vault.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm test:browser
```

Browser checks use installed Edge on Windows. On other systems, install the test browser with `pnpm exec playwright install chromium`. The application itself has no npm runtime dependency.

Pull requests run the same state and desktop/mobile browser checks on Linux Chromium. The verification workflow has read-only repository permissions and does not publish the site.

## October 27 upgrade

- Profile revisions and preparation sources remain visible; unknown prices, budgets and dates require owner input.
- Editing a draft or its profile invalidates the previous confirmation.
- Confirmed drafts and reusable profiles survive reload in the same browser. Reset demo clears this journey and the existing conversation.
- Desktop (1,280 px) and mobile (390 px) checks cover the full journey, reload, confirmation and reset, with no external requests or JavaScript errors.

See [verification and release notes](docs/business-journey-2026-10-27.md) and [CHANGELOG](CHANGELOG.md). This demo uses deterministic templates: it measures interaction behavior, not AI quality or customer outcomes.

## October 29 recovery and review boundaries

- Confirmation belongs to the exact saved profile, request, draft and sources. Repeated confirm/continue actions are idempotent.
- Unsaved profile, request and draft inputs survive refresh when browser storage works. They block confirmation and continuation until saved or explicitly discarded.
- Open the latest 20 history entries to inspect their original text and sources. Editing the current draft does not mutate earlier snapshots.
- Another tab's changes require an explicit reload instead of silently overwriting them. Storage failures disclose that work exists only in the current tab.
- Version 1 data is recovered with fresh review required; its original browser key remains available for rollback until Reset demo clears both versions.

The frozen state comparison improved from 2/16 to 16/16 passing cases; all 31 state/storage tests pass. Desktop and mobile recovery checks, keyboard history, cross-tab conflict/reset and 200% CSS zoom are covered. These are synthetic software checks, not independent user acceptance. See [recovery evidence, architecture and rollback](docs/recoverable-state-2026-10-29.md).

## Safety boundary

- Synthetic demonstration data only.
- No production API, database, authentication, external AI, email, payment, or file-upload connection.
- Demo changes are stored only in the current browser and can be reset from the interface.
- Selected files are never read or uploaded.

This repository is a standalone demonstration. Its build and verification do not require or connect to a private product repository.
