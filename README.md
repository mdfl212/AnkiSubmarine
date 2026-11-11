# AnkiSubmarine

**Anki Deck Analyzer, Intelligent Organizer & Subdeck Builder**

AnkiSubmarine is an independent, fully offline-capable, browser-based application that inspects existing Anki .apkg packages, analyzes their actual learning content, proposes a meaningful hierarchical deck structure, and exports a validated reorganized package. The application processes study data locally and has no cloud-processing or backend dependency.

**Workflow:** Import → Inspect → Analyze → Organize → Review → Validate → Export

## Current status
**Phase 2 — APKG import engine (initial implementation).**

The application now has a local APKG selection/drop workflow, ZIP preflight checks, package collection-entry detection, legacy JSON and modern protobuf media-manifest readers, Zstandard decoding for modern collection databases, SQLite Wasm collection inspection, and an import summary.

The initial inspector passes CI type-checking, automated unit tests, and a production build. Tests cover normalized and legacy JSON collection schemas, collection-entry precedence, and legacy media-manifest decoding. CI also checks for high/critical production dependency vulnerabilities. This is not yet a complete APKG compatibility claim. ZIP64 and encrypted archives are not supported. The first build applies a 350 MB uploaded-file limit and 750 MB declared expanded-archive limit. A real 52.6 MB Dermatology package has now been independently inspected: it contains collection.anki21 as its main database and collection.anki2 as a compatibility stub, with schema version 11, 263 notes, 318 cards, 6 decks, 1 note type, 591 distinct tags, and 286 media files. The ZIP, SQLite database, and legacy JSON media manifest are structurally valid. The remaining gate is to run this exact fixture through the browser worker and compare the displayed inventory before claiming end-to-end compatibility.

## Offline-first operation
- All deck processing is local. There is no backend, cloud processing, or external AI/API dependency.
- The production build includes a service worker that caches the app shell and emitted assets for offline reopening in the same browser profile and origin.
- A hosted app must be opened once while online so the browser can cache the application. After that, reopen it offline. Browser storage clearing or changing the site origin can remove the cache.
- For a truly disconnected first launch, distribute the built application assets locally and serve them from localhost; do not open the HTML file directly with file://, because service workers require localhost or HTTPS.
- Imported APKG files and their contents remain on the device.
## Development
Requirements: Node.js 22.12+ and npm.

```bash
npm install
npm run dev
```

Quality checks: `npm run typecheck`, `npm test`, and `npm run build`. The production build emits `sw.js` with a precache manifest for the built app shell and assets.

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