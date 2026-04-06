/* =============================================================================
   export.js — PDF-export en afdrukken
   Kaarteditor | Sprint 3

   Rendert beide kaartzijden naar afbeeldingen (hoge resolutie) en genereert:
   - Een A4-liggend PDF met voorkant links en binnenkant rechts (FR-22, FR-24)
   - Een print-layout voor de browser-printdialoog (FR-23)

   Publieke API (KaartExport.*):
     downloadPDF()   — genereer en download PDF
     print()         — toon printdialoog

   jsPDF 2.x exposeert: window.jspdf.jsPDF
   ============================================================================= */

var KaartExport = (function () {
  'use strict';

  /* --- Constanten --------------------------------------------------------- */

  /* A4 liggend in mm. */
  var A4_W_MM = 297;
  var A4_H_MM = 210;
  var HALF_W  = A4_W_MM / 2;   /* 148.5 mm per zijde */

  /* Doelbreedte per A5-helft in pixels voor ≥150 DPI.
     (148.5 / 25.4) * 150 ≈ 877 px */
  var TARGET_PX = 877;

  /* --- Canvas-rendering helper ------------------------------------------- */

  /* Laad een Fabric.js JSON in het canvas, stel achtergrond in en
     geef een data-URL terug via callback(url).
     Als json null is (lege zijde), render dan alleen de achtergrond. */
  function renderSideToDataURL(json, background, multiplier, callback) {
    var canvas = KaartCanvas.getCanvas();
    if (!canvas) { callback(''); return; }

    var bg = background || '#ffffff';

    if (!json) {
      canvas.clear();
      canvas.backgroundColor = bg;
      canvas.renderAll();
      callback(canvas.toDataURL({ format: 'png', multiplier: multiplier }));
      return;
    }

    canvas.loadFromJSON(json, function () {
      /* loadFromJSON kan backgroundColor resetten — altijd herstellen. */
      canvas.backgroundColor = bg;
      canvas.renderAll();
      callback(canvas.toDataURL({ format: 'png', multiplier: multiplier }));
    });
  }

  /* Rendert beide kaartzijden en roept callback(frontUrl, insideUrl) aan.
     Bewaart de oorspronkelijke staat en herstelt die daarna. */
  function renderBothSides(callback) {
    var canvas = KaartCanvas.getCanvas();
    if (!canvas) { callback('', ''); return; }

    var multiplier = TARGET_PX / canvas.width;

    var state = KaartCanvas.getState(); /* snapshots actieve zijde intern */

    var frontJson   = state.front  && state.front.json;
    var frontBg     = state.front  && state.front.background  || '#fff9f0';
    var insideJson  = state.inside && state.inside.json;
    var insideBg    = state.inside && state.inside.background || '#ffffff';
    var origSide    = state.currentSide || 'front';

    /* Bewaar dirty-staat — loadFromJSON vuurt object:added-events die anders
       markDirty() triggeren, ook al heeft de gebruiker niets gewijzigd. */
    var wasDirty = KaartStorage.getDirty();

    KaartUndo.pause();

    renderSideToDataURL(frontJson, frontBg, multiplier, function (frontUrl) {
      renderSideToDataURL(insideJson, insideBg, multiplier, function (insideUrl) {
        /* Herstel de oorspronkelijke zijde. */
        renderSideToDataURL(
          origSide === 'front' ? frontJson : insideJson,
          origSide === 'front' ? frontBg   : insideBg,
          1,                                    /* multiplier 1 = schermresolutie */
          function () {
            KaartUndo.resume();
            KaartStorage.setDirty(wasDirty);   /* herstel dirty-staat na rendering */
            callback(frontUrl, insideUrl);
          }
        );
      });
    });
  }

  /* --- PDF-export --------------------------------------------------------- */

  function downloadPDF() {
    if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
      announceStatus('PDF-bibliotheek niet geladen — herlaad de pagina.');
      return;
    }

    announceStatus('PDF wordt gegenereerd\u2026');

    var cardTitle = (document.getElementById('card-title') || {}).textContent
                  || 'Kaart';

    renderBothSides(function (frontUrl, insideUrl) {
      try {
        var doc = new jspdf.jsPDF({
          orientation: 'landscape',
          unit:        'mm',
          format:      'a4'
        });

        if (frontUrl)  doc.addImage(frontUrl,  'PNG', 0,      0, HALF_W, A4_H_MM);
        if (insideUrl) doc.addImage(insideUrl, 'PNG', HALF_W, 0, HALF_W, A4_H_MM);

        /* doc.save() geeft in Chrome soms een UUID-bestandsnaam zonder extensie.
           Gebruik een blob + <a download> voor betrouwbare bestandsnaam. */
        var blob = doc.output('blob');
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href     = url;
        a.download = cardTitle + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
        announceStatus('PDF gedownload: ' + cardTitle + '.pdf');
      } catch (e) {
        announceStatus('Fout bij het genereren van de PDF.');
      }
    });
  }

  /* --- Afdrukken ---------------------------------------------------------- */

  function print() {
    announceStatus('Afdrukken wordt voorbereid\u2026');

    renderBothSides(function (frontUrl, insideUrl) {
      var container = document.getElementById('print-container');
      if (!container) { window.print(); return; }

      container.innerHTML = '';

      var page = document.createElement('div');
      page.className = 'print-page';

      function makeImg(src, label) {
        var img = document.createElement('img');
        img.src       = src;
        img.alt       = label;
        img.className = 'print-side';
        return img;
      }

      var printImages = [];

      function addPrintImg(src, label) {
        var img = makeImg(src, label);
        page.appendChild(img);
        printImages.push(img);
      }

      if (frontUrl)  addPrintImg(frontUrl,  'Voorkant');
      if (insideUrl) addPrintImg(insideUrl, 'Binnenkant');

      container.appendChild(page);

      /* Wacht tot alle afbeeldingen volledig zijn gedecodeerd voordat de
         printdialoog wordt geopend — één rAF is onvoldoende op trage hardware. */
      var remaining = printImages.length || 1;
      function onImageReady() {
        remaining--;
        if (remaining > 0) return;
        announceStatus('Afdrukdialoog geopend.');
        window.print();

        /* Ruim de container op na het afdrukken. */
        var cleaned = false;
        function cleanup() {
          if (cleaned) return;
          cleaned = true;
          container.innerHTML = '';
        }

        /* Keten bestaande onafterprint-handler; setTimeout als aanvullende zekerheid. */
        var prev = window.onafterprint;
        window.onafterprint = function () {
          cleanup();
          if (typeof prev === 'function') prev();
          window.onafterprint = prev;
        };
        setTimeout(cleanup, 3000);
      }

      if (printImages.length === 0) {
        onImageReady();
      } else {
        printImages.forEach(function (img) {
          if (img.complete) {
            onImageReady();
          } else {
            img.onload  = onImageReady;
            img.onerror = onImageReady; /* print toch bij laadfouten */
          }
        });
      }
    });
  }

  /* --- Publieke API ------------------------------------------------------- */

  return {
    downloadPDF: downloadPDF,
    print:       print
  };

})();
