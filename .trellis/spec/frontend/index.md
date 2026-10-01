# Reading list frontend code-specs

## Pre-Development Checklist

- Read [book-state.md](book-state.md) before changing list writes, editing, rendering or focus restoration.
- Read the active task's approved PRD, prototype, HLD/contracts and LLD; this spec does not override them.
- Use native DOM and the existing static app. Do not add test data or fault controls to the product.

## Quality Check

- Run the Owner's configured Prettier/ESLint verification plus syntax checks.
- Run the unchanged reading-core journey and current feature browser plan through registered check.
- For state/storage changes, run browser integration fixtures and assert complete persistent and in-memory snapshots on success and failure.
- Record real browser events separately from synthetic composition and human assistive-technology evidence.
