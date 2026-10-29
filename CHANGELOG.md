# Changelog

## Unreleased - 2026-10-29

- Separate deterministic templates, state transitions, versioned browser storage and UI wiring without adding runtime dependencies.
- Bind confirmation to a copied source snapshot; make repeated confirmation and continuation idempotent.
- Recover unsaved inputs, block stale confirmation, show inspectable history and detect conflicting tab saves.
- Preserve the legacy storage copy during migration, require legacy drafts to be reviewed again and disclose failed persistence/reset.
- Reflow content when zoom or the sidebar reduces available width; retain keyboard-accessible native history disclosures.
- Freeze 16 before/after boundary cases and extend storage and actual browser checks. No production service, model, publication or customer-outcome claim.

## Unreleased - 2026-10-27

- Add reusable synthetic business profiles and a sourced prepare/edit/confirm/continue journey.
- Preserve profile revisions, missing information and explicit review before continuing.
- Reset local drafts and conversation state, including delayed sample chat responses.
- Add state-transition tests and desktop/mobile browser acceptance checks.
- Run the existing synthetic checks in pull-request CI on Linux Chromium, without a deployment step.
- Keep all operations local and synthetic. No publication, production connection or model deployment.
