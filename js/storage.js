/* =============================================================================
   storage.js — Opslaan, laden en recente bestanden
   Kaarteditor | Sprint 3

   Biedt opslaan als .kaart (JSON) via de File System Access API (Chrome/Edge)
   of als download-fallback (Firefox/Safari). Houdt de 5 meest recente bestanden
   bij in localStorage en toont ze op het startscherm.

   Publieke API (KaartStorage.*):
     init()                    — dirty-tracking + beforeunload registreren (editor)
     save()                    — huidige kaart opslaan
     open()                    — bestand openen via picker (editor)
     openFromFile(file)        — bestand openen vanuit een File-object (drag-drop, editor)
     checkPendingOpen()        — controleer sessionStorage op te laden kaart (editor init)
     loadRecent()              — recente kaarten tonen op startscherm (index.html)
     openFromStartScreen()     — bestand kiezen op startscherm → sessionStorage → navigate
     openFromStartScreenFile(f)— drag-drop op startscherm → sessionStorage → navigate
   ============================================================================= */

var KaartStorage = (function () {
  'use strict';

  /* --- Module-staat -------------------------------------------------------- */

  var currentFileHandle = null;   /* FileSystemFileHandle (Chrome/Edge), of null */
  var isDirty           = false;  /* niet-opgeslagen wijzigingen?                */
  var createdAt         = null;   /* ISO 8601 aanmaakdatum van de huidige kaart  */

  var RECENT_KEY = 'kaarteditor-recent';
  var MAX_RECENT = 5;
  var VERSION    = '1.0';

  var hasFileSystemAccess = (typeof window !== 'undefined' && 'showSaveFilePicker' in window);

  /* --- Hulpfuncties -------------------------------------------------------- */

  function extractTitle(canvasJson) {
    /* Zoek het eerste tekst-object in een Fabric.js canvas-JSON. */
    if (!canvasJson || !canvasJson.objects) return null;
    for (var i = 0; i < canvasJson.objects.length; i++) {
      var obj = canvasJson.objects[i];
      if ((obj.type === 'textbox' || obj.type === 'i-text') && obj.text) {
        return obj.text.replace(/\s+/g, ' ').trim().slice(0, 60);
      }
    }
    return null;
  }

  function buildTitle(state) {
    return extractTitle(state.front && state.front.json)
        || extractTitle(state.inside && state.inside.json)
        || 'Naamloze kaart';
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function buildKaartData() {
    var state   = KaartCanvas.getState(); /* snapshots actieve zijde intern */
    var title   = buildTitle(state);

    if (!createdAt) createdAt = nowISO();

    return {
      version:        VERSION,
      appName:        'Kaarteditor',
      format:         'A5-dubbel',
      title:          title,
      created:        createdAt,
      modified:       nowISO(),
      front: {
        background: state.front  ? state.front.background  : '#fff9f0',
        canvas:     state.front  ? state.front.json        : null
      },
      inside: {
        background: state.inside ? state.inside.background : '#ffffff',
        canvas:     state.inside ? state.inside.json       : null
      },
      embeddedAssets: {}
    };
  }

  function generateThumbnail() {
    var canvas = KaartCanvas.getCanvas();
    if (!canvas) return '';
    try {
      return canvas.toDataURL({ format: 'png', multiplier: 0.15 });
    } catch (e) {
      return '';
    }
  }

  /* --- Recente bestanden (localStorage) ----------------------------------- */

  function getRecent() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function addToRecent(data, thumbnail) {
    var recent = getRecent();

    /* Verwijder bestaand item en bewaar z'n thumbnail als de nieuwe leeg is. */
    var existing = null;
    recent = recent.filter(function (r) {
      if (r.created === data.created) { existing = r; return false; }
      return true;
    });

    recent.unshift({
      title:     data.title,
      created:   data.created,
      modified:  data.modified,
      thumbnail: thumbnail || (existing && existing.thumbnail) || '',
      kaartData: JSON.stringify(data)
    });

    if (recent.length > MAX_RECENT) recent = recent.slice(0, MAX_RECENT);

    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    } catch (e) {
      /* Quota overschreden: verwijder oudste item en probeer opnieuw. */
      if (recent.length > 1) {
        recent = recent.slice(0, recent.length - 1);
        try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)); } catch (e2) { /* skip */ }
      }
    }
  }

  /* --- Opslaan ------------------------------------------------------------ */

  function onSaveSuccess(data, thumbnail) {
    isDirty = false;
    addToRecent(data, thumbnail);

    /* Titel in de editor-header bijwerken. */
    var h1 = document.getElementById('card-title');
    if (h1) h1.textContent = data.title;

    announceStatus('Kaart opgeslagen: ' + data.title);
  }

  function onSaveError(err) {
    /* AbortError = gebruiker heeft de picker geannuleerd — geen foutmelding. */
    if (err && err.name === 'AbortError') {
      announceStatus('Opslaan geannuleerd.');
    } else {
      announceStatus('Fout bij opslaan.');
    }
  }

  function writeToHandle(handle, blob) {
    return handle.createWritable().then(function (writable) {
      return writable.write(blob).then(function () { return writable.close(); });
    });
  }

  function downloadFallback(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }

  function save() {
    var data      = buildKaartData();
    var jsonStr   = JSON.stringify(data, null, 2);
    var blob      = new Blob([jsonStr], { type: 'application/json' });
    var filename  = data.title + '.kaart';
    var thumbnail = generateThumbnail();

    if (hasFileSystemAccess && currentFileHandle) {
      /* Herschrijf hetzelfde bestand (geen picker nodig). */
      writeToHandle(currentFileHandle, blob)
        .then(function () { onSaveSuccess(data, thumbnail); })
        .catch(onSaveError);

    } else if (hasFileSystemAccess) {
      /* Toon de "Opslaan als"-picker. */
      window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Kaart bestand',
          accept: { 'application/json': ['.kaart'] }
        }]
      }).then(function (handle) {
        currentFileHandle = handle;
        return writeToHandle(handle, blob);
      }).then(function () {
        onSaveSuccess(data, thumbnail);
      }).catch(onSaveError);

    } else {
      /* Firefox/Safari-fallback: download als bestand. */
      downloadFallback(blob, filename);
      onSaveSuccess(data, thumbnail);
    }
  }

  /* --- Laden -------------------------------------------------------------- */

  function validate(data) {
    return data
        && data.version
        && data.appName === 'Kaarteditor'
        && data.front
        && data.inside;
  }

  function applyKaartData(data) {
    if (!validate(data)) {
      announceStatus('Ongeldig kaartbestand — kan niet worden geopend.');
      return;
    }

    var state = {
      currentSide: 'front',
      front: {
        background: data.front.background  || '#fff9f0',
        json:       data.front.canvas      || null
      },
      inside: {
        background: data.inside.background || '#ffffff',
        json:       data.inside.canvas     || null
      }
    };

    /* Pauzeer elementenlijst tijdens laden — loadFromJSON vuurt anders object:added
       events die de lijst verdubbelen. rebuild() na de callback herstelt de juiste staat. */
    if (typeof KaartA11y !== 'undefined') KaartA11y.pause();

    KaartCanvas.loadState(state, function () {
      /* Alles wat van de geladen canvas-staat afhangt moet BINNEN de callback
         staan — loadFromJSON is async; buiten de callback is de canvas nog leeg. */
      KaartUndo.reset();
      /* Herbouw elementenlijst — alleen op de editor-pagina (a11y.js geladen) */
      if (typeof KaartA11y !== 'undefined') { KaartA11y.resume(); KaartA11y.rebuild(); }

      createdAt = data.created || nowISO();
      isDirty   = false;

      var h1 = document.getElementById('card-title');
      if (h1) h1.textContent = data.title || 'Kaart';

      /* Zorg dat het Voorkant-tabblad actief is in de UI. */
      var tabFront = document.getElementById('tab-front');
      if (tabFront && typeof activateTabExternal === 'function') {
        activateTabExternal('front');
      }

      announceStatus('Kaart geopend: ' + (data.title || 'Kaart'));
      addToRecent(data, '');
    });
  }

  function readFileAsText(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) { callback(null, e.target.result); };
    reader.onerror = function ()  { callback(new Error('Leesfout')); };
    reader.readAsText(file);
  }

  function parseAndApply(text) {
    var data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      announceStatus('Ongeldig bestandsformaat — geen geldige JSON.');
      return;
    }
    applyKaartData(data);
  }

  /* --- Gedeelde bestandspicker-helpers ------------------------------------ */

  var PICKER_OPTS = {
    types: [{ description: 'Kaart bestand', accept: { 'application/json': ['.kaart'] } }],
    multiple: false
  };

  /* Open een .kaart bestand via de picker en lever de tekst op aan onText.
     onHandle(handle) wordt optioneel aangeroepen voor FSA-handle-opslag. */
  function pickKaartFile(onText, onHandle) {
    if (hasFileSystemAccess) {
      window.showOpenFilePicker(PICKER_OPTS)
        .then(function (handles) {
          var handle = handles[0];
          if (onHandle) onHandle(handle);
          return handle.getFile();
        })
        .then(function (file) {
          readFileAsText(file, function (err, text) {
            if (err) { announceStatus('Fout bij het lezen van het bestand.'); return; }
            onText(text);
          });
        })
        .catch(function (err) {
          if (err && err.name !== 'AbortError') {
            announceStatus('Fout bij het openen van het bestand.');
          }
        });
    } else {
      var input = document.createElement('input');
      input.type   = 'file';
      input.accept = '.kaart,application/json';
      input.addEventListener('change', function () {
        if (!input.files || !input.files[0]) return;
        readFileAsText(input.files[0], function (err, text) {
          if (err) { announceStatus('Fout bij het lezen van het bestand.'); return; }
          onText(text);
        });
      });
      input.click();
    }
  }

  /* Lees een gedropte/aangeleverde File en lever de tekst op aan onText. */
  function readKaartFile(file, onText) {
    if (!file || !file.name.endsWith('.kaart')) {
      announceStatus('Alleen .kaart bestanden worden ondersteund.');
      return;
    }
    readFileAsText(file, function (err, text) {
      if (err) { announceStatus('Fout bij het lezen van het bestand.'); return; }
      onText(text);
    });
  }

  function open() {
    pickKaartFile(parseAndApply, function (handle) { currentFileHandle = handle; });
  }

  function openFromFile(file) { readKaartFile(file, parseAndApply); }

  /* --- Sessie-brug: startscherm → editor ---------------------------------- */

  var PENDING_KEY = 'kaarteditor-pending-open';

  function storeAndNavigate(kaartDataStr) {
    try {
      sessionStorage.setItem(PENDING_KEY, kaartDataStr);
    } catch (e) {
      announceStatus('Bestand te groot om te openen.');
      return;
    }
    window.location.href = 'editor.html';
  }

  /* Valideer JSON-structuur volledig vóór navigatie zodat fouten op het
     startscherm worden gemeld in plaats van na de pagina-overgang. */
  function validateAndNavigate(text) {
    var parsed;
    try { parsed = JSON.parse(text); } catch (e) {
      announceStatus('Ongeldig bestandsformaat — geen geldige JSON.');
      return;
    }
    if (!validate(parsed)) {
      announceStatus('Ongeldig kaartbestand — kan niet worden geopend.');
      return;
    }
    storeAndNavigate(text);
  }

  function openFromStartScreen() { pickKaartFile(validateAndNavigate); }

  function openFromStartScreenFile(file) { readKaartFile(file, validateAndNavigate); }

  function checkPendingOpen() {
    var text;
    try {
      text = sessionStorage.getItem(PENDING_KEY);
      if (text) sessionStorage.removeItem(PENDING_KEY);
    } catch (e) {
      return;
    }
    if (!text) return;
    parseAndApply(text);
  }

  /* --- Recente kaarten op startscherm ------------------------------------- */

  function loadRecent() {
    var recent      = getRecent();
    var grid        = document.getElementById('recent-grid');
    var emptyMsg    = document.getElementById('recent-empty');
    if (!grid || !emptyMsg) return;

    if (recent.length === 0) {
      emptyMsg.removeAttribute('hidden');
      grid.setAttribute('hidden', '');
      return;
    }

    emptyMsg.setAttribute('hidden', '');
    grid.removeAttribute('hidden');
    grid.innerHTML = '';

    recent.forEach(function (entry, idx) {
      var btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'btn recent-card';
      btn.setAttribute('aria-label', 'Open kaart: ' + entry.title);

      var thumbDiv = document.createElement('div');
      thumbDiv.className = 'recent-card-thumb';

      if (entry.thumbnail) {
        var img    = document.createElement('img');
        img.src    = entry.thumbnail;
        img.alt    = '';
        img.width  = 120;
        img.height = 170;
        thumbDiv.appendChild(img);
      } else {
        /* Geen thumbnail: toon placeholder. */
        thumbDiv.setAttribute('aria-hidden', 'true');
        thumbDiv.innerHTML = '<span class="recent-card-placeholder">&#128196;</span>';
      }

      var name = document.createElement('span');
      name.className   = 'recent-card-name';
      name.textContent = entry.title;

      btn.appendChild(thumbDiv);
      btn.appendChild(name);

      btn.addEventListener('click', function () {
        storeAndNavigate(entry.kaartData);
      });

      grid.appendChild(btn);
    });
  }

  /* --- Dirty-tracking & init ---------------------------------------------- */

  function markDirty() {
    isDirty = true;
  }

  function init() {
    var canvas = KaartCanvas.getCanvas();
    if (canvas) {
      canvas.on('object:modified', markDirty);
      canvas.on('object:added',    markDirty);
      canvas.on('object:removed',  markDirty);
    }

    window.addEventListener('beforeunload', function (e) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  /* --- Publieke API ------------------------------------------------------- */

  return {
    init:                    init,
    save:                    save,
    open:                    open,
    openFromFile:            openFromFile,
    checkPendingOpen:        checkPendingOpen,
    loadRecent:              loadRecent,
    openFromStartScreen:     openFromStartScreen,
    openFromStartScreenFile: openFromStartScreenFile,
    /* Export-module gebruikt deze om dirty-staat te bewaren rondom rendering. */
    getDirty: function ()    { return isDirty; },
    setDirty: function (v)   { isDirty = v; }
  };

})();
