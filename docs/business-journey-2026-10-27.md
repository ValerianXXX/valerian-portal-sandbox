# Business journey verification - 2026-10-27

## Scope and product alignment

The current product work supports reusable business context, preparation linked to sources, internal saved work, review and continuation. This public demo illustrates those interaction boundaries using newly authored synthetic examples. It contains no private implementation, production endpoint, tenant record or customer outcome.

Previously the preview offered a dashboard and sample chat. This branch adds an explicit four-step journey in Command Center:

1. Save three synthetic profile fields; later requests can reuse them.
2. Enter a business request and inspect a deterministic preparation template.
3. Review the profile and request sources, edit the preparation and explicitly confirm.
4. Continue to a local follow-up that asks for missing information. No external work occurs.

Profile changes clear the active draft and increment its revision. Draft edits require another confirmation. At most 20 confirmed snapshots are retained locally. Corrupt storage resets to an empty state; unavailable storage leaves the current tab usable with a visible warning.

## Verification

| Check | Result | Meaning |
| --- | --- | --- |
| Existing JavaScript syntax baseline | Pass | Preview script parses |
| State-transition regression | 3 tests pass | Reuse, confirmation invalidation and malformed-storage handling |
| Edge browser, 1,280 and 390 px | Pass | Save, prepare, source display, edit, reject missing confirmation, confirm, continue, reload and reset |
| Browser assertions | Pass | No JavaScript errors, external requests or horizontal overflow |
| Interactive browser inspection | Pass | Desktop and mobile layouts and key controls inspected; reset persisted after reload |
| Production or external AI integration | Not run / not part of this demo | No production connectivity exists |

Run `pnpm test:browser` to regenerate `reports/journey-1280.png` and `reports/journey-390.png`. These files are local test artifacts. The local screenshots show synthetic browser data only.

No AI before/after benefit was measured: both preparation and chat remain clearly marked samples. Dashboard metrics are illustrative, not adoption or revenue evidence.

## Configuration and release

No environment variables, keys, database or migrations are required. Serve the repository over HTTP. Keep the origin stable to reuse browser storage; a different origin has separate storage.

This task prepares a draft PR only. After review and explicit publication approval, deploy the approved static commit through the repository's hosting process. Roll back by redeploying the prior approved static commit. Reset demo clears browser state if schema recovery is needed. There is no backend migration or production data change.
