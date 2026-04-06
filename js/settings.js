/* =============================================================================
   settings.js — Instellingen-modal (API key beheer)
   Kaarteditor | Sprint 5 — Online Afbeelding Zoeken
   ============================================================================= */

var KaartSettings = (function () {
  'use strict';

  var STORAGE_KEY = 'kaarteditor-settings';
  var modal       = null;
  var openerBtn   = null;

  /* --- localStorage helpers ------------------------------------------------ */

  function getSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveSettings(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      _cachedApiKey = null;
    } catch (e) { /* quota — niets te doen */ }
  }

  var _cachedApiKey = null;

  function getPixabayApiKey() {
    if (_cachedApiKey === null) _cachedApiKey = getSettings().pixabayApiKey || '';
    return _cachedApiKey;
  }

  /* --- Modal bouwen --------------------------------------------------------- */

  function buildModal() {
    modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'settings-modal-title');
    modal.hidden = true;

    modal.innerHTML =
      '<div class="modal-content settings-modal-content">' +
        '<div class="modal-header">' +
          '<h2 id="settings-modal-title">Instellingen</h2>' +
          '<button type="button" class="btn modal-close" id="settings-modal-close" ' +
                  'aria-label="Sluit instellingen">Sluiten</button>' +
        '</div>' +
        '<div class="settings-body">' +
          '<div class="form-group">' +
            '<label for="settings-pixabay-key">Pixabay API-sleutel</label>' +
            '<div class="settings-key-row">' +
              '<input type="password" id="settings-pixabay-key" ' +
                     'placeholder="Voer je API-sleutel in" autocomplete="off" ' +
                     'aria-describedby="settings-key-help">' +
              '<button type="button" class="btn settings-show-key" id="settings-show-key" ' +
                      'aria-label="Toon API-sleutel" aria-pressed="false">Toon</button>' +
            '</div>' +
            '<p class="settings-help" id="settings-key-help">' +
              'Vereist voor online afbeeldingen zoeken. ' +
              '<a href="https://pixabay.com/api/docs/" target="_blank" rel="noopener noreferrer">' +
                'Gratis aanmaken op pixabay.com' +
              '</a>.' +
            '</p>' +
          '</div>' +
          '<div class="form-group">' +
            '<div class="settings-checkbox-row">' +
              '<input type="checkbox" id="settings-autosave" checked>' +
              '<label for="settings-autosave">Automatisch opslaan (elke 30 seconden)</label>' +
            '</div>' +
            '<p class="settings-help">' +
              'Slaat een concept op in de browser. Niet hetzelfde als opslaan naar een bestand.' +
            '</p>' +
          '</div>' +
          '<div class="settings-actions">' +
            '<button type="button" class="btn btn-primary" id="settings-save-btn">Opslaan en testen</button>' +
          '</div>' +
          '<p class="settings-feedback" id="settings-feedback" aria-live="polite" aria-atomic="true"></p>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    /* Sluit-knop */
    modal.querySelector('#settings-modal-close').addEventListener('click', close);

    /* Klik op overlay sluit modal */
    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });

    /* Escape sluit modal + focus trap */
    trapFocus(modal, close);

    /* Toon/verberg sleutel toggle */
    modal.querySelector('#settings-show-key').addEventListener('click', function () {
      var input   = modal.querySelector('#settings-pixabay-key');
      var isText  = input.type === 'text';
      input.type  = isText ? 'password' : 'text';
      this.textContent        = isText ? 'Toon' : 'Verberg';
      this.setAttribute('aria-pressed', isText ? 'false' : 'true');
      this.setAttribute('aria-label', isText ? 'Toon API-sleutel' : 'Verberg API-sleutel');
    });

    /* Autosave toggle — slaat direct op zonder API-key test */
    modal.querySelector('#settings-autosave').addEventListener('change', function () {
      var settings = getSettings();
      settings.autosaveEnabled = this.checked;
      saveSettings(settings);
      if (this.checked) {
        if (typeof KaartStorage !== 'undefined') KaartStorage.startAutosave();
        announceStatus('Automatisch opslaan ingeschakeld');
      } else {
        if (typeof KaartStorage !== 'undefined') KaartStorage.stopAutosave();
        announceStatus('Automatisch opslaan uitgeschakeld');
      }
    });

    /* Opslaan */
    modal.querySelector('#settings-save-btn').addEventListener('click', function () {
      var key      = modal.querySelector('#settings-pixabay-key').value.trim();
      var feedback = modal.querySelector('#settings-feedback');
      var btn      = this;

      if (!key) {
        setFeedback(feedback, 'Voer een API-sleutel in.', 'error');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Testen…';
      setFeedback(feedback, '', '');

      /* Sla tijdelijk op zodat KaartPixabay.search de nieuwe sleutel gebruikt */
      var settings = getSettings();
      settings.pixabayApiKey = key;
      saveSettings(settings);

      KaartPixabay.search({ query: 'test', imageType: 'all', lang: 'nl', page: 1 },
        function (err) {
          btn.disabled = false;
          btn.textContent = 'Opslaan en testen';
          if (!err) {
            setFeedback(feedback, 'Verbinding geslaagd. Sleutel opgeslagen.', 'success');
            announceStatus('Pixabay API-sleutel opgeslagen.');
          } else {
            /* Sleutel ongeldig — verwijder hem weer */
            settings.pixabayApiKey = '';
            saveSettings(settings);
            setFeedback(feedback, KaartPixabay.errorMessage(err), 'error');
          }
        });
    });
  }

  function setFeedback(el, msg, type) {
    el.textContent = msg;
    el.className = 'settings-feedback settings-feedback--' + (type || '');
  }

  /* --- Open / Close -------------------------------------------------------- */

  function open() {
    openerBtn = document.activeElement;
    /* Vul huidig opgeslagen sleutel in */
    var keyInput = modal.querySelector('#settings-pixabay-key');
    if (keyInput) keyInput.value = getPixabayApiKey();
    /* Autosave checkbox synchroniseren */
    var autosaveCheckbox = modal.querySelector('#settings-autosave');
    if (autosaveCheckbox) {
      autosaveCheckbox.checked = getSettings().autosaveEnabled !== false;
    }
    /* Reset feedback */
    var feedback = modal.querySelector('#settings-feedback');
    if (feedback) setFeedback(feedback, '', '');

    modal.hidden = false;
    /* Focus eerste interactief element */
    requestAnimationFrame(function () {
      var focusable = Array.prototype.slice.call(
        modal.querySelectorAll('button:not([disabled]), input, a[href], [tabindex="0"]')
      ).filter(function (el) { return !el.closest('[hidden]') && el.offsetParent !== null; });
      if (focusable.length) focusable[0].focus();
    });
  }

  function close() {
    modal.hidden = true;
    if (openerBtn && openerBtn.focus) openerBtn.focus();
    openerBtn = null;
  }

  /* --- Init ---------------------------------------------------------------- */

  function init() {
    buildModal();
  }

  return {
    init:              init,
    open:              open,
    close:             close,
    getPixabayApiKey:  getPixabayApiKey,
    getSettings:       getSettings,
    saveSettings:      saveSettings
  };

})();
