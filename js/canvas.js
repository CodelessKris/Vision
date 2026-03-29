/* =============================================================================
   canvas.js — Fabric.js canvas wrapper
   Kaarteditor | Sprint 1
   ============================================================================= */

var KaartCanvas = (function () {
  'use strict';

  var fabricCanvas        = null;
  var currentSide         = 'front';
  var switchSeq           = 0;   /* sequence counter: prevents stale loadFromJSON callbacks */
  var selectionCallback   = null;
  var deselectionCallback = null;
  var resizeHandler       = null;

  var cardState = {
    front:  { background: '#fff9f0', json: null }, /* warme off-white past bij wenskaart */
    inside: { background: '#ffffff', json: null }
  };

  var A5_RATIO = 148 / 210;

  /* debounce is globaal beschikbaar via utils.js */

  function calculateCanvasDimensions() {
    var container = document.getElementById('canvas-container');
    if (!container) return { width: 400, height: 566 };

    var availableWidth  = container.clientWidth - 32;
    var availableHeight = Math.floor(window.innerHeight * 0.55);

    var heightFromWidth = Math.floor(availableWidth / A5_RATIO);
    var widthFromHeight = Math.floor(availableHeight * A5_RATIO);

    var canvasWidth, canvasHeight;
    if (heightFromWidth <= availableHeight) {
      canvasWidth  = availableWidth;
      canvasHeight = heightFromWidth;
    } else {
      canvasWidth  = widthFromHeight;
      canvasHeight = availableHeight;
    }

    return {
      width:  Math.max(canvasWidth,  240),
      height: Math.max(canvasHeight, 340)
    };
  }

  function applyGlobalObjectDefaults() {
    fabric.Object.prototype.set({
      borderColor:        '#fbbf24',
      cornerColor:        '#fbbf24',
      cornerStrokeColor:  '#1a1a2e', /* donkere rand voor definitie op witte kaart */
      cornerSize:         14,
      transparentCorners: false,
      borderScaleFactor:  3,
      padding:            8
    });
  }

  function init() {
    if (fabricCanvas) return;

    applyGlobalObjectDefaults();

    var dims = calculateCanvasDimensions();

    fabricCanvas = new fabric.Canvas('fabric-canvas', {
      width:                  dims.width,
      height:                 dims.height,
      backgroundColor:        cardState.front.background,
      selection:              true,
      preserveObjectStacking: true,
      enableRetinaScaling:    true
    });

    updateCanvasWrapper(dims.width, dims.height);

    fabricCanvas.on('selection:created', function (e) {
      if (selectionCallback) selectionCallback(e.selected[0] || fabricCanvas.getActiveObject());
    });
    fabricCanvas.on('selection:updated', function (e) {
      if (selectionCallback) selectionCallback(e.selected[0] || fabricCanvas.getActiveObject());
    });
    fabricCanvas.on('selection:cleared', function () {
      if (deselectionCallback) deselectionCallback();
    });

    resizeHandler = debounce(resizeCanvas, 250);
    window.addEventListener('resize', resizeHandler);
  }

  function updateCanvasWrapper(width, height) {
    var wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) {
      wrapper.style.width  = width  + 'px';
      wrapper.style.height = height + 'px';
    }
  }

  /* rescaleJson — schaalt opgeslagen JSON van de inactieve zijde mee bij resize.
     Zonder dit zouden objecten op de andere zijde op de verkeerde positie staan
     nadat het venster is vergroot of verkleind terwijl die zijde niet zichtbaar was. */
  function rescaleJson(json, scaleX, scaleY) {
    if (!json || !json.objects) return json;
    var scaled = JSON.parse(JSON.stringify(json)); /* deep clone */
    scaled.objects.forEach(function (obj) {
      obj.left   = (obj.left   || 0) * scaleX;
      obj.top    = (obj.top    || 0) * scaleY;
      obj.scaleX = (obj.scaleX || 1) * scaleX;
      obj.scaleY = (obj.scaleY || 1) * scaleY;
    });
    return scaled;
  }

  function resizeCanvas() {
    if (!fabricCanvas) return;

    var dims      = calculateCanvasDimensions();
    var oldWidth  = fabricCanvas.width;
    var oldHeight = fabricCanvas.height;

    if (oldWidth === dims.width && oldHeight === dims.height) return;

    var scaleX = dims.width  / oldWidth;
    var scaleY = dims.height / oldHeight;

    /* Rescale objecten op de actieve zijde */
    fabricCanvas.getObjects().forEach(function (obj) {
      obj.set({
        left:   obj.left   * scaleX,
        top:    obj.top    * scaleY,
        scaleX: obj.scaleX * scaleX,
        scaleY: obj.scaleY * scaleY
      });
      obj.setCoords();
    });

    /* Rescale ook de JSON van de inactieve zijde */
    var otherSide = currentSide === 'front' ? 'inside' : 'front';
    if (cardState[otherSide].json) {
      cardState[otherSide].json = rescaleJson(cardState[otherSide].json, scaleX, scaleY);
    }

    fabricCanvas.setDimensions({ width: dims.width, height: dims.height });
    updateCanvasWrapper(dims.width, dims.height);
    fabricCanvas.renderAll();
  }

  function switchSide(newSide) {
    if (!fabricCanvas || newSide === currentSide) return;

    /* Snapshot huidige zijde */
    cardState[currentSide].json       = fabricCanvas.toJSON();
    cardState[currentSide].background = fabricCanvas.backgroundColor;

    currentSide = newSide;

    /* Sequence counter voorkomt dat een trage loadFromJSON van een eerdere wissel
       de callbacks van een latere wissel overschrijft. */
    var seq = ++switchSeq;

    if (cardState[newSide].json) {
      fabricCanvas.loadFromJSON(cardState[newSide].json, function () {
        if (seq !== switchSeq) return; /* stale — een nieuwere wissel is al begonnen */
        fabricCanvas.backgroundColor = cardState[newSide].background;
        fabricCanvas.renderAll();
        if (deselectionCallback) deselectionCallback();
      });
    } else {
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = cardState[newSide].background;
      fabricCanvas.renderAll();
      if (deselectionCallback) deselectionCallback();
    }
  }

  function addText(options) {
    if (!fabricCanvas) return null;

    var defaults = {
      left:       fabricCanvas.width  / 2,
      top:        fabricCanvas.height / 2,
      originX:    'center',
      originY:    'center',
      width:      Math.floor(fabricCanvas.width * 0.6),
      fontSize:   36,
      fontFamily: 'Atkinson Hyperlegible',
      fill:       '#333333',
      textAlign:  'center',
      editable:   true
    };

    var textbox = new fabric.Textbox('Typ hier...', Object.assign({}, defaults, options || {}));
    fabricCanvas.add(textbox);
    fabricCanvas.setActiveObject(textbox);
    fabricCanvas.renderAll();

    return textbox;
  }

  function removeActiveObject() {
    if (!fabricCanvas) return;
    var obj = fabricCanvas.getActiveObject();
    if (!obj) return;
    fabricCanvas.remove(obj);
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    if (deselectionCallback) deselectionCallback();
  }

  function moveActiveObject(dx, dy) {
    if (!fabricCanvas) return;
    var obj = fabricCanvas.getActiveObject();
    if (!obj) return;
    obj.set({ left: obj.left + dx, top: obj.top + dy });
    obj.setCoords();
    fabricCanvas.renderAll();
  }

  /* getState / loadState — publieke API voor Sprint 3 (.kaart bestandsformaat).
     getState maakt altijd eerst een snapshot van de actieve zijde. */
  function getState() {
    if (fabricCanvas) {
      cardState[currentSide].json       = fabricCanvas.toJSON();
      cardState[currentSide].background = fabricCanvas.backgroundColor;
    }
    return {
      currentSide: currentSide,
      front:       cardState.front,
      inside:      cardState.inside
    };
  }

  function loadState(state) {
    if (!state || !fabricCanvas) return;
    if (state.front)  cardState.front  = state.front;
    if (state.inside) cardState.inside = state.inside;

    var side = state.currentSide || 'front';
    currentSide = side;

    if (cardState[currentSide].json) {
      fabricCanvas.loadFromJSON(cardState[currentSide].json, function () {
        fabricCanvas.backgroundColor = cardState[currentSide].background;
        fabricCanvas.renderAll();
        if (deselectionCallback) deselectionCallback();
      });
    } else {
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = cardState[currentSide].background;
      fabricCanvas.renderAll();
    }
  }

  return {
    init:               init,
    addText:            addText,
    switchSide:         switchSide,
    getCurrentSide:     function () { return currentSide; },
    getActiveObject:    function () { return fabricCanvas ? fabricCanvas.getActiveObject() : null; },
    removeActiveObject: removeActiveObject,
    moveActiveObject:   moveActiveObject,
    getCanvas:          function () { return fabricCanvas; },
    getState:           getState,
    loadState:          loadState,
    onSelectionChange:  function (cb) { selectionCallback    = cb; },
    onSelectionCleared: function (cb) { deselectionCallback  = cb; }
  };

})();
