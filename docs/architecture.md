# AnkiSubmarine Architecture

## Status
Phase 1 baseline plus Phase 2 import implementation. Format support remains provisional until real fixture tests pass. A standalone single-file production build is now the intended launch target; browser-level file launch validation remains outstanding.

## Product boundary
AnkiSubmarine is an independent, offline-first application. It shares no runtime code or services with PDF Toolkit, StudyMats, or NotebookTrans.

## Offline application model
- The production entry point is a self-contained dist/index.html intended to be opened directly from local storage.
- The standalone build inlines the application JavaScript, CSS, worker code, and binary assets. It must not require a remote server, backend, CDN, cloud processing, external AI provider, or first-online-visit cache.
- APKG import, analysis, organization, editing, validation, and export must remain on-device.
- The APKG inspection worker is bundled inline so the local launch path does not fetch a separate worker script.
- The SQLite WebAssembly runtime and its binary payload must be bundled into the standalone output.
- A service worker remains an optional fallback for a controlled HTTP(S) origin; it is not required for the standalone file launch path. Service workers cannot be registered from file://.
- CI checks that the built HTML has no remaining external references to generated JavaScript or CSS assets. Actual browser launch, worker startup, and WASM initialization from file:// still require verification in target browsers.

## Stack
- React 19 + TypeScript for UI and domain contracts.
- Vite 7 for build and development. Its dev server is for development only, not a runtime requirement.
- Vitest for unit tests.
- fflate for ZIP decompression and archive inspection.
- fzstd for the current pure-JavaScript Zstandard decode path. Its documented back-reference limitation means very large/high-compression archives need fixture validation and likely a more capable streaming decoder before broad support is claimed.
- @sqlite.org/sqlite-wasm for SQLite in-memory inspection. The collection is deserialized into an in-memory database in a dedicated worker and switched to query-only mode.
- Web Workers keep archive/database work off the UI thread; the production worker is bundled inline for standalone launch.

## Standalone build pipeline
1. Vite builds the React application and the APKG worker.
2. The APKG worker is bundled inline rather than emitted as a separately fetched runtime script.
3. Binary assets, including the SQLite WASM payload, are configured for inlining.
4. The standalone HTML plugin embeds the generated JavaScript and CSS into index.html.
5. The plugin fails the build if the HTML still references an external generated JavaScript or CSS asset, or if the main JavaScript chunk has unresolved chunk dependencies.
6. The resulting dist/index.html is the intended user-facing offline artifact.

## Phase 2 package inspection pipeline
1. Check filename, uploaded byte size, and ZIP end/central-directory records.
2. Reject multi-disk, ZIP64, encrypted entries, unsafe paths, unsupported compression methods, duplicate names, suspicious compression ratios, and declared sizes over limits.
3. Enumerate archive members and choose collection.anki21b before collection.anki21 before collection.anki2. This avoids choosing the legacy compatibility stub when a modern database is also present.
4. Decode collection.anki21b with Zstandard; legacy collection entries are expected to be uncompressed SQLite.
5. Verify the SQLite magic header.
6. Decode the legacy JSON media manifest or the modern Zstandard-wrapped protobuf MediaEntries index.
7. Open SQLite Wasm in memory, deserialize the database bytes, enable query_only, inventory actual tables/columns, and run PRAGMA quick_check(1).
8. Read counts and deck/note-type definitions using whichever known schema representation exists.
9. Return only a compact summary to the UI. The source File remains unchanged in application state.

## Important limitations
- fflate unzipSync currently materializes archive members in worker memory after central-directory checks. Limits reduce risk but this is not the final streaming design for very large packages.
- ZIP64, encrypted entries, and compression methods other than stored/deflate are rejected.
- Modern protobuf parsing is intentionally narrow: package version and media index only.
- Zstandard decompression library needs testing with real Anki-produced payloads and large files.
- SQLite schema discovery is runtime-based, but count extraction is not yet a complete mapping of all Anki schema generations.
- The standalone HTML build has automated asset-inlining checks, but direct local launch and file-origin worker/WASM behavior still need real-browser validation.
- Real APKG fixtures and Anki import checks are mandatory before compatibility claims.

## Data integrity
No collection writes are performed. SQLite is query-only and in-memory. The original uploaded File remains unchanged. No deck content is sent to a server or external AI provider. All import, analysis, organization, editing, and export features must remain local; any future feature that would require a remote service is out of scope unless the user explicitly changes this requirement.

## Future module boundaries
- core/apkg: package readers, archive validation, collection adapter.
- core/anki: typed collection/deck/note/card/notetype models.
- analyzer: HTML extraction, medical concept detection, confidence.
- organizer: hierarchy generation and assignment history.
- editor: tree and review queue.
- export: working-copy modification and validation.
- workers: import, analysis, and export tasks.