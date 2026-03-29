/* =============================================================================
   toolbar.js — Werkbalk: tekst toevoegen en knopkoppelingen
   Kaarteditor | Sprint 1
   ============================================================================= */

var KaartToolbar = (function () {
  'use strict';

  function addText() {
    var obj = KaartCanvas.addText();
    if (obj) {
      announceStatus('Tekstelement toegevoegd aan de ' +
        (KaartCanvas.getCurrentSide() === 'front' ? 'voorkant' : 'binnenkant'));
    }
  }

  function init() {
    var btnAddText = document.getElementById('btn-add-text');
    if (btnAddText) {
      btnAddText.addEventListener('click', addText);
    }
  }

  return {
    init:    init,
    addText: addText
  };

})();
