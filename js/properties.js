/* =============================================================================
   properties.js — Eigenschappenpaneel voor geselecteerde canvas-elementen
   Kaarteditor | Sprint 1
   ============================================================================= */

var KaartProperties = (function () {
  'use strict';

  var panel          = null;
  var activeObj      = null;
  var updating       = false;
  var initialized    = false;
  var _returnFocusEl = null; /* focus-herstel bij sluiten panel */

  function show(fabricObject) {
    if (!fabricObject) return;

    /* Type-guard: sprint 1 ondersteunt alleen tekstelementen.
       Clipart en andere typen (sprint 2) tonen het panel nog niet. */
    if (fabricObject.type !== 'textbox' && fabricObject.type !== 'i-text') return;

    activeObj = fabricObject;

    if (panel) {
      /* Sla huidige focus op zodat we die kunnen herstellen bij hide() */
      _returnFocusEl = document.activeElement !== panel ? document.activeElement : _returnFocusEl;
      panel.hidden = false;
    }

    populateFromObject(fabricObject);
  }

  function hide() {
    activeObj = null;
    if (panel) {
      panel.hidden = true;
      /* Herstel focus naar het element dat het panel opende */
      if (_returnFocusEl && typeof _returnFocusEl.focus === 'function') {
        _returnFocusEl.focus();
      }
      _returnFocusEl = null;
    }
  }

  function populateFromObject(obj) {
    updating = true;

    var fontEl = document.getElementById('prop-font');
    if (fontEl) fontEl.value = obj.fontFamily || 'Atkinson Hyperlegible';

    var size       = Math.round(obj.fontSize || 36);
    var sizeSlider = document.getElementById('prop-size-slider');
    var sizeInput  = document.getElementById('prop-size');
    if (sizeSlider) { sizeSlider.value = size; sizeSlider.setAttribute('aria-valuenow', size); }
    if (sizeInput)  sizeInput.value = size;

    /* Type-check op fill: gradient-objecten hebben een object als fill, geen string.
       Gebruik de fallback-kleur om een TypeError te voorkomen bij .toUpperCase(). */
    var fill        = (typeof obj.fill === 'string') ? obj.fill : '#333333';
    var colorPicker = document.getElementById('prop-color');
    var colorHex    = document.getElementById('prop-color-hex');
    if (colorPicker) colorPicker.value = fill;
    if (colorHex)    colorHex.value    = fill.toUpperCase();

    updateAlignmentButtons(obj.textAlign || 'center');
    updateToggleButton('prop-bold',   obj.fontWeight === 'bold');
    updateToggleButton('prop-italic', obj.fontStyle  === 'italic');

    updating = false;
  }

  function applyProperty(prop, value) {
    if (!activeObj || updating) return;
    activeObj.set(prop, value);
    activeObj.setCoords();
    var canvas = KaartCanvas.getCanvas();
    canvas.renderAll();
    /* Stuur object:modified zodat de sprint 2 undo-stack wijzigingen registreert */
    canvas.fire('object:modified', { target: activeObj });
  }

  function updateAlignmentButtons(align) {
    var alignMap = { left: 'prop-align-left', center: 'prop-align-center', right: 'prop-align-right' };
    Object.keys(alignMap).forEach(function (key) {
      var btn = document.getElementById(alignMap[key]);
      if (btn) btn.setAttribute('aria-pressed', key === align ? 'true' : 'false');
    });
  }

  function updateToggleButton(id, isActive) {
    var btn = document.getElementById(id);
    if (btn) btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  }

  function isValidHex(value) {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
  }

  function bindEvents() {
    var fontEl = document.getElementById('prop-font');
    if (fontEl) {
      fontEl.addEventListener('change', function () { applyProperty('fontFamily', this.value); });
    }

    var sizeSlider = document.getElementById('prop-size-slider');
    var sizeInput  = document.getElementById('prop-size');

    if (sizeSlider) {
      sizeSlider.addEventListener('input', function () {
        var val = parseInt(this.value, 10);
        if (sizeInput) sizeInput.value = val;
        sizeSlider.setAttribute('aria-valuenow', val);
        applyProperty('fontSize', val);
      });
    }

    if (sizeInput) {
      sizeInput.addEventListener('input', function () {
        var val = parseInt(this.value, 10);
        if (isNaN(val) || val < 12 || val > 120) return;
        if (sizeSlider) { sizeSlider.value = val; sizeSlider.setAttribute('aria-valuenow', val); }
        applyProperty('fontSize', val);
      });
    }

    var colorPicker = document.getElementById('prop-color');
    var colorHex    = document.getElementById('prop-color-hex');

    if (colorPicker) {
      colorPicker.addEventListener('input', function () {
        if (colorHex) colorHex.value = this.value.toUpperCase();
        applyProperty('fill', this.value);
      });
    }

    if (colorHex) {
      colorHex.addEventListener('input', function () {
        var val = this.value.trim();
        if (val.length > 0 && val[0] !== '#') val = '#' + val;
        if (isValidHex(val)) {
          if (colorPicker) colorPicker.value = val;
          applyProperty('fill', val);
        }
      });

      colorHex.addEventListener('blur', function () {
        var val = this.value.trim();
        var fallback = (activeObj && typeof activeObj.fill === 'string')
          ? activeObj.fill
          : '#333333';
        this.value = isValidHex(val) ? val.toUpperCase() : fallback.toUpperCase();
      });
    }

    ['left', 'center', 'right'].forEach(function (align) {
      var btn = document.getElementById('prop-align-' + align);
      if (btn) {
        btn.addEventListener('click', function () {
          applyProperty('textAlign', align);
          updateAlignmentButtons(align);
        });
      }
    });

    var boldBtn = document.getElementById('prop-bold');
    if (boldBtn) {
      boldBtn.addEventListener('click', function () {
        var isActive = this.getAttribute('aria-pressed') === 'true';
        applyProperty('fontWeight', isActive ? 'normal' : 'bold');
        updateToggleButton('prop-bold', !isActive);
      });
    }

    var italicBtn = document.getElementById('prop-italic');
    if (italicBtn) {
      italicBtn.addEventListener('click', function () {
        var isActive = this.getAttribute('aria-pressed') === 'true';
        applyProperty('fontStyle', isActive ? 'normal' : 'italic');
        updateToggleButton('prop-italic', !isActive);
      });
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;
    panel = document.getElementById('properties-panel');
    bindEvents();
  }

  return {
    init: init,
    show: show,
    hide: hide
  };

})();
