# Development Roadmap

## Phase 1 — Repository and architecture
**Status:** Foundation implementation started.
- [x] Inspect repository metadata, branches, commit history, and existing files.
- [x] Record architecture and APKG compatibility strategy.
- [x] Establish TypeScript/React/Vite application shell.
- [x] Add a minimal workflow-definition test and CI workflow.
- [ ] Run dependency installation, type-check, tests, and production build in CI.

Acceptance criteria: shell renders at desktop/mobile widths; build and type-check pass; workflow test passes; architecture and risks are documented; no fake import, analysis, or export behavior is exposed.

## Phase 2 — APKG import engine
ZIP inventory and safety checks; metadata and collection entry detection; version-aware SQLite inspection in a worker; deck/note/card/model/tag/media inventory; import summary and warnings; real fixtures for every claimed format.
Exit gate: every claimed package format passes real import and inventory tests.

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