# APKG Format Research Notes

## Purpose
This document defines Phase 2 research and compatibility gates. It is not a complete APKG specification and does not imply current parser support.

## Known package characteristics
Anki documents .apkg as a packaged deck containing cards, notes, note types, and bundled media. Anki distinguishes deck packages from collection packages and documents a legacy-compatible export option.

Collection database entry names to investigate include:
- collection.anki2
- collection.anki21
- collection.anki21b

Treat anki21b as a distinct compressed format until its encoding and metadata are verified against Anki's implementation and real fixtures. Verify the Zstandard framing and version signaling; do not infer them from the filename alone.

Media is stored as archive entries with a manifest mapping package entry names to original filenames. Validate the manifest shape and media naming rules against fixtures before implementation.

## Required inspection order
1. Validate ZIP structure; reject unsafe paths and unreasonable resource claims.
2. Enumerate archive entries without eager extraction.
3. Read package metadata when present.
4. Identify the collection database entry and compression.
5. Decode only through a verified format/version adapter.
6. Open SQLite read-only and inspect schema/version metadata.
7. Inventory tables, indexes, triggers, and relevant columns.
8. Build a capability report before enabling edits.

## Compatibility fixture matrix
Collect real packages from supported Anki releases, with permission to use them as fixtures:
- Legacy deck package with collection.anki2.
- Intermediate package with collection.anki21.
- Modern package with collection.anki21b.
- No-media package and package with multiple media types.
- Multiple decks and nested decks.
- Cloze notes and multiple note types.
- Scheduling/review data where included.
- Large package for memory measurements.

Each claimed format must pass import → inventory → working-copy modification → export → re-import, plus an actual Anki import check where feasible.

## Preservation invariants
Compare before and after:
- Note/card IDs and counts.
- GUIDs, note fields, tags, and field order.
- Note type/model definitions, templates, and styling.
- Media manifest and referenced media bytes.
- Scheduling and review-history records when present.
- Deck definitions and card-to-deck assignments.

Only intended organization changes should differ. Unsupported records/features must be reported before export; silent data loss is a release blocker.

## Sources
- Anki Manual — Exporting: https://docs.ankiweb.net/exporting.html
- Anki source repository: https://github.com/ankitects/anki
- SQLite Wasm documentation: https://sqlite.org/wasm/doc/trunk/index.md

Base format adapters on current Anki source and verified package fixtures, not third-party descriptions alone.