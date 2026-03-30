/* =============================================================================
   pixabay.js — Pixabay API-client, sessiecache en asset-registry
   Kaarteditor | Sprint 5 — Online Afbeelding Zoeken
   ============================================================================= */

var KaartPixabay = (function () {
  'use strict';

  /* Sessiecache: sleutel = "query|imageType|lang|page" → { hits, totalHits }
     Max 50 vermeldingen — oudste wordt verwijderd bij overschrijding (LRU-FIFO). */
  var searchCache   = new Map();
  var CACHE_MAX     = 50;

  /* Asset-registry: sleutel = assetId → { pixabayId, tags, pageURL, user } */
  var assetRegistry = {};

  /* --- Online-detectie ----------------------------------------------------- */

  function isOnline() {
    return navigator.onLine !== false;
  }

  /* --- Zoeken -------------------------------------------------------------- */

  /**
   * search(options, callback)
   *
   * options: {
   *   query:     string  — zoekterm
   *   imageType: string  — 'illustration' | 'photo' | 'all'  (standaard 'all')
   *   lang:      string  — 'nl' | 'en'                        (standaard 'nl')
   *   page:      number  — 1-based paginanummer               (standaard 1)
   * }
   * callback(err, result)
   *   err:    Error-object of null
   *   result: { hits: [...], totalHits: number }
   *
   * Elk hit-object bevat: id, pageURL, tags, previewURL, webformatURL,
   *   webformatWidth, webformatHeight, user
   */
  function search(options, callback) {
    var apiKey = KaartSettings.getPixabayApiKey();
    if (!apiKey) {
      callback(new Error('NO_API_KEY'));
      return;
    }
    if (!isOnline()) {
      callback(new Error('OFFLINE'));
      return;
    }

    var q         = (options.query     || '').trim();
    var imageType = options.imageType  || 'all';
    var lang      = options.lang       || 'nl';
    var page      = options.page       || 1;

    var cacheKey = q + '|' + imageType + '|' + lang + '|' + page;
    if (searchCache.has(cacheKey)) {
      callback(null, searchCache.get(cacheKey));
      return;
    }

    var url = 'https://pixabay.com/api/' +
              '?key='         + encodeURIComponent(apiKey) +
              '&q='           + encodeURIComponent(q) +
              '&image_type='  + encodeURIComponent(imageType) +
              '&lang='        + encodeURIComponent(lang) +
              '&safesearch=true' +
              '&per_page=20' +
              '&page='        + page +
              '&order=popular';

    fetch(url)
      .then(function (res) {
        if (res.status === 400) throw new Error('INVALID_KEY');
        if (res.status === 429) throw new Error('RATE_LIMIT');
        if (!res.ok)            throw new Error('HTTP_' + res.status);
        return res.json();
      })
      .then(function (data) {
        var result = {
          hits:      data.hits       || [],
          totalHits: data.totalHits  || 0
        };
        if (searchCache.size >= CACHE_MAX) {
          searchCache.delete(searchCache.keys().next().value);
        }
        searchCache.set(cacheKey, result);
        callback(null, result);
      })
      .catch(function (err) {
        callback(err);
      });
  }

  /* --- Afbeelding downloaden en omzetten naar base64 ----------------------- */

  /**
   * downloadAsBase64(imageURL, callback)
   * callback(err, dataURL)
   */
  function downloadAsBase64(imageURL, callback) {
    if (!isOnline()) {
      callback(new Error('OFFLINE'));
      return;
    }
    fetch(imageURL)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP_' + res.status);
        return res.blob();
      })
      .then(function (blob) {
        var reader = new FileReader();
        reader.onload  = function () { callback(null, reader.result); };
        reader.onerror = function () { callback(new Error('READ_ERROR')); };
        reader.readAsDataURL(blob);
      })
      .catch(function (err) {
        callback(err);
      });
  }

  /* --- Asset-registry ------------------------------------------------------ */

  /**
   * registerAsset(assetId, metadata)
   * Sla metadata op voor een gedownloade Pixabay-afbeelding.
   * metadata: { pixabayId, tags, pageURL, user }
   */
  function registerAsset(assetId, metadata) {
    assetRegistry[assetId] = {
      source:    'pixabay',
      pixabayId: metadata.pixabayId || 0,
      tags:      metadata.tags      || '',
      pageURL:   metadata.pageURL   || '',
      user:      metadata.user      || ''
    };
  }

  function getAssetRegistry() {
    return assetRegistry;
  }

  /**
   * restoreAssets(assets) — herstel asset-registry na laden van een .kaart bestand.
   * Behoudt bestaande items zodat meerdere .kaart bestanden samen kunnen bestaan
   * in een sessie als de gebruiker er meerdere achter elkaar opent.
   */
  function restoreAssets(assets) {
    if (!assets || typeof assets !== 'object') return;
    Object.keys(assets).forEach(function (id) {
      assetRegistry[id] = assets[id];
    });
  }

  /* --- Foutmelding vertalen ------------------------------------------------ */

  function errorMessage(err) {
    if (!err) return 'Onbekende fout.';
    if (err.message === 'NO_API_KEY')   return 'Stel eerst een Pixabay API-sleutel in via Instellingen.';
    if (err.message === 'OFFLINE')      return 'Geen internetverbinding. Controleer uw verbinding.';
    if (err.message === 'INVALID_KEY')  return 'Ongeldige API-sleutel. Controleer uw sleutel via Instellingen.';
    if (err.message === 'RATE_LIMIT')   return 'Te veel verzoeken. Wacht even en probeer opnieuw.';
    return 'Zoeken is mislukt. Probeer het opnieuw.';
  }

  return {
    search:            search,
    downloadAsBase64:  downloadAsBase64,
    registerAsset:     registerAsset,
    getAssetRegistry:  getAssetRegistry,
    restoreAssets:     restoreAssets,
    errorMessage:      errorMessage,
    isOnline:          isOnline
  };

})();
