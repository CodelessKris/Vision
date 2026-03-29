/* =============================================================================
   undo.js — Undo/redo-stack
   Kaarteditor | Sprint 2

   Één globale stack (niet per zijde). Elke entry bevat de volledige canvas-staat
   én de zijde waarop die actie plaatsvond. Bij herstellen van een andere zijde
   wisselt het systeem automatisch en kondigt dit aan.

   Ontwerpprincipe: undoStack bevat "vorige" staten (staat vóór elke actie).
   previousSnapshot houdt bij wat het canvas was vóór de huidige actie.
   captureState() pusht previousSnapshot en actualiseert het daarna.
   ============================================================================= */

var KaartUndo = (function () {
  'use strict';

  var MAX_STACK = 20;

  var undoStack        = [];    /* array van state-entries (staat vóór elke actie) */
  var redoStack        = [];    /* geleegd bij elke nieuwe actie                   */
  var recording        = true;  /* false tijdens restore/side-switch               */
  var restoring        = false; /* blokkeert nieuw undo/redo zolang async bezig is */
  var initialized      = false;
  var previousSnapshot = null;  /* canvas-staat vóór de meest recente actie       */

  /* --- State entry -------------------------------------------------------- */

  function captureEntry() {
    var canvas = KaartCanvas.getCanvas();
    if (!canvas) return null;
    return {
      side:       KaartCanvas.getCurrentSide(),
      json:       canvas.toJSON(),
      background: canvas.backgroundColor
    };
  }

  /* --- Opnemen ------------------------------------------------------------ */

  /* captureState() wordt aangeroepen NADAT een actie plaatsvond (Fabric-event).
     We pushen de staat van VÓÓR de actie (previousSnapshot) naar de undoStack,
     zodat undo() die staat correct kan herstellen. */
  function captureState() {
    if (!recording || restoring) return;
    if (!previousSnapshot) {
      /* Eerste aanroep vóór init klaar is — sla huidige staat op als baseline. */
      previousSnapshot = captureEntry();
      return;
    }
    undoStack.push(previousSnapshot);
    if (undoStack.length > MAX_STACK) undoStack.shift();
    redoStack = [];
    /* Actualiseer previousSnapshot naar de staat ná de actie. */
    previousSnapshot = captureEntry();
    updateButtons();
  }

  /* record() — publieke hook voor wijzigingen die geen Fabric-event vuren
     (bv. achtergrondkleur). */
  function record() {
    captureState();
  }

  /* --- Herstel ------------------------------------------------------------ */

  function restore(entry, onDone) {
    if (restoring) return;
    restoring = true;
    recording = false;

    var canvas = KaartCanvas.getCanvas();
    var activeSide = KaartCanvas.getCurrentSide();

    function doLoad() {
      canvas.loadFromJSON(entry.json, function () {
        canvas.backgroundColor = entry.background;
        canvas.renderAll();
        recording = true;
        restoring = false;
        /* Sync previousSnapshot zodat de volgende actie de juiste baseline heeft. */
        previousSnapshot = captureEntry();
        updateButtons();
        if (onDone) onDone();
      });
    }

    if (entry.side !== activeSide) {
      /* Sla actieve zijde op in cardState zonder te wisselen. */
      KaartCanvas.snapshotCurrentSide();

      /* Werk de tab-UI direct bij — GEEN tab.click(), want dat triggert activateTab()
         → switchSide() → een eigen loadFromJSON die racet met doLoad hieronder. */
      var tabId      = entry.side === 'front' ? 'tab-front'   : 'tab-inside';
      var panelId    = entry.side === 'front' ? 'panel-front'  : 'panel-inside';
      var tabs       = Array.from(document.querySelectorAll('[role="tab"]'));
      var panels     = Array.from(document.querySelectorAll('[role="tabpanel"]'));
      var targetPanel = document.getElementById(panelId);
      var canvasContainer = document.getElementById('canvas-container');

      tabs.forEach(function (t) {
        var isActive = t.id === tabId;
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        t.setAttribute('tabindex',      isActive ? '0'    : '-1');
      });
      if (canvasContainer && targetPanel) {
        targetPanel.insertBefore(canvasContainer, targetPanel.firstChild);
      }
      panels.forEach(function (p) {
        p.hidden = p.getAttribute('aria-labelledby') !== tabId;
      });

      /* Zet currentSide zodat captureEntry() de juiste zijde registreert. */
      KaartCanvas.setCurrentSide(entry.side);

      requestAnimationFrame(doLoad);
    } else {
      doLoad();
    }
  }

  /* --- Undo --------------------------------------------------------------- */

  function undo() {
    if (!canUndo() || restoring) return false;

    var currentEntry = captureEntry();  /* huidige staat → naar redoStack        */
    var prevEntry    = undoStack.pop(); /* staat vóór laatste actie → herstellen */

    redoStack.push(currentEntry);
    restore(prevEntry, updateButtons);
    return true;
  }

  /* --- Redo --------------------------------------------------------------- */

  function redo() {
    if (!canRedo() || restoring) return false;

    var currentEntry = captureEntry();  /* huidige staat → naar undoStack        */
    var nextEntry    = redoStack.pop(); /* staat ná de ongedaan-gemaakte actie   */

    undoStack.push(currentEntry);
    if (undoStack.length > MAX_STACK) undoStack.shift();

    restore(nextEntry, updateButtons);
    return true;
  }

  /* --- Helpers ------------------------------------------------------------ */

  function canUndo() { return undoStack.length > 0; }
  function canRedo() { return redoStack.length > 0; }

  function pause()  { recording = false; }
  function resume() {
    recording = true;
    /* Sync previousSnapshot na zijdewisseling, zodat de volgende actie
       correct de nieuwe canvas-staat als baseline gebruikt. */
    previousSnapshot = captureEntry();
  }

  /* reset — wist de volledige undo/redo-geschiedenis. Aanroepen na het laden
     van een .kaart bestand, zodat de gebruiker niet terug kan undo-en naar
     de vorige kaart. */
  function reset() {
    undoStack        = [];
    redoStack        = [];
    previousSnapshot = captureEntry();
    updateButtons();
  }

  function updateButtons() {
    var btnUndo = document.getElementById('btn-undo');
    var btnRedo = document.getElementById('btn-redo');
    if (btnUndo) btnUndo.setAttribute('aria-disabled', canUndo() ? 'false' : 'true');
    if (btnRedo) btnRedo.setAttribute('aria-disabled', canRedo() ? 'false' : 'true');
  }

  /* --- Init --------------------------------------------------------------- */

  function init() {
    if (initialized) return;
    initialized = true;

    var canvas = KaartCanvas.getCanvas();
    if (!canvas) return;

    canvas.on('object:modified', captureState);
    canvas.on('object:added',    captureState);
    canvas.on('object:removed',  captureState);

    /* Sla de initiële lege canvas-staat op als baseline.
       Elke eerste actie (bv. tekst toevoegen) pusht dit naar de undoStack,
       waardoor undo() correct terugkeert naar het lege canvas. */
    previousSnapshot = captureEntry();
    updateButtons();
  }

  return {
    init:    init,
    undo:    undo,
    redo:    redo,
    record:  record,
    pause:   pause,
    resume:  resume,
    reset:   reset,
    canUndo: canUndo,
    canRedo: canRedo
  };

})();
