# AnkiSubmarine

**Anki Deck Analyzer, Intelligent Organizer & Subdeck Builder**

AnkiSubmarine is an independent, browser-first application intended to inspect existing Anki .apkg packages, analyze their actual learning content, propose a meaningful hierarchical deck structure, and export a validated reorganized package.

**Workflow:** Import → Inspect → Analyze → Organize → Review → Validate → Export

## Current status
The project is in **Phase 1 — Repository and architecture**.

The current build is an application shell only. APKG import, card analysis, deck editing, and export are not implemented yet. The interface intentionally does not show fabricated deck statistics or pretend package upload works.

## Principles
- Analyze actual imported cards; never impose a generic deck tree.
- Preserve the original package and edit a separate working copy.
- Assign each card to one primary deck by default.
- Keep ambiguous classifications in a manual review queue.
- Process locally by default; never send deck content to an external AI service without explicit consent.
- Validate exported packages before offering them.

## Development
Requirements: Node.js 22.12+ and npm.

Run `npm install`, then `npm run dev`.

Quality checks: `npm run typecheck`, `npm test`, and `npm run build`.

## Documentation
- [Architecture](docs/architecture.md)
- [APKG format research notes](docs/apkg-format.md)
- [Development roadmap](docs/development-roadmap.md)

## Scope boundary
AnkiSubmarine is standalone. It is not an integration or extension of PDF Toolkit, StudyMats, or NotebookTrans.