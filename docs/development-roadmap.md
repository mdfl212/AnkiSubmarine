# Development Roadmap

## Phase 1 — Repository and architecture
**Status:** Merged into main.
- [x] Inspect repository metadata, branches, commit history, and existing files.
- [x] Record architecture and APKG compatibility strategy.
- [x] Establish TypeScript/React/Vite application shell.
- [x] Add a minimal workflow-definition test and CI workflow.
- [ ] Confirm build, type-check, tests, and responsive rendering in the user's environment.

## Phase 2 — APKG import engine
**Status:** Initial implementation committed; TypeScript checks, 11 unit tests, production build, and high/critical production dependency audit pass in CI. Real-fixture verification remains pending.
- [x] Add local .apkg file selection and drag-and-drop.
- [x] Add ZIP central-directory preflight, archive path checks, encryption and compression checks, and resource limits.
- [x] Detect collection entry formats, preferring collection.anki21b over compatibility copies.
- [x] Add legacy JSON media-manifest and modern protobuf media-index decoding.
- [x] Add Zstandard collection decompression path.
- [x] Add SQLite Wasm read-only inspection in a Web Worker.
- [x] Report card/note/deck/note-type/tag/media counts, schema details, tables, and quick_check status where available.
- [x] Verify TypeScript checks, automated tests, and production build in GitHub Actions.
- [x] Add synthetic SQLite inventory tests for normalized and legacy JSON collection schemas.
- [x] Add a CI audit gate for high/critical production dependency vulnerabilities.
- [ ] Test real .anki2, .anki21, and .anki21b APKG fixtures from supported Anki versions.
- [ ] Benchmark large archives and revise memory limits/streaming behavior.
- [ ] Verify media-index consistency and inspect real schema variants.

Exit gate: each claimed package format passes real import and inventory tests. Do not enable export until the package can be modified on a working copy and re-imported successfully.

## Phase 3 — Content analysis
HTML-aware text extraction without source mutation; field/tag/note-type/deck analysis; medical concept detection; confidence levels and explanations; unclassified/manual review queue.
Exit gate: classifications are traceable to card evidence and ambiguous cards remain reviewable.

## Phase 4 — Hierarchy generation
Content-grounded grouping; one primary destination per card; secondary associations without duplication; configurable depth and count thresholds; proposed tree and statistics.
Exit gate: tree is derived from actual imported content and assignments are inspectable.

## Phase 5 — Interactive editor
Tree editing and accessible move controls; card browser/search/filters; bulk assignment and review queue; undo/redo and change history.
Exit gate: edits are reversible and every card has a valid destination.

## Phase 6 — APKG export
Working-copy assignment updates; package reconstruction and media preservation; database/package validation; before/after comparison.
Exit gate: real exports re-import into Anki and preserve required invariants.

## Phase 7 — Refinement and quality assurance
Responsive refinement; large-package performance and cancellation; browser compatibility/error handling; documentation and real Anki import validation.
Exit gate: documented support matrix, passing automated tests, and verified end-to-end export.