# Bounded reading-list presentation

## Scope and signatures

For the native static app, motion must not own storage, drafts or focus. `render(transition = "none")` cancels prior entrance instances before replacing cards. `animateEntrance(element, distance, duration, delay = 0)` is optional; `cancelEntrances()` only cancels those instances. `persist(candidate)` remains the only committed-state boundary.

## Contract and failure matrix

- Initial/filter render: at most 12 card entrances, 220ms each, delay `Math.min(index, 4) * 18` (max total 292ms); intro 260ms only on initial render.
- Add: animate only the new last card after successful persist. Rename/read/delete: immediate cards, no exit clones or animation-end writes.
- System media change: cancel existing entrances; CSS reduced-motion removes transitions and hover/press displacement. Missing/throwing animate or missing matchMedia: static business actions still work.
- Use `fill: "backwards"`, not a permanent opacity/transform style that hides cards after cancellation. Never defer mutations or focus to a motion callback.
- Explicitly set dynamically created edit inputs to `type="text"`: the shared responsive selector is `input[type="text"]`. Default input type behaves as text but does not match that attribute selector; omitting it leaves a narrow editor.

## Good / base / bad

Good: persist two additions during the first entrance; both remain once and the obsolete animation is cancelled. Base: filter updates the dataset and aria-pressed immediately. Bad: wait for animationend before removing a book or restoring focus, resurrecting stale state.

```javascript
if (!persist(candidate)) return;
render("add");
titleInput.focus();
```

## Required checks

Issue 76 product fixture asserts actual saved/memory snapshots, 100-book limits, computed intermediate opacity, synchronous actions within a running 220ms animation, full-width editor at four widths, and missing/throwing APIs. Controlled media-query callbacks prove logic only, not actual OS reduced-motion behavior. Native registered keyboard actions differ from synthesized DOM events; both are required and must be labelled. GPU/frame-rate, real IME, screen reader and real-device comfort require separate evidence.

See `docs/05-validation/tasks/76/validation.md` for executable plans and known acceptance gaps.
