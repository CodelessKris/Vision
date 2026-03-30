/* =============================================================================
   properties.js — Eigenschappenpaneel voor geselecteerde canvas-elementen
   Kaarteditor | Sprint 2
   ============================================================================= */

var KaartProperties = (function () {
  'use strict';

  var panel          = null;
  var activeObj      = null;
  var updating       = false;
  var initialized    = false;
  var _returnFocusEl = null; /* focus-herstel bij sluiten panel */

  /* Debounced object:modified — voorkomt dat sleepbewegingen op sliders
     de undo-stack overspoelen. renderAll() blijft direct; alleen de
     undo-opname wordt gebatcht op 250 ms na de laatste wijziging. */
  var debouncedFireModified = debounce(function () {
    if (!activeObj) return;
    KaartCanvas.getCanvas().fire('object:modified', { target: activeObj });
  }, 250);

  /* --- Zichtbaarheid panel & secties -------------------------------------- */

  function show(fabricObject) {
    if (!fabricObject) return;

    /* Negeer stale callbacks: als het object dat show() aanroept niet
       overeenkomt met het huidig actieve canvas-object, sla dan over.
       Dit vangt het geval op waarbij selection:updated een oud object doorgeeft. */
    var canvasActive = KaartCanvas.getActiveObject();
    if (canvasActive && canvasActive !== fabricObject) {
      fabricObject = canvasActive;
    }

    activeObj = fabricObject;

    if (panel) {
      _returnFocusEl = document.activeElement !== panel ? document.activeElement : _returnFocusEl;
      panel.hidden = false;
    }

    var isText = fabricObject.type === 'textbox' || fabricObject.type === 'i-text';

    /* Tekst-specifieke secties */
    toggleSection('text-props', isText);
    toggleSection('wordart-section', isText);

    /* Transformatie-sectie voor alle objecttypen */
    toggleSection('transform-section', true);

    populateFromObject(fabricObject);
  }

  function hide() {
    activeObj = null;
    if (panel) {
      panel.hidden = true;
      if (_returnFocusEl && typeof _returnFocusEl.focus === 'function') {
        _returnFocusEl.focus();
      }
      _returnFocusEl = null;
    }
  }

  /* Toon/verberg een sectie op basis van ID */
  function toggleSection(id, visible) {
    var el = document.getElementById(id);
    if (el) el.hidden = !visible;
  }

  /* --- Properties invullen vanuit Fabric-object --------------------------- */

  function populateFromObject(obj) {
    updating = true;

    var isText = obj.type === 'textbox' || obj.type === 'i-text';

    if (isText) {
      /* Font */
      var fontEl = document.getElementById('prop-font');
      if (fontEl) fontEl.value = obj.fontFamily || 'Atkinson Hyperlegible';

      /* Lettergrootte */
      var size       = Math.round(obj.fontSize || 36);
      var sizeSlider = document.getElementById('prop-size-slider');
      var sizeInput  = document.getElementById('prop-size');
      if (sizeSlider) { sizeSlider.value = size; sizeSlider.setAttribute('aria-valuenow', size); }
      if (sizeInput)  sizeInput.value = size;

      /* Tekstkleur */
      var fill        = (typeof obj.fill === 'string') ? obj.fill : '#333333';
      var colorPicker = document.getElementById('prop-color');
      var colorHex    = document.getElementById('prop-color-hex');
      if (colorPicker) colorPicker.value = fill;
      if (colorHex)    colorHex.value    = fill.toUpperCase();

      /* Uitlijning & opmaak */
      updateAlignmentButtons(obj.textAlign || 'center');
      updateToggleButton('prop-bold',   obj.fontWeight === 'bold');
      updateToggleButton('prop-italic', obj.fontStyle  === 'italic');

      /* WordArt — slagschaduw */
      var shadowEnabled = document.getElementById('prop-shadow-enabled');
      var shadowColor   = document.getElementById('prop-shadow-color');
      var shadowColorHex = document.getElementById('prop-shadow-color-hex');
      var shadowOffset  = document.getElementById('prop-shadow-offset');
      var hasShadow = !!(obj.shadow && obj.shadow.color);
      if (shadowEnabled) shadowEnabled.checked = hasShadow;
      if (hasShadow) {
        var sc = obj.shadow.color || '#000000';
        if (shadowColor) shadowColor.value = sc;
        if (shadowColorHex) shadowColorHex.value = sc.toUpperCase();
        if (shadowOffset) shadowOffset.value = Math.abs(obj.shadow.offsetX || 4);
      } else {
        if (shadowColor) shadowColor.value = '#000000';
        if (shadowColorHex) shadowColorHex.value = '#000000';
        if (shadowOffset) shadowOffset.value = 4;
      }

      /* WordArt — omlijning */
      var strokeColor   = document.getElementById('prop-stroke-color');
      var strokeColorHex = document.getElementById('prop-stroke-color-hex');
      var strokeWidth   = document.getElementById('prop-stroke-width');
      var sc2 = (typeof obj.stroke === 'string' && obj.stroke) ? obj.stroke : '#000000';
      if (strokeColor) strokeColor.value = sc2;
      if (strokeColorHex) strokeColorHex.value = sc2.toUpperCase();
      /* strokeWidth=1 is Fabric.js default maar niet zichtbaar zonder kleur;
         toon 0 zolang er geen stroke-kleur is ingesteld. */
      if (strokeWidth) strokeWidth.value = (obj.stroke) ? (obj.strokeWidth || 1) : 0;

      /* WordArt — tekstachtergrond */
      var textBgColor   = document.getElementById('prop-textbg-color');
      var textBgColorHex = document.getElementById('prop-textbg-color-hex');
      var tbg = obj.textBackgroundColor || '';
      if (textBgColor) textBgColor.value = tbg || '#ffffff';
      if (textBgColorHex) textBgColorHex.value = tbg ? tbg.toUpperCase() : '';
    }

    /* Transformatie (voor alle typen) */
    var scaleSlider = document.getElementById('prop-scale-slider');
    var scaleInput  = document.getElementById('prop-scale');
    var rotateInput = document.getElementById('prop-rotate');
    var scalePct = Math.round(((obj.scaleX || 1) + (obj.scaleY || 1)) / 2 * 100);
    if (scaleSlider) { scaleSlider.value = scalePct; scaleSlider.setAttribute('aria-valuenow', scalePct); }
    if (scaleInput)  scaleInput.value = scalePct;
    if (rotateInput) rotateInput.value = Math.round(obj.angle || 0);

    updating = false;
  }

  /* --- Eigenschap toepassen op Fabric-object ------------------------------ */

  function applyProperty(prop, value) {
    if (!activeObj || updating) return;
    activeObj.set(prop, value);
    activeObj.setCoords();
    KaartCanvas.getCanvas().renderAll();
    /* Werk elementenlijst meteen bij — debouncedFireModified wacht 250ms (voor undo),
       maar de beschrijving in de lijst moet direct kloppen (A-08).
       Geef activeObj expliciet mee: canvas.getActiveObject() kan null zijn als Fabric
       intern de selectie wist (bijv. bij focus naar <select>-dropdown). */
    if (typeof KaartA11y !== 'undefined') KaartA11y.updateObject(activeObj);
    debouncedFireModified();
  }

  /* --- Hulpfuncties -------------------------------------------------------- */

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

  /* Bouw een fabric.Shadow op vanuit de huidige invoerwaarden */
  function buildShadow() {
    var color  = (document.getElementById('prop-shadow-color')  || {}).value  || '#000000';
    var offset = parseInt((document.getElementById('prop-shadow-offset') || {}).value, 10) || 4;
    return new fabric.Shadow({
      color:   color,
      offsetX: offset,
      offsetY: offset,
      blur:    2
    });
  }

  /* --- Events koppelen ---------------------------------------------------- */

  function bindEvents() {
    /* Font
       De browser laadt @font-face fonts pas als een DOM-element ze gebruikt.
       Omdat Fabric.js op een <canvas> tekent (geen DOM), moeten we het gekozen
       font eerst via de Font Loading API laden voordat Fabric renderAll() aanroept.
       Zonder dit valt de browser terug op het standaardfont. */
    var fontEl = document.getElementById('prop-font');
    if (fontEl) {
      fontEl.addEventListener('change', function () {
        var family = this.value;
        if (document.fonts && document.fonts.load) {
          document.fonts.load('400 40px "' + family + '"').then(function () {
            applyProperty('fontFamily', family);
          });
        } else {
          applyProperty('fontFamily', family);
        }
      });
    }

    /* Lettergrootte */
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

    /* Tekstkleur */
    bindColorPair('prop-color', 'prop-color-hex', function (c) { applyProperty('fill', c); });

    /* Uitlijning */
    ['left', 'center', 'right'].forEach(function (align) {
      var btn = document.getElementById('prop-align-' + align);
      if (btn) {
        btn.addEventListener('click', function () {
          applyProperty('textAlign', align);
          updateAlignmentButtons(align);
        });
      }
    });

    /* Vet / cursief */
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

    /* ---- WordArt: slagschaduw ---- */

    var shadowEnabled = document.getElementById('prop-shadow-enabled');
    if (shadowEnabled) {
      shadowEnabled.addEventListener('change', function () {
        applyProperty('shadow', this.checked ? buildShadow() : null);
      });
    }

    var shadowOffset = document.getElementById('prop-shadow-offset');
    if (shadowOffset) {
      shadowOffset.addEventListener('input', function () {
        if (shadowEnabled && shadowEnabled.checked) {
          applyProperty('shadow', buildShadow());
        }
      });
    }

    bindColorPair('prop-shadow-color', 'prop-shadow-color-hex', function () {
      if (shadowEnabled && shadowEnabled.checked) {
        applyProperty('shadow', buildShadow());
      }
    });

    /* ---- WordArt: omlijning ---- */

    var strokeWidth = document.getElementById('prop-stroke-width');
    if (strokeWidth) {
      strokeWidth.addEventListener('input', function () {
        var w = parseFloat(this.value) || 0;
        applyProperty('strokeWidth', w);
        if (w > 0) {
          var sc = (document.getElementById('prop-stroke-color') || {}).value || '#000000';
          applyProperty('stroke', sc);
        } else {
          applyProperty('stroke', '');
        }
      });
    }

    bindColorPair('prop-stroke-color', 'prop-stroke-color-hex', function (c) {
      var w = parseFloat((document.getElementById('prop-stroke-width') || {}).value) || 0;
      if (w > 0) applyProperty('stroke', c);
    });

    /* ---- WordArt: tekstachtergrond ---- */

    var textBgHex = document.getElementById('prop-textbg-color-hex');
    var textBgPicker = document.getElementById('prop-textbg-color');

    if (textBgPicker) {
      textBgPicker.addEventListener('input', function () {
        if (textBgHex) textBgHex.value = this.value.toUpperCase();
        applyProperty('textBackgroundColor', this.value);
      });
    }

    if (textBgHex) {
      textBgHex.addEventListener('input', function () {
        var val = this.value.trim();
        if (val === '') {
          applyProperty('textBackgroundColor', '');
          return;
        }
        if (val.length > 0 && val[0] !== '#') val = '#' + val;
        if (isValidHex(val)) {
          if (textBgPicker) textBgPicker.value = val;
          applyProperty('textBackgroundColor', val);
        }
      });
      textBgHex.addEventListener('blur', function () {
        var val = this.value.trim();
        if (val !== '' && !isValidHex(val)) {
          this.value = '';
          applyProperty('textBackgroundColor', '');
        }
      });
    }

    /* ---- Transformatie: schaal ---- */

    var scaleSlider = document.getElementById('prop-scale-slider');
    var scaleInput  = document.getElementById('prop-scale');

    function applyScale(pct) {
      if (!activeObj || updating) return;
      var factor = pct / 100;
      activeObj.set({ scaleX: factor, scaleY: factor });
      activeObj.setCoords();
      var canvas = KaartCanvas.getCanvas();
      canvas.renderAll();
      if (typeof KaartA11y !== 'undefined') KaartA11y.updateObject(activeObj);
      debouncedFireModified();
    }

    if (scaleSlider) {
      scaleSlider.addEventListener('input', function () {
        var val = parseInt(this.value, 10);
        if (scaleInput) scaleInput.value = val;
        scaleSlider.setAttribute('aria-valuenow', val);
        applyScale(val);
      });
    }

    if (scaleInput) {
      scaleInput.addEventListener('input', function () {
        var val = parseInt(this.value, 10);
        if (isNaN(val) || val < 10 || val > 500) return;
        if (scaleSlider) scaleSlider.value = val;
        applyScale(val);
      });
    }

    /* ---- Transformatie: rotatie ---- */

    var rotateInput = document.getElementById('prop-rotate');
    if (rotateInput) {
      rotateInput.addEventListener('input', function () {
        var val = parseInt(this.value, 10);
        if (isNaN(val)) return;
        val = ((val % 360) + 360) % 360;
        applyProperty('angle', val);
      });
    }

    /* ---- Sync terugkoppeling van canvas-handvaten naar invoervelden ---- */
    var canvas = KaartCanvas.getCanvas();
    if (canvas) {
      canvas.on('object:modified', function (e) {
        /* Bijwerken als het de geselecteerde object is (maar niet tijdens updating) */
        if (e.target && e.target === activeObj && !updating) {
          updating = true;
          var scalePct = Math.round(((e.target.scaleX || 1) + (e.target.scaleY || 1)) / 2 * 100);
          if (scaleSlider) scaleSlider.value = scalePct;
          if (scaleInput)  scaleInput.value  = scalePct;
          if (rotateInput) rotateInput.value = Math.round(e.target.angle || 0);
          updating = false;
        }
      });
    }

    /* ---- Centreren op canvas ---- */
    var btnCenterH    = document.getElementById('btn-center-h');
    var btnCenterV    = document.getElementById('btn-center-v');
    var btnCenterBoth = document.getElementById('btn-center-both');

    if (btnCenterH) {
      btnCenterH.addEventListener('click', function () {
        KaartCanvas.centerActiveObject('h');
        announceStatus('Element horizontaal gecentreerd');
      });
    }
    if (btnCenterV) {
      btnCenterV.addEventListener('click', function () {
        KaartCanvas.centerActiveObject('v');
        announceStatus('Element verticaal gecentreerd');
      });
    }
    if (btnCenterBoth) {
      btnCenterBoth.addEventListener('click', function () {
        KaartCanvas.centerActiveObject('both');
        announceStatus('Element gecentreerd op canvas');
      });
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;
    panel = document.getElementById('properties-panel');

    /* De tekstsecties zijn standaard verborgen via het id="text-props" wrapper.
       We groeperen ze dynamisch door de bestaande .properties-grid een id te geven
       zodat we die als eenheid kunnen tonen/verbergen.
       In editor.html heeft de eerste .properties-grid al id="text-props". */

    bindEvents();
  }

  return {
    init: init,
    show: show,
    hide: hide
  };

})();
