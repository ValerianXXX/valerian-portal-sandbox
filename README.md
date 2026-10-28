# Valerian Portal Synthetic Sandbox

Explore a business workflow: save a reusable business profile, describe an operating need, inspect preparation with sources, edit and confirm it, and continue to an internal follow-up. Everything is an original synthetic example stored in your browser.

Live site: `https://valerianxxx.github.io/valerian-portal-sandbox/`

The live site may lag this branch. The October 27 upgrade is prepared for review; deployment has not been performed.

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

## Safety boundary

- Synthetic demonstration data only.
- No production API, database, authentication, external AI, email, payment, or file-upload connection.
- Demo changes are stored only in the current browser and can be reset from the interface.
- Selected files are never read or uploaded.

The complete application, production services and private implementation remain in a separate private repository.
