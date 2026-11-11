# APKG Format Research Notes

## Package layout
An .apkg is a ZIP package. Current Anki exports can carry collection data in one of three entries:
- collection.anki2 — legacy schema, uncompressed SQLite.
- collection.anki21 — intermediate schema, uncompressed SQLite.
- collection.anki21b — latest schema, Zstandard-compressed SQLite.

A modern package may also include collection.anki2 as a compatibility placeholder. The importer must choose the newest real collection entry in this order: anki21b, anki21, anki2. Selecting anki2 merely because it exists can silently return a one-card upgrade warning placeholder instead of the collection.

Older media manifests are JSON maps from numeric ZIP entry names to original filenames. The latest format uses a Zstandard-compressed Protocol Buffers MediaEntries message. The modern package meta entry is also protobuf, with field 1 carrying the package version.

Sources:
- [Anki Manual — Exporting](https://docs.ankiweb.net/exporting.html)
- [Anki source repository](https://github.com/ankitects/anki)
- [Anki package layout technical notes](https://docolin.com/de/imgajeed/ankipack/explanation/apkg-format)
- [SQLite Wasm documentation](https://sqlite.org/wasm/doc/trunk/index.md)
- [SQLite Wasm npm/Vite guidance](https://github.com/sqlite/sqlite-wasm)

## Implemented inspection behavior
The browser importer currently:
- checks ZIP end/central-directory records and basic entry metadata;
- rejects ZIP64, multi-disk, encrypted entries, unsafe paths, duplicate names, unsupported compression methods, suspicious ratios, and entries over configured limits;
- selects collection.anki21b > collection.anki21 > collection.anki2;
- decodes modern Zstandard collection data;
- reads legacy JSON and modern protobuf media indexes;
- opens SQLite Wasm in memory, query-only;
- reports table inventory, counts, deck definitions, note types, tags, and quick_check where schema fields are recognized.

## Not yet verified
No real Anki .apkg fixtures have yet been committed or tested. The implementation must not be advertised as fully supporting any package generation until real packages from that generation pass import and inspection tests. ZIP64 is currently unsupported. The latest protobuf schema may evolve and needs verification against current Anki source.

## Fixture matrix still required
- Real collection.anki2 package.
- Real collection.anki21 package with compatibility stub.
- Real collection.anki21b package with compressed media index and numbered media entries.
- Multi-deck and nested-deck package.
- Cloze and multiple note types.
- Media with images, audio, and fonts.
- Large collection with scheduling/review data.