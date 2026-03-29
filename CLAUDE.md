# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Kaarteditor** — a web-based greeting card editor for a user with glaucoma. The full spec is in [PRD-kaarteditor.md](PRD-kaarteditor.md). This repo is currently in the planning phase; implementation starts with Sprint 1.

**Critical principle**: Accessibility is not a feature — it is the architecture. Every technical and design decision must be evaluated against: *does this work for someone with glaucoma who navigates primarily by keyboard and depends on high contrast?*

---

## Tech Stack

No build tooling. Vanilla HTML/CSS/JavaScript only — directly runnable in a browser.

| Layer | Choice |
|---|---|
| Canvas | Fabric.js 5.x |
| PDF export | jsPDF 2.x |
| File storage | File System Access API + download fallback |
| UI font | Atkinson Hyperlegible (locally bundled) |
| Cliparts | Local SVG set (public domain) |
| Fonts | Google Fonts locally bundled (no external calls at runtime) |

To run: open `index.html` in Chrome/Edge. No server, no `npm install`, no build step.

---

## Architecture

### Structure (to be created)
```
index.html          — start screen
editor.html         — editor screen
css/
  base.css          — dark mode default, Atkinson Hyperlegible, reset
  editor.css
js/
  app.js            — entry, routing between screens
  canvas.js         — Fabric.js wrapper (two canvases: front/inside)
  toolbar.js        — add text, add clipart, background
  properties.js     — properties panel (font, size, color, WordArt)
  storage.js        — .kaart file format, File System Access API, fallback
  export.js         — jsPDF generation, print
  clipart.js        — library grid, keyboard navigation, search
  undo.js           — undo/redo stack (20+ steps)
  a11y.js           — aria-live regions, element list, focus management
assets/
  fonts/            — Atkinson Hyperlegible + card fonts (locally bundled)
  cliparts/         — 40+ SVGs grouped by category
```

### `.kaart` File Format
JSON with Fabric.js canvas state for both sides and base64-embedded images:
```json
{
  "version": "1.0",
  "appName": "Kaarteditor",
  "format": "A5-dubbel",
  "title": "...",
  "created": "<ISO 8601>",
  "modified": "<ISO 8601>",
  "front": { "background": "#fff9f0", "canvas": { /* Fabric.js JSON */ } },
  "inside": { "background": "#ffffff", "canvas": { /* Fabric.js JSON */ } },
  "embeddedAssets": { "id": "data:image/png;base64,..." }
}
```

---

## Accessibility Requirements (Non-Negotiable)

These requirements are higher than WCAG AA. They are mandatory for this user's glaucoma condition.

### Contrast
- All UI text: **7:1 minimum** (WCAG AAA), target 10:1+
- All interactive components (buttons, inputs, sliders): **4.5:1 minimum**
- Focus indicators: **3:1 minimum**, 3px solid outline
- Never use pure `#FFFFFF` backgrounds in UI chrome

### Visual defaults
- **Dark mode is the default** UI mode (reduces glare)
- **Atkinson Hyperlegible** font for all UI chrome, 18px minimum body text, 16px minimum labels, never below 14px
- All click/focus targets: **48×48px minimum** (WCAG 2.5.8)
- No `outline: none` or `outline: 0` without equivalent replacement

### Layout
- Compact, centralized work zone — no critical UI in screen corners or periphery
- No auto-closing toasts or dialogs; no time limits on interactions
- Works at 100–200% browser zoom without horizontal scroll or overlapping elements (WCAG 1.4.4, 1.4.10)
- Respect `prefers-reduced-motion`: disable all animations when set

### Keyboard
- Full app operable without mouse
- Tab order: top-to-bottom, left-to-right
- Skip link ("Ga naar editor") as first DOM element
- Focus trap in all modals/dialogs; focus returns to opener on close
- Required keyboard shortcuts:

| Action | Shortcut |
|---|---|
| Add text | `T` |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Y` |
| Save | `Ctrl+S` |
| Delete element | `Delete` / `Backspace` |
| Move element | `←↑→↓` (1px), `Shift+←↑→↓` (10px) |
| Switch front/inside | `1` / `2` |
| Print | `Ctrl+P` |

### ARIA
- Every interactive element must have a descriptive `aria-label` or visible text label — never icon-only buttons
- Status messages via `aria-live="polite"` region
- All form fields have associated `<label>` — no placeholder-only labels
- Tabs pattern: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`
- Clipart grid: arrow key navigation between items, Enter to select (`role="grid"`)
- Color pickers must also offer hex text input as keyboard alternative
- Canvas must have a parallel text-based element list (A-08): e.g. "Tekst: Gefeliciteerd, Midden, 48pt, Rood" — keyboard-selectable, keyboard-editable. This is the primary accessible interface for screen reader users.

---

## Sprint Build Order

Follow this order when implementing:

1. **Sprint 1** — HTML/CSS scaffolding (dark mode, Atkinson), Fabric.js canvas init, tab switching front/inside, add text with font/color/size, basic keyboard nav + focus styles
2. **Sprint 2** — Clipart library (grid, keyboard, ARIA), WordArt effects (shadow, stroke), undo/redo, background color
3. **Sprint 3** — `.kaart` save/load (File System Access API + fallback), recent files on start screen, jsPDF export, browser print
4. **Sprint 4** — Full ARIA (live regions, roles), text-based element list (A-08), 200% zoom fixes, dark/light mode toggle, user testing

---

## Open Questions (Unresolved)

Before implementing Sprint 4 priority decisions, check with the user:

1. Does the user use a screen reader? → determines priority of the text-based element list (A-08)
2. Severity of glaucoma? → determines exact contrast thresholds needed
3. Windows High Contrast Mode required? → requires specific CSS overrides
4. Preferred card fonts already in use?
5. Templates as a starting point? (nice-to-have, may move to Sprint 2)
6. Tablet/touchscreen support needed?
