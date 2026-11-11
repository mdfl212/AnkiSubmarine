# AnkiSubmarine

**Anki Deck Analyzer, Intelligent Organizer & Subdeck Builder**

AnkiSubmarine is an independent, browser-first application that inspects existing Anki .apkg packages, analyzes their actual learning content, proposes a meaningful hierarchical deck structure, and exports a validated reorganized package.

**Workflow:** Import → Inspect → Analyze → Organize → Review → Validate → Export

## Current status
**Phase 2 — APKG import engine (initial implementation).**

The application now has a local APKG selection/drop workflow, ZIP preflight checks, package collection-entry detection, legacy JSON and modern protobuf media-manifest readers, Zstandard decoding for modern collection databases, SQLite Wasm collection inspection, and an import summary.

The initial inspector passes CI type-checking, 11 unit tests (including SQLite inventory tests for normalized and legacy JSON schemas), and a production build. CI also checks for high/critical production dependency vulnerabilities. This is not yet a complete APKG compatibility claim. ZIP64 and encrypted archives are not supported. The first build applies a 350 MB uploaded-file limit and 750 MB declared expanded-archive limit. Real package fixtures from supported Anki releases and end-to-end validation are still required before claiming format compatibility.

## Development
Requirements: Node.js 22.12+ and npm.

```bash
npm install
npm run dev
```

Quality checks: `npm run typecheck`, `npm test`, and `npm run build`.

## Phase 2 import behavior
- Processing is local in a dedicated Web Worker.
- The original File object remains unchanged in the current session.
- Collection database priority is .anki21b, then .anki21, then .anki2. This avoids mistaking an older-client compatibility placeholder for the actual collection.
- SQLite is opened in memory and set to query-only mode.
- The inspector reports notes, cards, deck definitions, note types, tags, schema details, tables, and SQLite quick_check status where available.
- Warnings are shown for missing or inconsistent metadata.

## Known limitations
- No ZIP64 or encrypted archive support.
- Initial archive limits are conservative and require large-deck benchmarking.
- Modern package protobuf parsing currently covers the package version and media index fields needed for inspection, not all Anki protobuf schemas.
- Modern Zstandard decompression has not yet been verified against a real APKG fixture in this repository.
- The importer inventories package media but does not yet expose individual media files for preview.
- No APKG export or modification is implemented.

## Documentation
- [Architecture](docs/architecture.md)
- [APKG format research notes](docs/apkg-format.md)
- [Development roadmap](docs/development-roadmap.md)

## Scope boundary
AnkiSubmarine is standalone. It is not an integration or extension of PDF Toolkit, StudyMats, or NotebookTrans.