# AnkiSubmarine

**Anki Deck Analyzer, Intelligent Organizer & Subdeck Builder**

AnkiSubmarine is an independent, offline-first application for inspecting existing Anki APKG packages, analyzing their actual learning content, proposing a meaningful hierarchical deck structure, and exporting a validated reorganized package.

**The production app is a self-contained HTML file.** It is designed to launch locally from the user's device without server hosting, a backend, cloud processing, external AI/API calls, or an internet connection.

**Workflow:** Import → Inspect → Analyze → Organize → Review → Validate → Export

## Offline launch

1. Build the application with npm run build.
2. Open dist/index.html directly in a supported browser.
3. Import an APKG file from the device.

The build inlines the application JavaScript, CSS, worker code, and imported binary assets into the HTML entry point. The APKG inspection worker and SQLite WebAssembly runtime are bundled for local execution. No web server or first-online-visit step is intended for normal use.

The service-worker cache remains an optional browser-origin fallback for development or controlled local web serving. It is not required by the standalone HTML launch path. The app must not depend on GitHub Pages or any hosted deployment.

**Verification note:** CI verifies that the generated HTML contains no external build-asset references. Actual launch and APKG import still need to be checked in supported browsers, especially browsers with stricter file-origin worker policies.

## Current status

**Phase 2 — APKG import engine (initial implementation).**

The application has local APKG selection and drag/drop, ZIP preflight checks, collection-entry detection, legacy JSON and modern protobuf media-manifest readers, Zstandard decoding for modern collection databases, SQLite Wasm collection inspection, and an import summary.

The initial inspector passes CI type-checking, automated unit tests, and a production build. Tests cover normalized and legacy JSON collection schemas, collection-entry precedence, and legacy media-manifest decoding. CI also checks for high/critical production dependency vulnerabilities. This is not yet a complete APKG compatibility claim.

A real 52.6 MB Dermatology package has been independently inspected: it contains collection.anki21 as its main database and collection.anki2 as a compatibility stub, with schema version 11, 263 notes, 318 cards, 6 decks, 1 note type, 591 distinct tags, and 286 media files. The ZIP, SQLite database, and legacy JSON media manifest are structurally valid. The remaining gate is to run this exact fixture through the browser worker and compare the displayed inventory before claiming end-to-end compatibility.

## Development

Requirements: Node.js 22.12+ and npm.

```bash
npm install
npm run dev
```

The Vite development server is for development only. It is not required to launch the built application.

Quality checks: npm run typecheck, npm test, and npm run build. The production build emits a standalone dist/index.html with application code and runtime assets embedded.

## Phase 2 import behavior

- APKG processing runs locally in a dedicated Web Worker.
- The original File object remains unchanged in the current session.
- Collection database priority is .anki21b, then .anki21, then .anki2. This avoids mistaking an older-client compatibility placeholder for the actual collection.
- collection.anki21b is decoded with Zstandard; legacy collection entries are expected to be uncompressed SQLite.
- SQLite is opened in memory and set to query-only mode.
- The inspector reports notes, cards, deck definitions, note types, tags, schema details, tables, and SQLite quick_check status where available.
- Warnings are shown for missing or inconsistent metadata.
- Archive extraction currently materializes entries in worker memory after ZIP preflight; streaming optimization remains future work.

## Known limitations

- ZIP64 and encrypted archives are not supported.
- Initial limits are 350 MB uploaded and 750 MB declared expanded archive size.
- Modern package protobuf parsing currently covers the package version and media index fields needed for inspection, not all Anki protobuf schemas.
- Modern Zstandard decompression has not yet been verified against a real APKG fixture in this repository.
- The importer inventories package media but does not yet expose individual media files for preview.
- No APKG export or modification is implemented.
- Standalone file-origin launch and worker/WASM execution must be verified in the target browsers before declaring the browser support matrix complete.

## Documentation

- [Architecture](docs/architecture.md)
- [APKG format research notes](docs/apkg-format.md)
- [Development roadmap](docs/development-roadmap.md)

## Scope boundary

AnkiSubmarine is standalone. It is not an integration or extension of PDF Toolkit, StudyMats, or NotebookTrans.