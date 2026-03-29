# Kaarteditor — Voortgang

Bijgewerkt na elke werksessie. Vink taken af zodra ze klaar zijn.

Requirements: [PRD-kaarteditor.md](PRD-kaarteditor.md) | Architectuur: [CLAUDE.md](CLAUDE.md)

---

## Sprint 1 — Basis editor (werkend skelet)

### Projectopzet
- [x] Git repo initialiseren
- [x] Mapstructuur aanmaken: `css/`, `js/`, `assets/fonts/`, `assets/cliparts/`, `lib/`
- [x] Fabric.js 5.3.1 lokaal downloaden → `lib/fabric.min.js`
- [x] Atkinson Hyperlegible font lokaal downloaden (8 woff2-bestanden, latin + latin-ext) → `assets/fonts/`
- [x] `.gitignore` aanmaken

### HTML-scaffolding
- [x] `index.html` — startscherm met skip-link (A-06), dark mode standaard (A-19)
- [x] `editor.html` — editor met werkbalk, canvas, eigenschappenpaneel (FR-01)
- [x] Compact, gecentreerde werkzone (A-26) — max-width 1280px, gecentreerd

### CSS-basis
- [x] `css/base.css` — CSS reset, dark mode custom properties, Atkinson Hyperlegible 18px+ (A-19, A-21)
- [x] Focusstijlen: 3px solid amber outline, `:focus-visible` patroon (A-03, A-17, A-23)
- [x] Minimale klikgebieden 48×48px op alle knoppen (A-20)
- [x] `css/editor.css` — CSS Grid layout, werkbalk, eigenschappenpaneel, responsief
- [x] `prefers-reduced-motion` ondersteuning (A-25)

### Canvas (Fabric.js)
- [x] `js/canvas.js` — Fabric.js canvas met A5-verhouding 148:210 (FR-02)
- [x] Voor-/binnenkant wisseling via state swap (canvas.toJSON / loadFromJSON)
- [x] ARIA tabs pattern in editor.html + activateTab() in app.js (FR-01, A-11)
- [x] Sneltoetsen `1`/`2` voor wisselen (A-05)
- [x] Hoog-contrast selectie-indicator: amber 3px border, cornerSize 14 (FR-05)
- [x] Responsieve canvas: herschalen bij venstergrootte-wijziging (A-27)

### Tekst bewerken
- [x] `js/toolbar.js` — knop "Tekst toevoegen" + sneltoets `T` (FR-03, A-05)
- [x] `js/properties.js` — font-selector (FR-11, FR-13)
- [x] Lettergrootte: slider + numerieke invoer, tweeweg gesynchroniseerd (FR-11)
- [x] Tekstkleur: kleurpicker + hex-invoer, tweeweg gesynchroniseerd (FR-11, A-13)
- [x] Uitlijning: links / midden / rechts met `aria-pressed` (FR-11)
- [x] Vet en cursief schakelaars met `aria-pressed` (FR-11)

### Toetsenbordnavigatie
- [x] `js/app.js` — ingangspunt, schermnavigatie
- [x] Volledige bediening zonder muis (A-01)
- [x] Tab-volgorde: boven→onder, links→rechts via DOM-volgorde (A-02)
- [x] Pijltjestoetsen: 1px verplaatsen, 10px met Shift (FR-06, A-05)
- [x] Delete/Backspace om element te verwijderen (FR-09, A-05)
- [x] Guard-logica: sneltoetsen geblokkeerd tijdens tekst-editing in canvas/formulier
- [x] Sneltoets `Ctrl+S` opslaan (placeholder + statusmelding) (A-05)
- [x] Sneltoetsen `Ctrl+Z` / `Ctrl+Y` undo/redo (placeholder + statusmelding) (A-05)
- [x] Sneltoets `Ctrl+P` afdrukken (placeholder + statusmelding) (A-05)

### ARIA-basis
- [x] Alle knoppen hebben `aria-label` of zichtbaar tekstlabel (A-07)
- [x] Alle formuliervelden hebben een gekoppeld `<label>` (A-10)
- [x] Geen icoon-alleen knoppen zonder label (A-07)
- [x] `aria-live="polite"` regio voor statusmeldingen (A-09, gedeeltelijk)

### Code-kwaliteit & toekomstbestendigheid (Sprint 1 afsluiting)
- [x] `button.btn` CSS-split: bare `<button>` krijgt alleen reset, visuele stijl vereist `.btn`-klasse (Sprint 2-veilig)
- [x] `.btn-toggle[aria-pressed]` gescopet: geen Sprint 2-botsingen met andere `aria-pressed`-elementen
- [x] Hover-guard `:not([aria-disabled="true"])`: disabled knoppen animeren niet bij hover
- [x] Canvas `position: sticky` in `.editor-center`: canvas blijft zichtbaar terwijl eigenschappenpaneel scrollt
- [x] `loadFromJSON` async-race opgelost: `switchSeq` voorkomt stale callbacks bij snel tab-wisselen
- [x] Inactieve canvas-zijde herschaalt mee bij venstergrootte-wijziging (`rescaleJson`)
- [x] `getState()`/`loadState()` publieke API: Sprint 3 kan `.kaart` bestanden laden/opslaan
- [x] `debounce` globaal in `utils.js` (was lokaal in `canvas.js`)
- [x] `announceStatus` 100 ms delay met timer-annulering (was 50 ms, geen annulering)
- [x] Toekomstige knoppen: native `disabled` verwijderd, `aria-disabled="true"` behouden — blijven in tabvolgorde (A-01)
- [x] Click-handlers op `aria-disabled`-knoppen kondigen Sprint-beschikbaarheid aan
- [x] `canvas`-element heeft `aria-label`; A-08 `#element-list` placeholder aanwezig voor Sprint 4
- [x] `properties.js`: type-guard (alleen `textbox`/`i-text`), fill-type-check, focus-herstel bij hide, `object:modified` event voor Sprint 2 undo-stack
- [x] Ctrl+Z/Y niet onderschept in formuliervelden (browser-undo/redo intact)

---

## Sprint 2 — Elementen & stijlen

### Clipart-bibliotheek
- [x] `js/clipart.js` — bibliotheekpaneel met grid-layout (FR-14)
- [x] 40+ SVG's gebundeld per categorie: Verjaardag, Feest, Natuur, Dieren, Overig — 40 items inline als stringconstanten (FR-14, FR-15)
- [x] Zoek-/filterveld met live filtering + debounce (FR-16)
- [x] Beschrijvende `aria-label` op alle clipart-cellen (FR-17, A-14)
- [x] Grid-toetsenbordnavigatie: pijltjes + Enter/Home/End om te selecteren (A-12, FR-17)
- [x] ARIA `role="grid"` + `role="row"` + `role="gridcell"` pattern (A-12)
- [x] Focustrap in modal + focusterugkeer bij sluiten (A-04)

### WordArt-effecten
- [x] Slagschaduw: aan/uit schakelaar + kleur + offset instellingen (FR-12)
- [x] Omlijning (stroke): kleur + dikte instellingen (FR-12)
- [x] Achtergrondvlak achter tekst (FR-12)

### Undo/Redo
- [x] `js/undo.js` — undo/redo-stack, 20 stappen, FIFO overflow (FR-10)
- [x] `Ctrl+Z` undo, `Ctrl+Y` redo gekoppeld — placeholder vervangen door echte handler (A-05)
- [x] Undo/redo-knoppen in werkbalk, `aria-disabled` dynamisch beheerd (A-07)
- [x] Automatische zijdewisseling bij cross-side undo

### Achtergrond
- [x] Achtergrondkleur instellen per canvaszijde via popover (FR-12 / should-have)
- [x] Hex-invoer als alternatief voor kleurpicker (A-13)

### Elementbewerking
- [x] Schalen via hoekhandvaten (FR-07) — ingebouwd Fabric.js
- [x] Schalen via numerieke invoer in eigenschappenpaneel (FR-07)
- [x] Roteren via rotatiehandvat (FR-08) — ingebouwd Fabric.js
- [x] Roteren via numerieke gradeninvoer (FR-08)
- [x] Element dupliceren via knop + `Ctrl+D` (should-have)

### Kaartfonts (Sprint 2)
- [x] 7 kaartfonts lokaal gebundeld: Pacifico, Caveat, Lobster, Dancing Script, Permanent Marker, Patrick Hand, Satisfy
- [x] @font-face declaraties toegevoegd aan `css/base.css`
- [x] Font-opties toegevoegd aan `#prop-font` select

---

## Sprint 3 — Opslag & export

### Opslaan/laden
- [ ] `js/storage.js` — `.kaart` JSON-formaat implementatie (FR-20)
- [ ] Opslaan via File System Access API (Chrome/Edge) (FR-18)
- [ ] Opslaan via download-fallback (Firefox/Safari) (FR-18)
- [ ] Openen via bestandskiezer-knop (FR-19)
- [ ] Openen via drag-and-drop op startscherm (FR-19)
- [ ] Afbeeldingen als base64 insluiten in `.kaart` bestand (FR-20)

### Recente bestanden
- [ ] Lijst van recente bestanden opslaan in localStorage (FR-21)
- [ ] 5 meest recente als grote, klikbare kaartminiaturen tonen op startscherm (FR-21)

### PDF-export
- [ ] `js/export.js` — jsPDF 2.x lokaal bundelen en integreren
- [ ] A4-liggend PDF genereren: voorkant links, binnenkant rechts (FR-22)
- [ ] Minimaal 150 DPI beeldkwaliteit (FR-24)
- [ ] Knop "Download PDF" (FR-22)

### Afdrukken
- [ ] Knop "Afdrukken" opent browser-printdialoog (FR-23)
- [ ] `@media print` stijlen: geen UI-chrome, correcte marges (FR-23)
- [ ] Sneltoets `Ctrl+P` gekoppeld (A-05)

---

## Sprint 4 — Toegankelijkheid & afwerking

### Volledige ARIA-implementatie
- [ ] `js/a11y.js` — `aria-live="polite"` regio voor statusmeldingen (A-09)
- [ ] Statusmeldingen: opgeslagen, fout, element toegevoegd/verwijderd (A-09)
- [ ] Kleur nooit als enige onderscheidende factor (A-18)

### Tekst-gebaseerde elementenlijst (A-08)
- [ ] Alternatieve lijst van canvaselementen naast de visuele editor (A-08)
- [ ] Formaat: "Tekst: Gefeliciteerd, Midden, 48pt, Rood" (A-08)
- [ ] Via toetsenbord te selecteren en te bewerken (A-08)
- [ ] Synchroniseert met visuele canvas-staat (A-08)

### Zoom & reflow
- [ ] Testen bij 100%–200% browserzoom (A-22, A-27)
- [ ] Enkelvoudige kolom bij 200% zoom (A-27)
- [ ] Geen horizontale scrollbalk bij 200% (A-22)
- [ ] Geen overlappende elementen bij 200% (A-27)
- [ ] `user-scalable=no` NIET aanwezig in viewport meta (A-28)

### Dark/light mode schakelaar
- [ ] Prominente schakelaar op beide schermen (A-19)
- [ ] Voorkeur opslaan in localStorage
- [ ] Beide modi voldoen aan contrastvereisten (A-15, A-16)

### Cross-browser
- [ ] Chrome — volledige functionaliteit (T-03)
- [ ] Edge — volledige functionaliteit (T-03)
- [ ] Firefox — File System Access fallback werkt (T-03)
- [ ] Safari — File System Access fallback werkt (T-03)

### Performance
- [ ] Paginalaadtijd onder 3 seconden (T-04)
- [ ] Geen externe API-calls tijdens gebruik (T-05)
- [ ] Alle assets lokaal gebundeld (T-02)

### Gebruikerstest
- [ ] Volledige keyboard-only workflow: maken, opslaan, laden, afdrukken (PRD §9)
- [ ] Screenreadertest: NVDA + Chrome (PRD §9)
- [ ] Screenreadertest: VoiceOver + Safari (PRD §9)
- [ ] Contrastcheck op alle UI-elementen (PRD §9)
- [ ] `prefers-reduced-motion` test (PRD §9)
- [ ] Test met doelgebruiker + iteratie (PRD §9)

---

## Open vragen (beantwoorden vóór Sprint 4)

- [ ] Gebruikt de doelgebruiker een screenreader? (beïnvloedt prioriteit A-08)
- [ ] Wat is het stadium van het glaucoom? (beïnvloedt contrastvereisten)
- [ ] Windows High Contrast Mode nodig? (vergt specifieke CSS-aanpassingen)
- [ ] Voorkeurs-fonts voor de kaarteditor?
- [ ] Templates als startpunt? (nice-to-have)
- [ ] Tablet/touchscreen-ondersteuning nodig?

---

## Verificatie na elke sprint

1. Open `index.html` in Chrome — controleer alle nieuwe functies
2. Tab door de volledige UI zonder muis — geen doodlopende wegen
3. Contrastcheck via browser DevTools of axe DevTools
4. Test bij 200% zoom — geen layoutbreuk
5. Vink voltooide taken aan in dit bestand
