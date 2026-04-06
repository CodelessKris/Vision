/* =============================================================================
   textpath.js — Tekst op pad: voorgedefinieerde padvormen en type-conversie
   Kaarteditor | Sprint 6

   Gebruikt native Fabric.js 5.x text-on-path support via de `path` property.
   Textbox ↔ Text conversie bij toepassen/verwijderen van een pad.
   ============================================================================= */

var KaartTextPath = (function () {
  'use strict';

  /* --- Padvormen: genereren SVG path strings op basis van breedte + radius -- */

  /* Boog omhoog: tekst volgt een opwaartse curve */
  function arcPath(radius, width) {
    return 'M 0 ' + radius + ' Q ' + (width / 2) + ' ' + (-radius) + ' ' + width + ' ' + radius;
  }

  /* Omgekeerde boog: tekst volgt een neerwaartse curve */
  function invertedArcPath(radius, width) {
    return 'M 0 0 Q ' + (width / 2) + ' ' + (radius * 2) + ' ' + width + ' 0';
  }

  /* Golf: S-vormige curve */
  function wavePath(radius, width) {
    return 'M 0 ' + radius +
      ' C ' + (width / 4) + ' ' + (-radius) +
      ' ' + (width * 3 / 4) + ' ' + (radius * 3) +
      ' ' + width + ' ' + radius;
  }

  /* Cirkel: volledige cirkel */
  function circlePath(radius) {
    var cx = radius;
    var cy = radius;
    return 'M ' + cx + ' ' + (cy - radius) +
      ' A ' + radius + ' ' + radius + ' 0 1 1 ' + cx + ' ' + (cy + radius) +
      ' A ' + radius + ' ' + radius + ' 0 1 1 ' + cx + ' ' + (cy - radius);
  }

  var PATH_GENERATORS = {
    arc:         arcPath,
    invertedArc: invertedArcPath,
    wave:        wavePath,
    circle:      circlePath
  };

  /* --- Pad genereren -------------------------------------------------------- */

  function generatePath(shapeType, radius, width) {
    var gen = PATH_GENERATORS[shapeType];
    if (!gen) return null;

    var pathStr;
    if (shapeType === 'circle') {
      pathStr = gen(radius);
    } else {
      pathStr = gen(radius, width || 300);
    }

    return new fabric.Path(pathStr, {
      visible: false,
      selectable: false,
      evented: false
    });
  }

  /* --- Properties kopiëren tussen Text/Textbox ------------------------------ */

  var COPY_PROPS = [
    'text', 'fontFamily', 'fontSize', 'fill', 'textAlign',
    'fontWeight', 'fontStyle', 'underline', 'linethrough', 'overline',
    'charSpacing', 'lineHeight', 'stroke', 'strokeWidth',
    'shadow', 'textBackgroundColor',
    'left', 'top', 'originX', 'originY',
    'scaleX', 'scaleY', 'angle', 'opacity',
    'kaartLabel', 'kaartAssetId',
    '_baseStrokeWidth'
  ];

  function copyProperties(src) {
    var props = {};
    COPY_PROPS.forEach(function (p) {
      if (src[p] !== undefined) props[p] = src[p];
    });
    return props;
  }

  /* --- Pad toepassen: Textbox → Text met pad -------------------------------- */

  function applyPath(canvas, textbox, shapeType, radius) {
    if (!canvas || !textbox) return null;

    var props = copyProperties(textbox);
    var width = (textbox.width || 200) * (textbox.scaleX || 1);
    var path  = generatePath(shapeType, radius, width);
    if (!path) return null;

    props.path            = path;
    props.pathSide        = 'left';
    props.pathStartOffset = 0;

    /* Bewaar pad-metadata voor serialisatie */
    var textObj = new fabric.Text(props.text || '', props);
    textObj._kaartPathShape  = shapeType;
    textObj._kaartPathRadius = radius;

    /* Vervang op canvas */
    var idx = canvas.getObjects().indexOf(textbox);
    canvas.remove(textbox);
    canvas.add(textObj);
    if (idx >= 0) canvas.moveTo(textObj, idx);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    canvas.fire('object:modified', { target: textObj });

    return textObj;
  }

  /* --- Pad verwijderen: Text → Textbox -------------------------------------- */

  function removePath(canvas, textObj) {
    if (!canvas || !textObj) return null;

    var props = copyProperties(textObj);
    /* Pad-gerelateerde properties niet kopiëren */
    delete props.path;

    var textbox = new fabric.Textbox(props.text || '', props);
    textbox.set({ width: Math.max(textbox.width || 200, 100) });

    /* Vervang op canvas */
    var idx = canvas.getObjects().indexOf(textObj);
    canvas.remove(textObj);
    canvas.add(textbox);
    if (idx >= 0) canvas.moveTo(textbox, idx);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
    canvas.fire('object:modified', { target: textbox });

    return textbox;
  }

  /* --- Pad bijwerken (radius/offset/side wijziging) ------------------------- */

  function updatePath(textObj, shapeType, radius) {
    if (!textObj) return;

    var width = (textObj.width || 200) * (textObj.scaleX || 1);
    var path  = generatePath(shapeType, radius, width);
    if (!path) return;

    textObj.set({ path: path });
    textObj._kaartPathShape  = shapeType;
    textObj._kaartPathRadius = radius;
    textObj.setCoords();
  }

  /* --- Publieke API -------------------------------------------------------- */

  return {
    generatePath: generatePath,
    applyPath:    applyPath,
    removePath:   removePath,
    updatePath:   updatePath
  };

})();
