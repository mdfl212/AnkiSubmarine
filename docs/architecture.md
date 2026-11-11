# AnkiSubmarine Architecture

## Status
Phase 1 baseline plus Phase 2 import implementation. Format support remains provisional until real fixture tests pass.

## Product boundary
AnkiSubmarine is an independent browser-first application. It shares no runtime code or services with PDF Toolkit, StudyMats, or NotebookTrans.

## Stack
- React 19 + TypeScript for UI and domain contracts.
- Vite 7 for build and development.
- Vitest for unit tests.
- fflate for ZIP decompression and archive inspection.
- fzstd for the current pure-JavaScript Zstandard decode path. Its documented back-reference limitation means very large/high-compression archives need fixture validation and likely a more capable streaming decoder before broad support is claimed.
- @sqlite.org/sqlite-wasm for SQLite in-memory inspection. The collection is deserialized into an in-memory database in a dedicated worker and switched to query-only mode.
- Web Workers keep archive/database work off the UI thread.

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
- Real fixtures and Anki import checks are still mandatory before compatibility claims.

## Data integrity
No collection writes are performed. SQLite is query-only and in-memory. The original uploaded File remains unchanged. No deck content is sent to a server or external AI provider.

## Future module boundaries
- core/apkg: package readers, archive validation, collection adapter.
- core/anki: typed collection/deck/note/card/notetype models.
- analyzer: HTML extraction, medical concept detection, confidence.
- organizer: hierarchy generation and assignment history.
- editor: tree and review queue.
- export: working-copy modification and validation.
- workers: import, analysis, and export tasks.