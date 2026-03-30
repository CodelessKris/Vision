/* =============================================================================
   imagesearch.js — Online zoek-UI (Pixabay tabpanel)
   Kaarteditor | Sprint 5 — Online Afbeelding Zoeken
   ============================================================================= */

var KaartImageSearch = (function () {
  'use strict';

  var panel          = null;   /* het tabpanel-element */
  var gridEl         = null;
  var searchInput    = null;
  var searchBtn      = null;
  var loadMoreBtn    = null;
  var countEl        = null;
  var confirmPanel   = null;
  var loadingEl      = null;
  var emptyEl        = null;
  var offlineBanner  = null;
  var apiKeyBanner   = null;

  var ONLINE_COLS       = 2;
  var focusedIndex      = 0;
  var prevFocusedCell   = null;
  var currentHits   = [];
  var currentPage   = 1;
  var currentTotal  = 0;
  var lastQuery     = '';
  var lastImageType = 'all';
  var lastLang      = 'nl';
  var selectedHit   = null;   /* hit die wacht op bevestiging */

  /* --- Panel bouwen -------------------------------------------------------- */

  function buildPanel() {
    panel = document.createElement('div');
    panel.id = 'clipart-panel-online';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', 'clipart-tab-online');
    panel.hidden = true;

    panel.innerHTML =
      /* Offline-banner */
      '<div class="online-offline-banner" id="online-offline-banner" role="alert" hidden>' +
        'Geen internetverbinding. Online zoeken is niet beschikbaar.' +
        '<button type="button" class="btn online-retry-btn" id="online-retry-btn">Probeer opnieuw</button>' +
      '</div>' +

      /* Geen API-key-banner */
      '<div class="online-apikey-banner" id="online-apikey-banner" hidden>' +
        '<p>Stel eerst een Pixabay API-sleutel in om online te kunnen zoeken.</p>' +
        '<button type="button" class="btn" id="online-open-settings">Instellingen openen</button>' +
      '</div>' +

      /* Zoekformulier */
      '<div class="online-search-form" id="online-search-form">' +
        '<div role="search" aria-label="Online afbeeldingen zoeken">' +
          '<div class="clipart-search-row">' +
            '<label for="online-search-input">Zoekterm</label>' +
            '<input type="search" id="online-search-input" placeholder="Zoek online afbeeldingen..." autocomplete="off">' +
            '<button type="button" class="btn" id="online-search-btn" aria-label="Zoeken" disabled>Zoeken</button>' +
          '</div>' +
          '<div class="online-filters" role="group" aria-label="Zoekfilters">' +
            '<div class="online-filter-group" role="group" aria-label="Type afbeelding">' +
              '<button type="button" class="btn btn-toggle" aria-pressed="false" data-image-type="illustration">Illustraties</button>' +
              '<button type="button" class="btn btn-toggle" aria-pressed="false" data-image-type="photo">Foto\'s</button>' +
              '<button type="button" class="btn btn-toggle" aria-pressed="true"  data-image-type="all">Alles</button>' +
            '</div>' +
            '<div class="online-filter-group" role="group" aria-label="Zoektaal">' +
              '<button type="button" class="btn btn-toggle" aria-pressed="true"  data-lang="nl">NL</button>' +
              '<button type="button" class="btn btn-toggle" aria-pressed="false" data-lang="en">EN</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* Resultaten */
      '<div class="clipart-grid-container online-results-container">' +
        '<p class="online-count" id="online-count" hidden></p>' +
        '<div class="online-loading" id="online-loading" hidden>' +
          '<p>Bezig met zoeken\u2026</p>' +
        '</div>' +
        '<p class="clipart-empty" id="online-empty" hidden></p>' +
        '<div class="online-grid" id="online-grid" role="grid" aria-label="Online zoekresultaten"></div>' +
        '<button type="button" class="btn online-load-more" id="online-load-more" hidden>Meer laden</button>' +
        '<p class="online-attribution" id="online-attribution" hidden>' +
          'Afbeeldingen via <a href="https://pixabay.com" target="_blank" rel="noopener noreferrer">Pixabay</a>' +
        '</p>' +
      '</div>' +

      /* Bevestigingspanel (vervangt grid bij selectie) */
      '<div class="online-confirm" id="online-confirm" hidden>' +
        '<button type="button" class="btn online-confirm-back" id="online-confirm-back" ' +
                'aria-label="Terug naar zoekresultaten">\u2190 Terug</button>' +
        '<div class="online-confirm-preview">' +
          '<img id="online-confirm-img" src="" alt="Voorbeeld van geselecteerde afbeelding" ' +
               'style="max-width:100%;max-height:250px;border-radius:var(--radius,4px)">' +
        '</div>' +
        '<div class="online-confirm-info">' +
          '<p id="online-confirm-tags" class="online-confirm-tags"></p>' +
          '<p class="online-confirm-source">Bron: <a id="online-confirm-link" href="#" ' +
             'target="_blank" rel="noopener noreferrer">Pixabay</a></p>' +
        '</div>' +
        '<div class="online-confirm-actions">' +
          '<button type="button" class="btn btn-primary" id="online-confirm-add">Toevoegen aan kaart</button>' +
          '<button type="button" class="btn" id="online-confirm-cancel">Annuleren</button>' +
        '</div>' +
        '<p class="online-confirm-status" id="online-confirm-status" aria-live="polite" aria-atomic="true"></p>' +
      '</div>';

    /* Referenties ophalen */
    gridEl        = panel.querySelector('#online-grid');
    searchInput   = panel.querySelector('#online-search-input');
    searchBtn     = panel.querySelector('#online-search-btn');
    loadMoreBtn   = panel.querySelector('#online-load-more');
    countEl       = panel.querySelector('#online-count');
    confirmPanel  = panel.querySelector('#online-confirm');
    loadingEl     = panel.querySelector('#online-loading');
    emptyEl       = panel.querySelector('#online-empty');
    offlineBanner = panel.querySelector('#online-offline-banner');
    apiKeyBanner  = panel.querySelector('#online-apikey-banner');

    wireEvents();
  }

  /* --- Events -------------------------------------------------------------- */

  function wireEvents() {
    /* Zoekbalk: enable/disable knop */
    searchInput.addEventListener('input', function () {
      searchBtn.disabled = this.value.trim() === '';
    });

    /* Zoeken via Enter */
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !searchBtn.disabled) doSearch();
    });

    /* Zoekknop */
    searchBtn.addEventListener('click', function () { doSearch(); });

    /* Pijltjestoetsen in grid */
    panel.addEventListener('keydown', handleGridKeydown);

    /* Type-filter knoppen */
    panel.querySelectorAll('[data-image-type]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setImageTypeFilter(this.getAttribute('data-image-type'));
      });
    });

    /* Taal-filter knoppen */
    panel.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLangFilter(this.getAttribute('data-lang'));
      });
    });

    /* Meer laden */
    loadMoreBtn.addEventListener('click', function () { loadMore(); });

    /* Instellingen openen vanuit API-key-banner */
    panel.querySelector('#online-open-settings').addEventListener('click', function () {
      if (typeof KaartSettings !== 'undefined') KaartSettings.open();
    });

    /* Opnieuw proberen (offline) */
    panel.querySelector('#online-retry-btn').addEventListener('click', function () {
      activate();
    });

    /* Bevestigingspanel: Toevoegen */
    panel.querySelector('#online-confirm-add').addEventListener('click', function () {
      confirmAdd();
    });

    /* Bevestigingspanel: Annuleren */
    panel.querySelector('#online-confirm-cancel').addEventListener('click', function () {
      hideConfirm();
    });

    /* Bevestigingspanel: Terug */
    panel.querySelector('#online-confirm-back').addEventListener('click', function () {
      hideConfirm();
    });

    /* Online/offline events */
    window.addEventListener('online',  function () { updateBanners(); });
    window.addEventListener('offline', function () { updateBanners(); });
  }

  /* --- Banners bijwerken --------------------------------------------------- */

  function updateBanners() {
    /* navigator.onLine is onbetrouwbaar — gebruik het alleen als zachte hint.
       Het formulier is altijd zichtbaar; echte verbindingsfouten worden
       afgehandeld door de fetch-foutmelding in doSearch(). */
    var mightBeOffline = navigator.onLine === false;
    var hasKey         = !!KaartSettings.getPixabayApiKey();
    var form           = panel.querySelector('#online-search-form');

    offlineBanner.hidden = !mightBeOffline;
    apiKeyBanner.hidden  = hasKey;
    if (form) form.hidden = !hasKey;
  }

  /* --- Filters ------------------------------------------------------------- */

  function setImageTypeFilter(type) {
    lastImageType = type;
    panel.querySelectorAll('[data-image-type]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-image-type') === type ? 'true' : 'false');
    });
  }

  function setLangFilter(lang) {
    lastLang = lang;
    panel.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
  }

  /* --- Zoeken -------------------------------------------------------------- */

  function doSearch() {
    var q = searchInput.value.trim();
    if (!q) return;

    lastQuery  = q;
    currentPage = 1;
    currentHits = [];
    currentTotal = 0;
    focusedIndex = 0;

    showLoading(true);
    hideCount();
    emptyEl.hidden = true;
    gridEl.innerHTML = '';
    loadMoreBtn.hidden = true;
    panel.querySelector('#online-attribution').hidden = true;

    KaartPixabay.search({
      query:     q,
      imageType: lastImageType,
      lang:      lastLang,
      page:      1
    }, function (err, result) {
      showLoading(false);
      if (err) {
        showEmpty(KaartPixabay.errorMessage(err));
        return;
      }
      currentHits  = result.hits;
      currentTotal = result.totalHits;
      renderGrid(result.hits, false);
      updateCount(result.totalHits, q);
      panel.querySelector('#online-attribution').hidden = result.hits.length === 0;
    });
  }

  function loadMore() {
    currentPage++;
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Laden\u2026';

    KaartPixabay.search({
      query:     lastQuery,
      imageType: lastImageType,
      lang:      lastLang,
      page:      currentPage
    }, function (err, result) {
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Meer laden';

      if (err) {
        announceStatus(KaartPixabay.errorMessage(err));
        return;
      }

      var firstNewIdx = currentHits.length;
      currentHits = currentHits.concat(result.hits);
      renderGrid(result.hits, true);

      /* Focus eerste nieuwe cel (IS-P-02) */
      requestAnimationFrame(function () {
        var cells = gridEl.querySelectorAll('.online-result-cell');
        if (cells[firstNewIdx]) {
          focusedIndex = firstNewIdx;
          updateRovingTabindex(cells, firstNewIdx);
          cells[firstNewIdx].focus();
        }
      });

      /* Verberg "Meer laden" als we alles hebben */
      loadMoreBtn.hidden = currentHits.length >= currentTotal;
    });
  }

  /* --- Grid renderen ------------------------------------------------------- */

  function renderGrid(hits, append) {
    if (!append) {
      gridEl.innerHTML = '';
      focusedIndex = 0;
      prevFocusedCell = null;
    }

    if (!hits || hits.length === 0) {
      return;
    }

    var offset = append ? currentHits.length - hits.length : 0;

    /* Bouw rijen van ONLINE_COLS kolommen */
    for (var i = 0; i < hits.length; i += ONLINE_COLS) {
      var row = document.createElement('div');
      row.setAttribute('role', 'row');

      for (var j = 0; j < ONLINE_COLS; j++) {
        var hitIdx = i + j;
        if (hitIdx >= hits.length) break;
        var hit    = hits[hitIdx];
        var absIdx = offset + hitIdx;

        var cell = document.createElement('div');
        cell.setAttribute('role', 'gridcell');

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'online-result-cell';
        btn.setAttribute('tabindex', absIdx === focusedIndex ? '0' : '-1');
        btn.setAttribute('aria-label', 'Afbeelding: ' + hit.tags);
        btn.setAttribute('data-hit-idx', absIdx);

        var img = document.createElement('img');
        img.src     = '';
        img.setAttribute('data-src', hit.previewURL);
        img.alt     = '';
        img.loading = 'lazy';
        img.width   = 130;
        img.height  = 100;

        /* Lazy load via IntersectionObserver als beschikbaar, anders direct */
        if (window.IntersectionObserver) {
          lazyLoad(img);
        } else {
          img.src = hit.previewURL;
        }

        var tags = document.createElement('span');
        tags.className   = 'online-result-tags';
        tags.textContent = hit.tags;

        btn.appendChild(img);
        btn.appendChild(tags);

        btn.addEventListener('click', function () {
          var idx = parseInt(this.getAttribute('data-hit-idx'), 10);
          selectHit(idx);
        });

        cell.appendChild(btn);
        row.appendChild(cell);
      }
      gridEl.appendChild(row);
    }

    loadMoreBtn.hidden = currentHits.length >= currentTotal;
  }

  /* Lazy-load afbeeldingen via IntersectionObserver */
  var lazyObserver = null;
  function lazyLoad(img) {
    if (!lazyObserver) {
      lazyObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            if (el.getAttribute('data-src')) {
              el.src = el.getAttribute('data-src');
              lazyObserver.unobserve(el);
            }
          }
        });
      }, { rootMargin: '200px' });
    }
    lazyObserver.observe(img);
  }

  /* --- Toetsenbordnavigatie grid ------------------------------------------ */

  function handleGridKeydown(e) {
    var target = e.target;
    if (!target.classList.contains('online-result-cell')) return;

    var cells = Array.prototype.slice.call(gridEl.querySelectorAll('.online-result-cell'));
    var total = cells.length;
    if (!total) return;

    var idx = focusedIndex;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      idx = (idx + 1) % total;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      idx = (idx - 1 + total) % total;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      idx = Math.min(idx + ONLINE_COLS, total - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      idx = Math.max(idx - ONLINE_COLS, 0);
    } else if (e.key === 'Home') {
      e.preventDefault();
      idx = Math.floor(idx / ONLINE_COLS) * ONLINE_COLS;
    } else if (e.key === 'End') {
      e.preventDefault();
      idx = Math.min(Math.floor(idx / ONLINE_COLS) * ONLINE_COLS + ONLINE_COLS - 1, total - 1);
    } else {
      return;
    }

    focusedIndex = idx;
    updateRovingTabindex(cells, idx);
    cells[idx].focus();
  }

  function updateRovingTabindex(cells, activeIdx) {
    if (prevFocusedCell) prevFocusedCell.setAttribute('tabindex', '-1');
    var next = cells[activeIdx];
    if (next) next.setAttribute('tabindex', '0');
    prevFocusedCell = next || null;
  }

  /* --- Hit selecteren → bevestigingspanel ---------------------------------- */

  function selectHit(idx) {
    var hit = currentHits[idx];
    if (!hit) return;
    selectedHit   = hit;
    focusedIndex  = idx;

    /* Vul bevestigingspanel */
    var img   = panel.querySelector('#online-confirm-img');
    var tags  = panel.querySelector('#online-confirm-tags');
    var link  = panel.querySelector('#online-confirm-link');
    var status = panel.querySelector('#online-confirm-status');

    img.src  = hit.webformatURL;
    img.alt  = 'Voorbeeld: ' + hit.tags;
    tags.textContent  = hit.tags;
    link.href         = hit.pageURL;
    status.textContent = '';

    /* Toon bevestigingspanel, verberg grid */
    panel.querySelector('.online-results-container').hidden = true;
    panel.querySelector('#online-search-form').hidden       = true;
    confirmPanel.hidden = false;

    requestAnimationFrame(function () {
      var addBtn = panel.querySelector('#online-confirm-add');
      if (addBtn) addBtn.focus();
    });
  }

  function hideConfirm() {
    confirmPanel.hidden = true;
    panel.querySelector('.online-results-container').hidden = false;
    panel.querySelector('#online-search-form').hidden       = false;
    selectedHit = null;

    /* Focus terugzetten op de geselecteerde cel */
    requestAnimationFrame(function () {
      var cells = gridEl.querySelectorAll('.online-result-cell');
      if (cells[focusedIndex]) cells[focusedIndex].focus();
    });
  }

  /* --- Afbeelding toevoegen aan kaart -------------------------------------- */

  function confirmAdd() {
    if (!selectedHit) return;

    var hit    = selectedHit;
    var addBtn = panel.querySelector('#online-confirm-add');
    var status = panel.querySelector('#online-confirm-status');

    addBtn.disabled = true;
    addBtn.textContent = 'Downloaden\u2026';
    status.textContent = 'Afbeelding downloaden\u2026';

    KaartPixabay.downloadAsBase64(hit.webformatURL, function (err, dataURL) {
      if (err) {
        addBtn.disabled    = false;
        addBtn.textContent = 'Toevoegen aan kaart';
        status.textContent = 'Download mislukt. Probeer het opnieuw.';
        return;
      }

      var assetId = 'pixabay-' + hit.id;
      KaartPixabay.registerAsset(assetId, {
        pixabayId: hit.id,
        tags:      hit.tags,
        pageURL:   hit.pageURL,
        user:      hit.user || ''
      });

      /* Gebruik de eerste 3 tags als label */
      var labelTags = hit.tags.split(',').slice(0, 3).map(function (t) {
        return t.trim();
      }).join(', ');

      KaartCanvas.addRasterImage(dataURL, function (imgObj) {
        addBtn.disabled    = false;
        addBtn.textContent = 'Toevoegen aan kaart';

        if (!imgObj) {
          status.textContent = 'Toevoegen mislukt. Probeer het opnieuw.';
          return;
        }

        announceStatus('Afbeelding \u201c' + labelTags + '\u201d toegevoegd aan de kaart.');

        /* Sluit het bevestigingspanel en de clipart-modal */
        confirmPanel.hidden = true;
        selectedHit = null;

        /* Sluit de hele clipart-modal */
        if (typeof KaartClipart !== 'undefined' && KaartClipart.close) {
          KaartClipart.close();
        }
      }, { kaartLabel: labelTags, kaartAssetId: assetId });
    });
  }

  /* --- Hulpfuncties -------------------------------------------------------- */

  function showLoading(visible) {
    loadingEl.hidden = !visible;
    if (visible) {
      searchBtn.disabled    = true;
      searchBtn.textContent = 'Bezig\u2026';
      announceStatus('Bezig met zoeken\u2026');
    } else {
      searchBtn.disabled    = searchInput.value.trim() === '';
      searchBtn.textContent = 'Zoeken';
    }
  }

  function showEmpty(msg) {
    emptyEl.textContent = msg;
    emptyEl.hidden      = false;
    announceStatus(msg);
  }

  function hideCount() {
    countEl.hidden = true;
  }

  function updateCount(total, query) {
    if (total === 0) {
      showEmpty('Geen afbeeldingen gevonden voor \u201c' + query + '\u201d. Probeer een andere zoekterm of kies \u201cAlles\u201d als type.');
      return;
    }
    countEl.textContent = total + ' resultaten voor \u201c' + query + '\u201d';
    countEl.hidden      = false;
    announceStatus(total + ' resultaten gevonden voor \u201c' + query + '\u201d');
  }

  /* --- Publieke API -------------------------------------------------------- */

  function init() {
    buildPanel();
  }

  function getPanel() {
    return panel;
  }

  /* activate() wordt aangeroepen door clipart.js bij tab-switch naar dit panel */
  function activate() {
    updateBanners();
    /* Autofocus zoekbalk als API key beschikbaar en online */
    requestAnimationFrame(function () {
      if (KaartPixabay.isOnline() && KaartSettings.getPixabayApiKey()) {
        if (searchInput) searchInput.focus();
      }
    });
  }

  /* deactivate() wordt aangeroepen bij tab-switch weg van dit panel */
  function deactivate() { /* niets te doen */ }

  return {
    init:       init,
    getPanel:   getPanel,
    activate:   activate,
    deactivate: deactivate
  };

})();
