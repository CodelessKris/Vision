/* =============================================================================
   imageupload.js — Eigen afbeeldingen uploaden: tab-panel, drag-and-drop, resize
   Kaarteditor | Sprint 6

   Integreert als derde tab in de clipart-modal. Accepteert JPG, PNG, GIF, WebP
   en SVG. Grote afbeeldingen worden client-side verkleind naar max 2000px.
   ============================================================================= */

var KaartImageUpload = (function () {
  'use strict';

  var MAX_FILE_SIZE  = 10 * 1024 * 1024; // 10 MB
  var MAX_DIMENSION  = 2000;              // px (langste zijde)
  var ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  var ACCEPTED_EXTS  = '.jpg,.jpeg,.png,.gif,.webp,.svg';

  var panel      = null; // tabpanel element
  var fileInput  = null; // verborgen <input type="file">
  var dropZone   = null; // drop-area binnen de tab

  /* --- Panel bouwen (aangeroepen vanuit init) ------------------------------ */

  function buildPanel() {
    panel = document.createElement('div');
    panel.setAttribute('role', 'tabpanel');
    panel.id = 'clipart-panel-upload';
    panel.setAttribute('aria-labelledby', 'clipart-tab-upload');
    panel.hidden = true;

    panel.innerHTML =
      '<div class="upload-panel-content">' +
        '<div class="upload-drop-zone" id="upload-drop-zone">' +
          '<p class="upload-drop-text">Sleep een afbeelding hierheen</p>' +
          '<p class="upload-drop-or">of</p>' +
          '<button type="button" class="btn btn-primary" id="upload-browse-btn" ' +
                  'aria-label="Kies een afbeelding van je computer">' +
            'Kies bestand' +
          '</button>' +
          '<p class="upload-drop-formats">JPG, PNG, GIF, WebP of SVG (max 10 MB)</p>' +
        '</div>' +
      '</div>';

    /* Verborgen file input */
    fileInput = document.createElement('input');
    fileInput.type   = 'file';
    fileInput.accept = ACCEPTED_EXTS;
    fileInput.setAttribute('aria-hidden', 'true');
    fileInput.tabIndex = -1;
    fileInput.style.position = 'absolute';
    fileInput.style.width    = '0';
    fileInput.style.height   = '0';
    fileInput.style.overflow = 'hidden';
    panel.appendChild(fileInput);

    /* Events */
    var browseBtn = panel.querySelector('#upload-browse-btn');
    browseBtn.addEventListener('click', function () {
      fileInput.click();
    });

    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) {
        processFile(fileInput.files[0]);
        fileInput.value = ''; // reset zodat hetzelfde bestand opnieuw kan
      }
    });

    /* Drag-and-drop op drop zone */
    dropZone = panel.querySelector('#upload-drop-zone');

    dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    });
  }

  /* --- Bestand verwerken --------------------------------------------------- */

  function processFile(file) {
    /* Valideer type */
    if (ACCEPTED_TYPES.indexOf(file.type) === -1) {
      announceStatus('Ongeldig bestandstype. Gebruik JPG, PNG, GIF, WebP of SVG.');
      return;
    }

    /* Valideer grootte */
    if (file.size > MAX_FILE_SIZE) {
      announceStatus('Bestand is te groot (max 10 MB).');
      return;
    }

    /* SVG apart afhandelen: lees als tekst, gebruik addImage */
    if (file.type === 'image/svg+xml') {
      var textReader = new FileReader();
      textReader.onload = function () {
        var svgString = textReader.result;
        var label = cleanFilename(file.name);
        KaartCanvas.addImage(svgString, function () {
          announceStatus('Afbeelding \u201c' + label + '\u201d toegevoegd');
          KaartClipart.close();
        }, { kaartLabel: label });
      };
      textReader.readAsText(file);
      return;
    }

    /* Rasterafbeeldingen: lees als dataURL, optioneel resize */
    var reader = new FileReader();
    reader.onload = function () {
      var dataURL = reader.result;
      var label   = cleanFilename(file.name);

      resizeIfNeeded(dataURL, function (resizedDataURL) {
        KaartCanvas.addRasterImage(resizedDataURL, function () {
          announceStatus('Afbeelding \u201c' + label + '\u201d toegevoegd');
          KaartClipart.close();
        }, { kaartLabel: label });
      });
    };
    reader.readAsDataURL(file);
  }

  /* --- Resize grote afbeeldingen ------------------------------------------- */

  function resizeIfNeeded(dataURL, callback) {
    var img = new Image();
    img.onload = function () {
      var w = img.naturalWidth;
      var h = img.naturalHeight;

      /* Niet resizen als binnen limiet */
      if (w <= MAX_DIMENSION && h <= MAX_DIMENSION) {
        callback(dataURL);
        return;
      }

      /* Bereken nieuwe dimensies */
      var ratio = w / h;
      var newW, newH;
      if (w >= h) {
        newW = MAX_DIMENSION;
        newH = Math.round(MAX_DIMENSION / ratio);
      } else {
        newH = MAX_DIMENSION;
        newW = Math.round(MAX_DIMENSION * ratio);
      }

      /* Offscreen canvas voor resize */
      var canvas = document.createElement('canvas');
      canvas.width  = newW;
      canvas.height = newH;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newW, newH);

      /* Bewaar als JPEG voor foto's (kleiner), PNG als transparantie mogelijk */
      var hasAlpha = dataURL.indexOf('data:image/png') === 0 ||
                     dataURL.indexOf('data:image/gif') === 0 ||
                     dataURL.indexOf('data:image/webp') === 0;
      var output;
      if (hasAlpha) {
        output = canvas.toDataURL('image/png');
      } else {
        output = canvas.toDataURL('image/jpeg', 0.85);
      }
      callback(output);
    };
    img.onerror = function () {
      /* Fallback: gebruik origineel als resize faalt */
      callback(dataURL);
    };
    img.src = dataURL;
  }

  /* --- Canvas drag-and-drop ------------------------------------------------ */

  var canvasDropIndicator = null;

  function initCanvasDropZone() {
    var container = document.getElementById('canvas-container');
    if (!container) return;

    /* Indicator overlay aanmaken */
    canvasDropIndicator = document.createElement('div');
    canvasDropIndicator.className = 'canvas-drop-indicator';
    canvasDropIndicator.hidden = true;
    canvasDropIndicator.innerHTML = '<span>Sleep afbeelding hier</span>';
    container.style.position = 'relative';
    container.appendChild(canvasDropIndicator);

    var dragCounter = 0; // track geneste drag events

    container.addEventListener('dragenter', function (e) {
      e.preventDefault();
      dragCounter++;
      if (hasImageFile(e)) {
        canvasDropIndicator.hidden = false;
      }
    });

    container.addEventListener('dragover', function (e) {
      e.preventDefault();
    });

    container.addEventListener('dragleave', function (e) {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        canvasDropIndicator.hidden = true;
      }
    });

    container.addEventListener('drop', function (e) {
      e.preventDefault();
      dragCounter = 0;
      canvasDropIndicator.hidden = true;

      if (e.dataTransfer && e.dataTransfer.files) {
        var file = findImageFile(e.dataTransfer.files);
        if (file) {
          processFile(file);
        }
      }
    });
  }

  function hasImageFile(e) {
    if (!e.dataTransfer || !e.dataTransfer.types) return false;
    return e.dataTransfer.types.indexOf('Files') !== -1;
  }

  function findImageFile(files) {
    for (var i = 0; i < files.length; i++) {
      if (ACCEPTED_TYPES.indexOf(files[i].type) !== -1) {
        return files[i];
      }
    }
    return null;
  }

  /* --- Hulpfuncties -------------------------------------------------------- */

  function cleanFilename(name) {
    /* Verwijder extensie en vervang underscores/dashes door spaties */
    return name.replace(/\.[^.]+$/, '')
               .replace(/[_-]/g, ' ')
               .substring(0, 40);
  }

  /* --- Tab activate/deactivate (aangeroepen door clipart.js) --------------- */

  function activate() {
    /* Niets bijzonders nodig bij activatie */
  }

  function deactivate() {
    /* Niets bijzonders nodig bij deactivatie */
  }

  /* --- Init ---------------------------------------------------------------- */

  function init() {
    buildPanel();
  }

  return {
    init:                init,
    getPanel:            function () { return panel; },
    activate:            activate,
    deactivate:          deactivate,
    processFile:         processFile,
    initCanvasDropZone:  initCanvasDropZone
  };

})();
