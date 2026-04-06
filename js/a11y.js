/* =============================================================================
   a11y.js — Tekst-gebaseerde elementenlijst en verdere toegankelijkheidslogica
   Kaarteditor | Sprint 4

   Publieke API (KaartA11y.*):
     init()     — koppel canvas-events, bouw initiële elementenlijst
     rebuild()  — herbouw de lijst volledig (na zijde-wissel of bestand laden)
     pause()    — stop event-verwerking tijdelijk (tijdens loadFromJSON)
     resume()   — hervat event-verwerking
   ============================================================================= */

var KaartA11y = (function () {
  'use strict';

  /* --- Privé staat --------------------------------------------------------- */

  var listEl          = null;   /* <ol id="element-list"> */
  var emptyEl         = null;   /* <p id="element-list-empty"> */
  var isPaused        = false;  /* onderdruk events tijdens loadFromJSON */
  var initialized     = false;
  var currentHighlight = null;  /* huidige [aria-current] knop — O(1) wissen */

  /* WeakMap: Fabric-object → <li> element.
     WeakMap is veiliger dan een reguliere Map: als Fabric het object vrijgeeft,
     leakt er geen referentie vanuit de Map. */
  var objToLi = typeof WeakMap !== 'undefined' ? new WeakMap() : null;

  /* --- Hulpfuncties -------------------------------------------------------- */

  /* describeObject — geeft een Nederlandstalige beschrijving van een Fabric-object.
     Formaat: "Tekst: Gefeliciteerd, Midden, 48pt, #FF3366" of "Clipart: Ballon, 120%" */
  function describeObject(obj) {
    if (!obj) return 'Onbekend element';

    var type  = obj.type || '';
    var parts = [];

    if (type === 'textbox' || type === 'i-text' || type === 'text') {
      var text = (obj.text || '').replace(/\s+/g, ' ').trim().slice(0, 25);
      parts.push('Tekst: \u201c' + text + '\u201d');

    } else if (type === 'image') {
      /* Geuploadde of online afbeelding */
      var imgLabel = obj.kaartLabel || 'Afbeelding';
      parts.push('Afbeelding: ' + imgLabel);

    } else {
      /* Clipart (SVG groep) of ander type */
      var label = obj.kaartLabel || '';
      parts.push(label ? ('Clipart: ' + label) : 'Clipart');
    }

    return parts.join(', ');
  }

  function alignLabel(align) {
    switch (align) {
      case 'left':    return 'Links';
      case 'right':   return 'Rechts';
      case 'center':  return 'Midden';
      case 'justify': return 'Uitlijnen';
      default:        return '';
    }
  }

  /* --- DOM-bouw ------------------------------------------------------------ */

  function buildListItem(obj, index) {
    var li = document.createElement('li');
    li.className = 'element-list-item-wrapper';

    /* Selecteer-knop: volledige breedte, toont de beschrijving */
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn element-list-item';
    btn.textContent = describeObject(obj);
    btn.addEventListener('click', function () {
      var canvas = KaartCanvas.getCanvas();
      if (!canvas) return;
      canvas.setActiveObject(obj);
      canvas.renderAll();
      /* Shift focus naar eigenschappenpaneel zodat de gebruiker meteen kan bewerken */
      var panel = document.querySelector('.properties-panel');
      if (panel) {
        var firstFocusable = panel.querySelector('button, input, select, [tabindex="0"]');
        if (firstFocusable) firstFocusable.focus();
      }
    });

    /* Actie-balk: Omhoog / Omlaag / Verwijderen */
    var actions = document.createElement('div');
    actions.className = 'element-list-actions';
    actions.setAttribute('role', 'group');
    actions.setAttribute('aria-label', 'Acties voor dit element');

    var btnUp = document.createElement('button');
    btnUp.type = 'button';
    btnUp.className = 'btn element-list-action-btn';
    btnUp.setAttribute('aria-label', 'Element naar voren brengen');
    btnUp.textContent = '\u2191'; /* ↑ */
    btnUp.addEventListener('click', function (e) {
      e.stopPropagation();
      KaartCanvas.bringForward(obj);
      /* rebuild() wordt getriggerd door het object:modified event */
    });

    var btnDown = document.createElement('button');
    btnDown.type = 'button';
    btnDown.className = 'btn element-list-action-btn';
    btnDown.setAttribute('aria-label', 'Element naar achteren sturen');
    btnDown.textContent = '\u2193'; /* ↓ */
    btnDown.addEventListener('click', function (e) {
      e.stopPropagation();
      KaartCanvas.sendBackwards(obj);
    });

    var btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'btn element-list-action-btn element-list-delete-btn';
    btnDel.setAttribute('aria-label', 'Element verwijderen');
    btnDel.textContent = '\u00d7'; /* × */
    btnDel.addEventListener('click', function (e) {
      e.stopPropagation();
      var canvas = KaartCanvas.getCanvas();
      if (!canvas) return;
      canvas.setActiveObject(obj);
      KaartCanvas.removeActiveObject();
      announceStatus('Element verwijderd');
    });

    actions.appendChild(btnUp);
    actions.appendChild(btnDown);
    actions.appendChild(btnDel);

    li.appendChild(btn);
    li.appendChild(actions);

    /* Sla de mapping op voor snelle updates */
    if (objToLi) objToLi.set(obj, li);

    return li;
  }

  function updateEmpty() {
    if (!listEl || !emptyEl) return;
    var hasItems = listEl.children.length > 0;
    emptyEl.hidden = hasItems;
  }

  /* --- Publieke functies --------------------------------------------------- */

  function rebuild() {
    if (!listEl) return;

    currentHighlight = null; /* alle DOM-nodes worden vervangen, referentie is stale */
    /* Verwijder alle bestaande items */
    while (listEl.firstChild) listEl.removeChild(listEl.firstChild);

    var canvas = KaartCanvas.getCanvas();
    if (!canvas) { updateEmpty(); return; }

    var objects = canvas.getObjects();
    objects.forEach(function (obj, idx) {
      var li = buildListItem(obj, idx);
      listEl.appendChild(li);
    });

    updateEmpty();

    /* Highlight het actieve object, indien aanwezig */
    var active = canvas.getActiveObject();
    if (active) highlightItem(active);
  }

  function highlightItem(obj) {
    /* Wis vorige highlight via opgeslagen referentie — geen DOM-query nodig */
    if (currentHighlight) { currentHighlight.removeAttribute('aria-current'); currentHighlight = null; }
    if (objToLi && obj && objToLi.has(obj)) {
      var li  = objToLi.get(obj);
      var btn = li.querySelector('.element-list-item');
      if (btn) {
        btn.setAttribute('aria-current', 'true');
        currentHighlight = btn;
        /* Geen scrollIntoView hier: de browser scrollt automatisch naar
           gefocuste elementen. Automatisch scrollen bij canvas-selectie
           (slepen, klikken) is storend voor visuele gebruikers. */
      }
    }
  }

  /* --- Canvas-event handlers ----------------------------------------------- */

  function onObjectAdded(e) {
    if (isPaused || !listEl) return;
    var obj = e.target;
    if (!obj) return;
    var li = buildListItem(obj, listEl.children.length);
    listEl.appendChild(li);
    updateEmpty();
  }

  function onObjectRemoved(e) {
    if (isPaused || !listEl) return;
    var obj = e.target;
    if (!obj) return;
    if (objToLi && objToLi.has(obj)) {
      var li = objToLi.get(obj);
      if (li && li.parentNode) li.parentNode.removeChild(li);
      objToLi.delete(obj);
    }
    updateEmpty();
  }

  /* Debounce voorkomt dat pijltjestoetsen (object:modified per keydown) de lijst
     bij elke pixel verplaatsing volledig herbouwen. 150ms is ruim onder perceptiedrempel. */
  var debouncedRebuild = debounce(rebuild, 150);

  function onObjectModified(e) {
    if (isPaused || !e.target) return;
    /* Herbouw volledig: z-volgorde kan veranderd zijn en rebuild() vervangt toch
       alle DOM-nodes — een tussentijdse text-update zou op een detached node werken. */
    debouncedRebuild();
  }

  function onSelectionCreated(e) {
    if (isPaused) return;
    var obj = e.selected && e.selected[0];
    if (!obj) obj = KaartCanvas.getCanvas() && KaartCanvas.getCanvas().getActiveObject();
    if (obj) {
      highlightItem(obj);
      announceStatus('Geselecteerd: ' + describeObject(obj));
    }
  }

  function onSelectionUpdated(e) {
    onSelectionCreated(e);
  }

  function onSelectionCleared() {
    if (isPaused) return;
    if (currentHighlight) { currentHighlight.removeAttribute('aria-current'); currentHighlight = null; }
  }

  /* --- Initialisatie ------------------------------------------------------- */

  function init() {
    if (initialized) return;
    initialized = true;

    listEl  = document.getElementById('element-list');
    emptyEl = document.getElementById('element-list-empty');

    if (!listEl) return; /* Niet op de editor-pagina */

    var canvas = KaartCanvas.getCanvas();
    if (!canvas) return;

    canvas.on('object:added',        onObjectAdded);
    canvas.on('object:removed',      onObjectRemoved);
    canvas.on('object:modified',     onObjectModified);
    canvas.on('selection:created',   onSelectionCreated);
    canvas.on('selection:updated',   onSelectionUpdated);
    canvas.on('selection:cleared',   onSelectionCleared);

    /* Maak het paneel zichtbaar nu init gereed is (was hidden in HTML) */
    var panel = document.getElementById('element-list-panel');
    if (panel) panel.hidden = false;

    rebuild();
  }

  function pause() {
    isPaused = true;
  }

  function resume() {
    isPaused = false;
  }

  /* updateObject — werk de beschrijvingstekst van een specifiek canvas-object direct
     bij in de lijst, zonder volledige rebuild. Bedoeld voor snelle feedback bij
     eigenschap-wijzigingen vanuit properties.js. Het object wordt als parameter
     meegegeven zodat we niet afhankelijk zijn van canvas.getActiveObject() —
     Fabric kan de selectie intern wissen (bijv. bij focus naar een <select>)
     terwijl properties.js het object nog steeds bijhoudt. */
  function updateObject(obj) {
    if (isPaused || !objToLi || !obj) return;
    if (!objToLi.has(obj)) return;
    var li  = objToLi.get(obj);
    var btn = li && li.querySelector('.element-list-item');
    if (btn) btn.textContent = describeObject(obj);
  }

  return {
    init:         init,
    rebuild:      rebuild,
    pause:        pause,
    resume:       resume,
    updateObject: updateObject
  };

})();
