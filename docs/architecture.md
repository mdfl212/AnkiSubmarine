# AnkiSubmarine Architecture

## Status
Architecture baseline for Phase 1. This document records decisions and items to prove in later milestones. It does not claim APKG compatibility.

## Product boundary
AnkiSubmarine is an independent, browser-first application. It does not share runtime code or services with PDF Toolkit, StudyMats, or NotebookTrans.

Core workflow: Import → Inspect → Analyze → Organize → Review → Validate → Export.

The imported package is the source of truth. Preserve the original bytes and operate on a separate working copy.

## Initial stack
| Area | Decision | Rationale |
|---|---|---|
| UI | React 19 + TypeScript | Componentized UI and strict contracts for deck/card state |
| Build/dev server | Vite 7 | Lightweight browser-first development and production build |
| Tests | Vitest | Fast unit tests; browser-level tests added when package workflows exist |
| Runtime | Browser APIs | Local file handling and privacy-first processing |
| ZIP | Select in Phase 2 spike | Must handle large archives and streaming |
| SQLite | SQLite Wasm preferred direction | Real SQLite behavior in-browser, isolated in a worker |
| Persistence | In-memory session first | Avoid storing user decks unnecessarily |

Use Node.js 22.12+ for development. No backend or external AI provider is required.

## Module boundaries
- app/: composition, routing, and top-level state.
- core/package/: ZIP inspection, package metadata, collection database access, package validation.
- core/anki/: typed models for decks, notes, cards, note types, fields, media, and collection metadata.
- analyzer/: HTML text extraction, metadata analysis, concept detection, confidence scoring, explanations.
- organizer/: hierarchy generation, primary assignments, tree operations, reversible history.
- editor/: deck tree, card browser, search/filter, manual review queue.
- export/: working-copy database changes, archive reconstruction, post-export validation.
- workers/: long-running import, analysis, and export jobs.
- ui/: reusable components and page views.
- tests/fixtures/: real, legally usable APKG fixtures with known expected results.

Keep the package-format adapter separate from the Anki domain model.

## Data-integrity model
1. Retain the original uploaded File/Blob unchanged during the session.
2. Inspect the archive before extracting or executing anything.
3. Parse into a read-only domain snapshot.
4. Create a separate working database/archive only when the user edits.
5. Represent organization changes as explicit operations.
6. Export from the working copy, never by mutating the original.
7. Compare source/output invariants before offering export.

Default card assignment is exactly one destination deck. Secondary concepts remain metadata/tags; they do not duplicate cards unless explicitly requested.

## APKG strategy
An APKG is a ZIP-based package containing a collection database and media. Package layout and database serialization have changed across Anki versions. Identify package metadata and collection entry before selecting a decoder.

Planned pipeline:
1. Inspect ZIP central directory and enforce resource limits.
2. Identify metadata and collection entry (collection.anki2, collection.anki21, or collection.anki21b).
3. Decode package-level compression before opening SQLite.
4. Open SQLite Wasm in a dedicated worker.
5. Inspect sqlite_master, PRAGMA user_version, and actual table/column definitions.
6. Map supported schema versions into the internal Anki model.
7. Retain unrecognized fields/tables and report unsupported features.
8. Modify only required deck/card assignment records in a working copy.
9. Rebuild the package and validate by reopening it and checking invariants.

Phase 2 must benchmark a streaming ZIP library against a simple alternative using a large real fixture. SQLite Wasm is the preferred browser-side database direction. The modern compressed collection variant needs a separately verified Zstandard decode/encode path. Do not claim support until a real fixture passes import → inspect → modify → export → re-import.

The parser should discover schema details at runtime and use version-aware adapters. Schema/export behavior is versioned implementation detail; compatibility needs fixtures from supported Anki releases, not only synthetic databases.

## Classification strategy
Use layered, explainable evidence: existing deck hierarchy and tags; note type and field names; extracted text from fields/templates without mutating source HTML; medical terminology and curated dictionaries; concept relationships; confidence score and explanation.

Classification is advisory. Low-confidence or conflicting cases enter manual review. No external service receives deck content unless the user explicitly approves it.

## Privacy and performance
- Local processing is the default.
- Large archive/database operations run in Web Workers.
- Show progress and allow cancellation at safe checkpoints.
- Apply archive entry-count, decompressed-size, and path-safety limits.
- Do not auto-persist imported decks.
- Avoid logging card content, media names, or personal deck details.

## Phase 1 scope
The initial shell covers product identity, workflow overview, responsive layout, build setup, and a minimal workflow-definition test. Import controls and fake statistics are intentionally excluded until the underlying engine exists.