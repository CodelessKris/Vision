/* =============================================================================
   toolbar.js — Werkbalk: tekst toevoegen, clipart, achtergrond, dupliceren
   Kaarteditor | Sprint 2
   ============================================================================= */

var KaartToolbar = (function () {
  'use strict';

  var bgPopoverOpen = false;

  /* --- Tekst toevoegen ---------------------------------------------------- */

  function addText() {
    var obj = KaartCanvas.addText();
    if (obj) {
      announceStatus('Tekstelement toegevoegd aan de ' +
        (KaartCanvas.getCurrentSide() === 'front' ? 'voorkant' : 'binnenkant'));
    }
  }

  /* --- Achtergrondkleur popover ------------------------------------------- */

  function buildBackgroundPopover() {
    var anchor = document.querySelector('.toolbar-popover-anchor');
    if (!anchor) return;

    var popover = document.createElement('div');
    popover.id = 'bg-popover';
    popover.className = 'bg-popover';
    popover.setAttribute('role', 'group');
    popover.setAttribute('aria-labelledby', 'bg-popover-label');
    popover.hidden = true;
    popover.innerHTML =
      '<span id="bg-popover-label" class="prop-group-label">Achtergrondkleur</span>' +
      '<div class="color-row">' +
        '<input type="color" id="bg-color-picker" aria-label="Achtergrondkleur kiezen">' +
        '<input type="text" id="bg-color-hex" maxlength="7"' +
               ' pattern="^#[0-9A-Fa-f]{6}$"' +
               ' aria-label="Achtergrondkleur als hex-waarde"' +
               ' placeholder="#ffffff">' +
      '</div>';

    anchor.appendChild(popover);

    /* Debounce undo-opname zodat slepen over de kleurpicker niet elke pixel
       een snapshot aanmaakt; visuele update (setBackground) blijft direct. */
    var debouncedBgRecord = debounce(function () {
      KaartUndo.record();
      announceStatus('Achtergrondkleur gewijzigd');
    }, 300);

    bindColorPair('bg-color-picker', 'bg-color-hex', function (color) {
      KaartCanvas.setBackground(color);
      debouncedBgRecord();
    });

    /* Escape sluit popover */
    popover.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeBackgroundPopover();
        var btn = document.getElementById('btn-background');
        if (btn) btn.focus();
      }
    });
  }

  function openBackgroundPopover() {
    var popover = document.getElementById('bg-popover');
    var btn = document.getElementById('btn-background');
    if (!popover) return;

    /* Synchroniseer met huidige achtergrondkleur */
    var canvas = KaartCanvas.getCanvas();
    var current = (canvas && canvas.backgroundColor) ? canvas.backgroundColor : '#ffffff';
    var picker = document.getElementById('bg-color-picker');
    var hexInput = document.getElementById('bg-color-hex');
    if (picker) picker.value = current;
    if (hexInput) hexInput.value = current.toUpperCase();

    /* Positie: rechts van de knop, gebaseerd op viewport-coördinaten (position:fixed).
       Gebruik de knop-afmetingen om te voorkomen dat de popover buiten het scherm valt. */
    if (btn) {
      var rect = btn.getBoundingClientRect();
      var popW = 240; /* min-width + padding marge */
      var left = rect.right + 10;
      if (left + popW > window.innerWidth) {
        left = rect.left - popW - 10;
      }
      popover.style.top  = rect.top + 'px';
      popover.style.left = left + 'px';
    }

    popover.hidden = false;
    bgPopoverOpen = true;
    if (btn) btn.setAttribute('aria-expanded', 'true');

    /* Focus eerste veld */
    if (picker) picker.focus();
  }

  function closeBackgroundPopover() {
    var popover = document.getElementById('bg-popover');
    var btn = document.getElementById('btn-background');
    if (popover) popover.hidden = true;
    bgPopoverOpen = false;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function toggleBackgroundPopover() {
    if (bgPopoverOpen) {
      closeBackgroundPopover();
    } else {
      openBackgroundPopover();
    }
  }

  /* --- Dupliceren --------------------------------------------------------- */

  function duplicateElement() {
    var canvas = KaartCanvas.getCanvas();
    if (!canvas) return;
    var obj = canvas.getActiveObject();
    if (!obj) return;

    obj.clone(function (cloned) {
      cloned.set({
        left: (obj.left || 0) + 20,
        top:  (obj.top  || 0) + 20
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      announceStatus('Element gedupliceerd');
    });
  }

  /* --- Init --------------------------------------------------------------- */

  function init() {
    var btnAddText = document.getElementById('btn-add-text');
    if (btnAddText) btnAddText.addEventListener('click', addText);

    var btnClipart = document.getElementById('btn-add-clipart');
    if (btnClipart) {
      btnClipart.addEventListener('click', function () {
        KaartClipart.open();
      });
    }

    var btnBg = document.getElementById('btn-background');
    if (btnBg) {
      btnBg.addEventListener('click', toggleBackgroundPopover);
    }

    buildBackgroundPopover();

    /* Sluit popover bij klik buiten */
    document.addEventListener('click', function (e) {
      if (!bgPopoverOpen) return;
      var anchor = document.querySelector('.toolbar-popover-anchor');
      if (anchor && !anchor.contains(e.target)) {
        closeBackgroundPopover();
      }
    });

    var btnDuplicate = document.getElementById('btn-duplicate');
    if (btnDuplicate) {
      btnDuplicate.addEventListener('click', duplicateElement);
    }
  }

  return {
    init:             init,
    addText:          addText,
    duplicateElement: duplicateElement
  };

})();
