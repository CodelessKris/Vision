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

    KaartCanvas.switchSide(side);

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
    if (key === 's') { e.preventDefault(); announceStatus('Opslaan is beschikbaar in Sprint 3.'); }
    if (key === 'p') { e.preventDefault(); announceStatus('Afdrukken is beschikbaar in Sprint 3.'); }

    /* Ctrl+Z en Ctrl+Y NIET onderscheppen in formuliervelden —
       daar verwacht de gebruiker dat de browser de tekst-undo/redo afhandelt. */
    if (!isFormField) {
      if (key === 'z') { e.preventDefault(); announceStatus('Ongedaan maken is beschikbaar in Sprint 2.'); }
      if (key === 'y') { e.preventDefault(); announceStatus('Opnieuw is beschikbaar in Sprint 2.'); }
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
    KaartToolbar.init();
    KaartProperties.init();

    KaartCanvas.onSelectionChange(function (obj) { KaartProperties.show(obj); });
    KaartCanvas.onSelectionCleared(function ()    { KaartProperties.hide();   });

    initTabs();
    initKeyboardShortcuts();

    var btnSave = document.getElementById('btn-save');
    if (btnSave) {
      btnSave.addEventListener('click', function () {
        announceStatus('Opslaan is beschikbaar in Sprint 3.');
      });
    }

    /* Toekomstige knoppen: klik toont beschikbaarheidsmelding.
       Ze hebben geen native disabled — ze blijven daardoor in de tabvolgorde
       zodat toetsenbordgebruikers ze kunnen ontdekken (aria-disabled="true"). */
    document.querySelectorAll('[aria-disabled="true"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var label = btn.getAttribute('aria-label') || '';
        var match = label.match(/beschikbaar in (Sprint \d+)/i);
        announceStatus(match ? (match[1] + ' — nog niet beschikbaar.') : 'Nog niet beschikbaar.');
      });
    });
  });

})();
