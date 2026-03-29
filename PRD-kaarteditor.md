# PRD — Toegankelijke Wenskaart Editor
**Product Requirements Document**
Versie 1.0 | Maart 2026 | Codeless Factory

---

## 1. Productvisie

Een webgebaseerde kaarteditor waarmee één specifieke gebruiker — en potentieel een bredere doelgroep met een visuele beperking — zelfstandig persoonlijke wenskaarten kan ontwerpen, opslaan en afdrukken. De app vervangt de Hallmark-app, maar respecteert de werkpatronen die de gebruiker al heeft opgebouwd.

**Kernprincipe**: Toegankelijkheid is geen feature — het is de architectuur. Elke technische en designbeslissing wordt getoetst aan de vraag: *werkt dit voor iemand met glaucoom die voornamelijk via keyboard navigeert en afhankelijk is van hoog contrast?*

---

## 2. Gebruikersprofiel & Context

### Primaire gebruiker
- Visuele beperking door **glaucoom**
- Gebruikt de applicatie zelfstandig, thuis, op desktop/laptop
- Gewend aan vaste werkpatronen (Hallmark-app workflow)
- Werkt waarschijnlijk met **browservergroting** (150–200%)
- Kan mogelijk **screenreader** gebruiken voor navigatie (niet bevestigd)
- Voorkeur voor **toetsenbordnavigatie** boven muis voor precisiewerk

### Wat glaucoom concreet betekent voor UI-design

Uit klinisch onderzoek naar glaucoom zijn drie visuele effecten relevant voor deze app:

**1. Verminderde contrastgevoeligheid**
Het meest onderschatte symptoom. Glaucoom beschadigt de oogzenuw op een manier die de hersenen bemoeilijkt om luminantieverschillen te detecteren. Gebruikers ervaren dit als "wazige" of "vage" visie, ook al is de visuele scherpte (acuïteit) technisch nog goed. Dit betekent: elementen die voor normaalzienden duidelijk gescheiden lijken (bijv. lichtgrijs op wit) zijn voor deze gebruiker onleesbaar of onzichtbaar.

> **Design implicatie**: Contrast moet *ver* boven WCAG AA uitkomen. WCAG AAA (7:1) is de minimale richtlijn voor alle kritieke UI-elementen. Subtiele UI-details (borders, disabled states, placeholder tekst) moeten extra versterkt worden.

**2. Perifeer gezichtsverlies / beperkt gezichtsveld**
Glaucoom begint doorgaans aan de nasale zijde en breidt zich uit naar de periferie. In gevorderd stadium kan het gezichtsveld sterk vernauwd zijn — effectief als "door een buis kijken." De populaire "tunnelvisie" metafoor klopt echter niet precies: het is vaker een reeks blinde vlekken verspreid over het gezichtsveld, niet één nette cirkel. Gebruikers moeten actief met hun hoofd/ogen bewegen om content te scannen die normaal perifeer waarneembaar is.

> **Design implicatie**: Belangrijke UI-elementen (knoppen, status, feedback) mogen **niet** afhankelijk zijn van perifere zichtbaarheid. Vermijd: kleine iconen in hoeken, contextuele popovers ver van de focus, status indicators buiten het centrale viewport. Houd de actieve interface in een compact, centraal gebied.

**3. Verhoogde lichtgevoeligheid & glare-problemen**
Glaucoom vergroot ook de gevoeligheid voor glare (schittering) en moeite met licht-donker overgangen. Heldere witte achtergronden met veel lichtuitstraling kunnen vermoeiend zijn.

> **Design implicatie**: Bied een **dark mode als standaard** of als prominente optie. Vermijd pure `#FFFFFF` witte achtergronden voor de UI-chrome; gebruik gebroken wit of lichtgrijs. Vermijd animaties die flitsen of hoge-frequentie knipperen.

### Conclusie: Is specifieke glaucoom-aanpassing nodig bovenop algemene accessibility?

**Ja, op drie punten gaat glaucoom verder dan standaard WCAG:**

| Aspect | WCAG AA | Wat glaucoom vraagt |
|---|---|---|
| Contrast tekst | 4.5:1 | 7:1+ (WCAG AAA), bij voorkeur 10:1+ |
| Contrast UI-componenten | 3:1 | 4.5:1+ voor alle interactieve elementen |
| Layout | Geen eis | Compacte, centrale UI-zone; geen perifere afhankelijkheid |
| Kleurgebruik | Niet alleen kleur | Versterk: grote border, icoon, én tekst label op elk element |
| Achtergrond | Geen eis | Donkere standaard of gebroken wit — geen puur wit |

Voor de overige accessibility-eisen (ARIA, keyboard, focus) is goed gedaan WCAG 2.2 AA/AAA voldoende — specifieke glaucoom-aanpassingen komen bovenop, niet in plaats van.

---

## 3. Doelstellingen

### Must-haves (MVP)
- Kaarten ontwerpen met tekst en afbeeldingen op A5-formaat (dubbel gevouwen)
- Elementen slepen, roteren en schalen op het canvas
- Meerdere tekststijlen: font, kleur, grootte, decoratie (slagschaduw, omlijning)
- Clipart-bibliotheek (lokale set, offline beschikbaar)
- Voorkant en binnenkant van de kaart bewerken
- Opslaan en laden als lokaal bestand (`.kaart` formaat)
- Exporteren als PDF / afdrukken

### Should-haves
- Achtergrondkleur of -patroon per kaartpagina
- Undo / redo (minimaal 20 stappen)
- Dupliceren van elementen
- Meerdere recente kaarten tonen bij opstarten
- Donker/licht thema-schakelaar

### Nice-to-haves
- Voorgemaakte templates als startpunt
- Emoji picker als snelle clipart-optie
- Tekst op pad (curve)
- Automatisch opslaan (autosave)

### Out of scope
- Online opslag of cloud sync
- Delen via social media
- Meerdere gebruikersaccounts
- Animaties / GIF export
- Samenwerken

---

## 4. Functionele Vereisten

### 4.1 Canvas Editor

**FR-01** De editor toont twee canvassen: "Voorkant" en "Binnenkant", navigeerbaar via prominente tabs of knoppen.

**FR-02** Het canvas heeft de verhouding van A5 (148×210 mm). Bij het uitvoeren naar PDF worden beide pagina's naast elkaar geplaatst op een A4-liggend document.

**FR-03** De gebruiker kan een tekstelement toevoegen via een duidelijke knop "Tekst toevoegen". Het element verschijnt centraal op het canvas en is direct bewerkbaar.

**FR-04** De gebruiker kan een clipart-afbeelding kiezen uit de bibliotheek en toevoegen aan het canvas.

**FR-05** Elementen op het canvas zijn selecteerbaar via muisklik of Tab-toets. Het geselecteerde element krijgt een duidelijke visuele selectie-indicator (dikke contour, hoge contrast).

**FR-06** Geselecteerde elementen kunnen worden verplaatst via:
- Slepen met de muis
- Pijltjestoetsen (1px per stap, 10px met Shift ingedrukt)

**FR-07** Geselecteerde elementen kunnen worden geschaald via:
- Hoekhandvaten op het selectiekader
- Numerieke invoer in de eigenschappenpaneel

**FR-08** Geselecteerde elementen kunnen worden geroteerd via:
- Rotatiehandvat boven het selectiekader
- Numerieke invoer (graden) in de eigenschappenpaneel

**FR-09** De gebruiker kan elementen verwijderen via Delete/Backspace of een expliciete "Verwijder"-knop.

**FR-10** Undo (Ctrl+Z) en redo (Ctrl+Y / Ctrl+Shift+Z) ondersteunen minimaal 20 stappen.

### 4.2 Tekst & Stijlen

**FR-11** Voor tekstelementente zijn instelbaar: font (uit een curated lijst van ~8 fonts), lettergrootte (slider + numeriek), tekstkleur (kleurpicker), uitlijning (links, midden, rechts), vetgedrukt, cursief.

**FR-12** WordArt-effecten beschikbaar per tekstelement: slagschaduw (kleur + offset), omlijning (stroke, kleur + dikte), achtergrondvlak achter tekst.

**FR-13** De font-keuze toont een live preview van elk font met een voorbeeldtekst ("Gefeliciteerd!"), in groot formaat, zodat het font zichtbaar is zonder het te selecteren.

### 4.3 Clipart Bibliotheek

**FR-14** De bibliotheek bevat minimaal 40 cliparts, gegroepeerd per categorie (Verjaardag, Feest, Natuur, Dieren, Overig).

**FR-15** Cliparts zijn SVG of PNG van hoge kwaliteit, minimaal 512×512px, vrij van rechten.

**FR-16** De bibliotheek is doorzoekbaar via een tekstveld met live filtering.

**FR-17** Elke clipart heeft een beschrijvend alt-label en is via keyboard (Tab + Enter) te selecteren.

### 4.4 Opslaan & Laden

**FR-18** De gebruiker kan de kaart opslaan als `.kaart` bestand via de File System Access API (Chrome/Edge) of als download (Safari/Firefox fallback).

**FR-19** De gebruiker kan een eerder opgeslagen `.kaart` bestand openen via "Openen"-knop of via drag-and-drop op het startscherm.

**FR-20** Het `.kaart` formaat is JSON, bevat canvas-state van beide pagina's en ingesloten afbeeldingen als base64.

**FR-21** Bij het opstarten toont de app de 5 meest recent geopende bestanden als grote, klikbare kaartminiaturen.

### 4.5 Export & Afdrukken

**FR-22** "Download PDF" genereert een A4-liggend PDF met voorkant links en binnenkant rechts, klaar om uit te snijden en te vouwen.

**FR-23** "Afdrukken" opent de browser-printdialoog met een geoptimaliseerde `@media print` lay-out (geen UI-chrome, correcte marges).

**FR-24** De geëxporteerde PDF heeft minimaal 150 DPI beeldkwaliteit.

---

## 5. Niet-Functionele Vereisten

### 5.1 Toegankelijkheid (Randvoorwaarde — Niet Onderhandelbaar)

Toegankelijkheid is de primaire architecturele randvoorwaarde van deze applicatie. Elke component wordt gebouwd met accessibility als uitgangspunt, niet als nagedachte.

#### Keyboard navigatie (WCAG 2.2 — Level AA/AAA)

**A-01** De volledige applicatie is bedienbaar zonder muis. Alle functies zijn bereikbaar via toetsenbord.

**A-02** De Tab-volgorde volgt de visuele lay-out van boven naar beneden, links naar rechts. Geen logica die "terug" vereist om een menu te bereiken.

**A-03** De huidige focus-positie is altijd zichtbaar via een focus-indicator: minimaal 3px solid outline, kleur met contrastverhouding ≥ 3:1 ten opzichte van de omgeving (WCAG 2.2 Focus Appearance).

**A-04** Modals en dialoogvensters vangen focus op (focus trap) zolang ze open zijn. Bij sluiten keert focus terug naar het element dat de dialog opende.

**A-05** Keyboard shortcuts voor veelgebruikte acties:

| Actie | Shortcut |
|---|---|
| Tekst toevoegen | `T` |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Y` |
| Opslaan | `Ctrl+S` |
| Element verwijderen | `Delete` of `Backspace` |
| Pijltjes navigatie canvas | `←↑→↓` (1px), `Shift+←↑→↓` (10px) |
| Wisselen voor/binnenkant | `Tab` op canvasniveau / `1` en `2` |
| Afdrukken | `Ctrl+P` |

**A-06** Skip-link "Ga naar editor" staat als eerste element in de DOM voor screenreader-gebruikers.

#### ARIA & Semantiek

**A-07** Alle interactieve elementen hebben een beschrijvend `aria-label` of zichtbaar tekstlabel. Nooit een knop met alleen een icoon zonder label.

**A-08** De canvas-editor heeft een alternatieve tekst-gebaseerde interface naast de visuele editor: een lijst van elementen op het canvas ("Tekst: Gefeliciteerd, Midden, 48pt, Rood") die via keyboard te selecteren en te bewerken is. Dit is de primaire toegankelijke interface voor screenreader-gebruikers.

**A-09** Statusmeldingen (opgeslagen, fout, element toegevoegd) worden gepubliceerd via een `aria-live="polite"` regio, zodat screenreaders ze automatisch voorlezen.

**A-10** Alle formuliervelden hebben een gekoppeld `<label>` element. Placeholder tekst vervangt nooit een label.

**A-11** Tabs voor "Voorkant" / "Binnenkant" implementeren het WAI-ARIA Tabs pattern (`role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`).

**A-12** De clipart-bibliotheek implementeert een grid-navigatie pattern: pijltjestoetsen navigeren tussen items, Enter selecteert.

**A-13** Kleurpickers bieden naast de visuele picker ook een numerieke hex-invoer als alternatief.

**A-14** Alle afbeeldingen (cliparts, preview thumbnails) hebben een beschrijvend `alt` attribuut. Decoratieve afbeeldingen hebben `alt=""`.

#### Visueel design (glaucoom-specifiek + WCAG AAA)

**A-15** Contrast ratio voor alle tekst in de UI: minimaal **7:1** (WCAG AAA). Voor grote tekst (24px+ of 18px+ vetgedrukt): minimaal **4.5:1**.

**A-16** Contrast ratio voor alle interactieve UI-componenten (knoppen, invoervelden, sliders): minimaal **4.5:1** tussen component en achtergrond.

**A-17** Contrast ratio voor focus-indicatoren: minimaal **3:1** (WCAG 2.2 vereiste).

**A-18** Kleur wordt **nooit** als enige onderscheidende factor gebruikt. Elke status (geselecteerd, fout, actief, uitgeschakeld) wordt ook via vorm, icoon of tekst gecommuniceerd.

**A-19** De standaard UI-modus is **dark mode** (donkere achtergrond, lichte tekst), vanwege verlaagde glare-belasting voor glaucoom. Een prominente schakelaar biedt light mode als alternatief.

**A-20** Alle clickable/focusable elementen hebben een minimaal klikgebied van **48×48px** (WCAG 2.5.8 Target Size).

**A-21** Font voor de UI-chrome: **Atkinson Hyperlegible** als primair, met Lexend als fallback. Minimale body fontsize: **18px**. Minimale label fontsize: **16px**. Nooit kleiner dan 14px voor enige zichtbare tekst.

**A-22** Tekst is schaalbaar via browser-zoom tot 200% zonder verlies van functionaliteit of horizontale scrollbalk (WCAG 1.4.4 Resize Text, 1.4.10 Reflow).

**A-23** Geen `outline: none` of `outline: 0` zonder gelijkwaardige vervanging.

**A-24** Geen tijdslimieten op interacties. Geen auto-sluitende toasts of modals.

**A-25** Animaties en transities zijn subtiel en niet-flitserend. Respecteer `prefers-reduced-motion`: alle animaties zijn disabled als de gebruiker dit heeft ingesteld.

**A-26** De centrale werkzone (canvas + eigenschappenpaneel) is compact en gecentreerd. Kritieke acties (opslaan, undo, toevoegen) zijn nooit uitsluitend in hoeken of verre periferie van het scherm geplaatst.

#### Zoom & Magnification

**A-27** De app werkt correct bij browser-zoom van 100% tot 200%. Bij 200% zoom herschikt de lay-out zich naar een enkelvoudige kolom zonder overlappende elementen.

**A-28** Pinch-to-zoom op touchscreens is niet uitgeschakeld (`user-scalable=no` is verboden).

### 5.2 Technisch

**T-01** De applicatie werkt als standalone webapp zonder server-side backend (puur statisch: HTML/CSS/JS).

**T-02** De applicatie werkt offline na eerste load. Alle assets (fonts, cliparts, libraries) zijn lokaal gebundeld of gecached via Service Worker.

**T-03** De app werkt in actuele versies van Chrome, Edge en Firefox. Safari is ondersteund met fallback voor File System Access API.

**T-04** Paginalaadtijd onder 3 seconden op een gemiddelde verbinding.

**T-05** Geen externe API-calls tijdens normaal gebruik (privacy, offline-first).

### 5.3 Bruikbaarheid

**U-01** Een nieuwe gebruiker kan zonder instructie een eenvoudige kaart maken, opslaan en afdrukken binnen 10 minuten.

**U-02** De werkwijze volgt een lineair stap-patroon dat consistent is bij elk gebruik (vergelijkbaar met de Hallmark-app patronen die de gebruiker kent).

**U-03** Foutmeldingen zijn altijd in duidelijke mensentaal ("Het bestand kon niet worden opgeslagen. Probeer opnieuw."), nooit technische codes.

---

## 6. UX & Interactiepatroon

### Startscherm

```
┌─────────────────────────────────────────────────┐
│  🃏  Kaarteditor                    [☀ / 🌙]    │
├─────────────────────────────────────────────────┤
│                                                 │
│   [ + Nieuwe kaart maken ]   [ 📂 Openen ]      │
│        (grote primaire knop)                    │
│                                                 │
│   Recente kaarten:                              │
│   ┌──────┐  ┌──────┐  ┌──────┐                 │
│   │ mini │  │ mini │  │ mini │                 │
│   │ kaart│  │ kaart│  │ kaart│                 │
│   │      │  │      │  │      │                 │
│   └──────┘  └──────┘  └──────┘                 │
│   Verjaardag  Moeder    Sinterklaas              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Editor-scherm

```
┌─────────────────────────────────────────────────┐
│  [ ← Terug ]  Mijn Kaart       [ 💾 Opslaan ]   │
├──────────────┬──────────────────────────────────┤
│              │                                  │
│ WERKBALK     │     [ Voorkant ]  [ Binnenkant ] │
│              │   ┌──────────────────────────┐  │
│ [ + Tekst  ] │   │                          │  │
│              │   │      CANVAS              │  │
│ [ + Clipart] │   │                          │  │
│              │   │                          │  │
│ [Achtergrond]│   └──────────────────────────┘  │
│              │                                  │
│ ─────────── │   EIGENSCHAPPEN (geselecteerd)    │
│              │   Font: [Pacifico ▾]             │
│ [ ↩ Ongedaan]│   Grootte: [──●────] 48          │
│ [ ↪ Opnieuw ]│   Kleur: [████] #FF3366          │
│              │                                  │
├──────────────┴──────────────────────────────────┤
│   [ 🖨 Afdrukken ]    [ ⬇ Download PDF ]        │
└─────────────────────────────────────────────────┘
```

### Stappenwizard (optioneel patroon voor eerste gebruik)

Stap 1 → Achtergrond kiezen
Stap 2 → Tekst toevoegen & opmaken
Stap 3 → Clipart toevoegen & plaatsen
Stap 4 → Opslaan of afdrukken

---

## 7. Technische Stack

| Onderdeel | Keuze | Motivatie |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JavaScript | Geen build-tooling, werkt offline, geen dependency-rot |
| Canvas library | **Fabric.js 5.x** | Drag & drop, roteren, schalen, JSON serialisatie ingebouwd |
| PDF export | **jsPDF 2.x** | Lichtgewicht, geen server nodig |
| Bestandsopslag | **File System Access API** + download fallback | Dichtst bij native bestandservaring |
| Fonts | Google Fonts (lokaal gebundeld) | Geen externe calls tijdens gebruik |
| UI font | **Atkinson Hyperlegible** | Speciaal ontwikkeld voor slechtzienden |
| Cliparts | Lokale SVG set (public domain) | Offline, geen afhankelijkheden |

---

## 8. Bestandsformaat `.kaart`

```json
{
  "version": "1.0",
  "appName": "Kaarteditor",
  "format": "A5-dubbel",
  "title": "Verjaardag Mama",
  "created": "2026-03-28T10:00:00Z",
  "modified": "2026-03-28T11:30:00Z",
  "front": {
    "background": "#fff9f0",
    "canvas": { ...fabric.js JSON serialisatie... }
  },
  "inside": {
    "background": "#ffffff",
    "canvas": { ...fabric.js JSON serialisatie... }
  },
  "embeddedAssets": {
    "custom-image-001": "data:image/png;base64,..."
  }
}
```

---

## 9. Accessibility Conformantie-doelen

| Standaard | Niveau | Status |
|---|---|---|
| WCAG 2.2 | **AA** — volledig voldoen | Verplicht |
| WCAG 2.2 | **AAA** (contrast, tekst grootte, doelgrootte) | Verplicht voor glaucoom-relevante criteria |
| WAI-ARIA 1.2 | Correcte role/state/property implementatie | Verplicht |
| APCA (Accessible Perceptual Contrast Algorithm) | Lc 75+ voor body tekst | Richtlijn |

### Handmatige test-checklist
- [ ] Volledige keyboard-only workflow: kaart maken, opslaan, laden, afdrukken
- [ ] Screenreader test (NVDA + Chrome, VoiceOver + Safari)
- [ ] Browser zoom 200% test: geen overlapping, geen verlies van functie
- [ ] High Contrast Mode test (Windows)
- [ ] Contrast check op alle UI-elementen (axe DevTools of Colour Contrast Analyser)
- [ ] `prefers-reduced-motion` test: alle animaties disabled
- [ ] Test met doelgebruiker

---

## 10. Bouwvolgorde

### Sprint 1 — Basis editor (werkend skelet)
- Projectstructuur + HTML/CSS scaffolding (dark mode, Atkinson Hyperlegible)
- Fabric.js canvas initialisatie, voor- en binnenkant tabwisseling
- Tekst toevoegen, font/kleur/grootte instellen
- Basis keyboard navigatie + zichtbare focusstijlen

### Sprint 2 — Elementen & stijlen
- Clipart bibliotheek (grid, keyboard-navigeerbaar, ARIA)
- WordArt effecten (slagschaduw, omlijning)
- Undo/redo
- Achtergrondkleur instellen

### Sprint 3 — Opslag & export
- `.kaart` bestandsformaat (opslaan + laden)
- Recente bestanden op startscherm
- jsPDF export
- Browser afdrukken

### Sprint 4 — Accessibility & polish
- Volledige ARIA-implementatie (live regions, roles, labels)
- Alternatieve tekst-gebaseerde elementenlijst (A-08)
- Zoom 200% test & fixes
- Dark/light mode schakelaar
- User test met doelgebruiker + iteratie

---

## 11. Open Vragen

| # | Vraag | Impact |
|---|---|---|
| 1 | Gebruikt de doelgebruiker een screenreader? | Bepaalt prioriteit van A-08 (alternatieve elementenlijst) |
| 2 | Wat is het stadium van het glaucoom? | Bepaalt hoe zwaar de contrast-eisen moeten zijn |
| 3 | Werkt de gebruiker met Windows High Contrast Mode? | Vergt specifieke CSS-aanpassingen |
| 4 | Zijn er voorkeurs-fonts die de gebruiker al gebruikt? | Informeert font-selectie in de kaart-editor |
| 5 | Wil de gebruiker templates als startpunt? | Prioriteit voor sprint 2 vs. later |
| 6 | Moet de app op tablet/touchscreen werken? | Bepaalt touch-interactie vereisten voor canvas |

---

*PRD opgesteld: maart 2026 — gereed voor ontwikkeling Sprint 1*
