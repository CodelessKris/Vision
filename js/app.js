/* =============================================================================
   app.js — Entry point en orchestratie
   Kaarteditor | Sprint 1
   ============================================================================= */

(function () {
  'use strict';

  /* --- Gecachede DOM-referenties voor tabs (eenmalig opgezocht) --- */
  var cachedTabs   = null;
  var cachedPanels = null;

  /* ============================================================
     ARIA Tabs — Voorkant / Binnenkant (A-11, FR-01)
     WAI-ARIA Tabs pattern: manual activation
     https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
     ============================================================ */

  function initTabs() {
    var tablist = document.querySelector('[role="tablist"]');
    if (!tablist) return;

    cachedTabs   = Array.from(tablist.querySelectorAll('[role="tab"]'));
    cachedPanels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

    tablist.addEventListener('keydown', function (e) {
      var current = document.activeElement;
      if (current.getAttribute('role') !== 'tab') return;

      var index = cachedTabs.indexOf(current);
      var newIndex;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = (index - 1 + cachedTabs.length) % cachedTabs.length;
          cachedTabs[newIndex].focus();
          break;
        case 'ArrowRight':
          e.preventDefault();
          newIndex = (index + 1) % cachedTabs.length;
          cachedTabs[newIndex].focus();
          break;
        case 'Home':
          e.preventDefault();
          cachedTabs[0].focus();
          break;
        case 'End':
          e.preventDefault();
          cachedTabs[cachedTabs.length - 1].focus();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          activateTab(current.id);
          break;
      }
    });

    cachedTabs.forEach(function (tab) {
      tab.addEventListener('click', function () { activateTab(tab.id); });
    });
  }

  function activateTab(tabId) {
    var side = tabId === 'tab-front' ? 'front' : 'inside';
    if (KaartCanvas.getCurrentSide() === side) return;

    cachedTabs.forEach(function (tab) {
      var isActive = tab.id === tabId;
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex',      isActive ? '0'    : '-1');
    });

    var targetPanelId = tabId === 'tab-front' ? 'panel-front' : 'panel-inside';
    var targetPanel   = document.getElementById(targetPanelId);
    var canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer && targetPanel) {
      targetPanel.insertBefore(canvasContainer, targetPanel.firstChild);
    }

    cachedPanels.forEach(function (panel) {
      panel.hidden = panel.getAttribute('aria-labelledby') !== tabId;
    });

    /* Pauzeer undo-opname tijdens wisselen — loadFromJSON in switchSide vuurt
       anders object:added events die onterecht als undo-stap worden opgeslagen.
       resume() wordt aangeroepen vanuit de switchSide-callback zodra loadFromJSON
       klaar is — niet via een vaste timeout die te vroeg kan vuren. */
    KaartUndo.pause();
    KaartCanvas.switchSide(side, KaartUndo.resume);

    announceStatus(side === 'front' ? 'Voorkant actief' : 'Binnenkant actief');

    if (targetPanel) {
      requestAnimationFrame(function () { targetPanel.focus(); });
    }
  }

  /* ============================================================
     Globale keyboard shortcuts (A-05)
     ============================================================ */

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', handleGlobalKeydown);
  }

  function handleGlobalKeydown(e) {
    var tag             = e.target.tagName;
    var isFormField     = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    var canvas          = KaartCanvas.getCanvas();
    var isCanvasEditing = canvas && canvas.getActiveObject() && canvas.getActiveObject().isEditing;

    if (e.ctrlKey || e.metaKey) {
      handleCtrlShortcuts(e);
      return;
    }

    if (isFormField || isCanvasEditing) return;

    switch (e.key) {
      case 't':
      case 'T':
        e.preventDefault();
        KaartToolbar.addText();
        break;

      case '1':
        e.preventDefault();
        activateTab('tab-front');
        break;

      case '2':
        e.preventDefault();
        activateTab('tab-inside');
        break;

      case 'Delete':
      case 'Backspace':
        if (canvas && canvas.getActiveObject()) {
          e.preventDefault();
          KaartCanvas.removeActiveObject();
          announceStatus('Element verwijderd');
        }
        break;

      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
        handleArrowKeys(e);
        break;
    }
  }

  function handleCtrlShortcuts(e) {
    var tag         = e.target.tagName;
    var isFormField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    var key         = e.key.toLowerCase();

    /* Ctrl+S en Ctrl+P altijd onderscheppen — anders opent de browser een dialoog */
    if (key === 's') { e.preventDefault(); KaartStorage.save(); }
    if (key === 'p') { e.preventDefault(); KaartExport.print(); }

    /* Ctrl+Z en Ctrl+Y NIET onderscheppen in formuliervelden —
       daar verwacht de gebruiker dat de browser de tekst-undo/redo afhandelt. */
    if (!isFormField) {
      if (key === 'z') { e.preventDefault(); doUndo(); }
      if (key === 'y') { e.preventDefault(); doRedo(); }
      if (key === 'd') { e.preventDefault(); KaartToolbar.duplicateElement(); }
    }
  }

  function doUndo() {
    if (KaartUndo.undo()) {
      announceStatus('Ongedaan gemaakt');
    } else {
      announceStatus('Niets om ongedaan te maken');
    }
  }

  function doRedo() {
    if (KaartUndo.redo()) {
      announceStatus('Opnieuw uitgevoerd');
    } else {
      announceStatus('Niets om opnieuw uit te voeren');
    }
  }

  function handleArrowKeys(e) {
    var canvas = KaartCanvas.getCanvas();
    if (!canvas || !canvas.getActiveObject()) return;

    e.preventDefault();
    var delta = e.shiftKey ? 10 : 1;
    var dx = 0, dy = 0;

    switch (e.key) {
      case 'ArrowLeft':  dx = -delta; break;
      case 'ArrowRight': dx =  delta; break;
      case 'ArrowUp':    dy = -delta; break;
      case 'ArrowDown':  dy =  delta; break;
    }

    KaartCanvas.moveActiveObject(dx, dy);
  }

  /* ============================================================
     Initialisatie (DOMContentLoaded)
     ============================================================ */

  document.addEventListener('DOMContentLoaded', function () {
    KaartCanvas.init();
    KaartUndo.init();      /* na canvas, vóór toolbar */
    KaartStorage.init();   /* na canvas+undo: dirty-tracking + beforeunload */
    KaartClipart.init();   /* vóór toolbar zodat open() beschikbaar is */
    KaartToolbar.init();
    KaartProperties.init();

    KaartCanvas.onSelectionChange(function (obj) { KaartProperties.show(obj); });
    KaartCanvas.onSelectionCleared(function ()    { KaartProperties.hide();   });

    initTabs();
    initKeyboardShortcuts();
    KaartStorage.checkPendingOpen(); /* laad kaart uit sessionStorage indien aanwezig */

    /* Undo/redo knoppen (aria-disabled wordt dynamisch beheerd door KaartUndo) */
    var btnUndo = document.getElementById('btn-undo');
    if (btnUndo) {
      btnUndo.addEventListener('click', function () {
        if (btnUndo.getAttribute('aria-disabled') !== 'true') {
          doUndo();
        } else {
          announceStatus('Niets om ongedaan te maken.');
        }
      });
    }

    var btnRedo = document.getElementById('btn-redo');
    if (btnRedo) {
      btnRedo.addEventListener('click', function () {
        if (btnRedo.getAttribute('aria-disabled') !== 'true') {
          doRedo();
        } else {
          announceStatus('Niets om opnieuw uit te voeren.');
        }
      });
    }

    var btnSave = document.getElementById('btn-save');
    if (btnSave) {
      btnSave.addEventListener('click', function () { KaartStorage.save(); });
    }

    var btnPrint = document.getElementById('btn-print');
    if (btnPrint) {
      btnPrint.addEventListener('click', function () { KaartExport.print(); });
    }

    var btnDownload = document.getElementById('btn-download');
    if (btnDownload) {
      btnDownload.addEventListener('click', function () { KaartExport.downloadPDF(); });
    }

    /* Sync aria-expanded op <details>/<summary> — Firefox + NVDA kondigt
       expanded/collapsed niet altijd aan via native <details>-semantiek. */
    document.querySelectorAll('details').forEach(function (det) {
      var summary = det.querySelector('summary');
      if (!summary) return;
      summary.setAttribute('aria-expanded', det.open ? 'true' : 'false');
      det.addEventListener('toggle', function () {
        summary.setAttribute('aria-expanded', det.open ? 'true' : 'false');
      });
    });

    /* Toekomstige knoppen (Sprint 4+): klik toont beschikbaarheidsmelding. */
    var sprint3Active = ['btn-undo', 'btn-redo', 'btn-add-clipart', 'btn-background',
                         'btn-save', 'btn-print', 'btn-download'];
    document.querySelectorAll('[aria-disabled="true"]').forEach(function (btn) {
      if (sprint3Active.indexOf(btn.id) !== -1) return;
      btn.addEventListener('click', function () {
        var label = btn.getAttribute('aria-label') || '';
        var match = label.match(/beschikbaar in (Sprint \d+)/i);
        announceStatus(match ? (match[1] + ' — nog niet beschikbaar.') : 'Nog niet beschikbaar.');
      });
    });
  });

})();
