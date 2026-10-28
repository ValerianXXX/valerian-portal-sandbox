# Changelog

## Unreleased - 2026-10-27

- Add reusable synthetic business profiles and a sourced prepare/edit/confirm/continue journey.
- Preserve profile revisions, missing information and explicit review before continuing.
- Reset local drafts and conversation state, including delayed sample chat responses.
- Add state-transition tests and desktop/mobile browser acceptance checks.
- Run the existing synthetic checks in pull-request CI on Linux Chromium, without a deployment step.
- Keep all operations local and synthetic. No publication, production connection or model deployment.
