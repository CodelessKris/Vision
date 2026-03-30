/* =============================================================================
   utils.js — Gedeelde hulpfuncties
   Kaarteditor | Sprint 1

   Geladen als eerste script — beschikbaar voor alle modules.
   ============================================================================= */

/* debounce — voorkomt dat snel herhaalde aanroepen te veel werk doen.
   Gebruik: var debouncedFn = debounce(fn, 250); */
function debounce(fn, delay) {
  var timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}

/* isValidHex — controleert of een waarde een geldige 6-cijferige hex-kleur is. */
function isValidHex(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

/* bindColorPair — koppelt een kleurpicker en hex-tekstveld aan elkaar.
   onChange(color) wordt aangeroepen bij elke geldige kleurwijziging. */
function bindColorPair(pickerId, hexId, onChange) {
  var picker = document.getElementById(pickerId);
  var hex    = document.getElementById(hexId);
  if (!picker || !hex) return;

  picker.addEventListener('input', function () {
    hex.value = this.value.toUpperCase();
    onChange(this.value);
  });

  hex.addEventListener('input', function () {
    var val = this.value.trim();
    if (val.length > 0 && val[0] !== '#') val = '#' + val;
    if (isValidHex(val)) {
      picker.value = val;
      onChange(val);
    }
  });

  hex.addEventListener('blur', function () {
    if (!isValidHex(this.value.trim())) {
      this.value = picker.value.toUpperCase();
    }
  });
}

/* trapFocus — registreert Tab/Escape-handlers op een modaal element.
   Geeft een cleanup-functie terug die de listeners verwijdert.
   onEscape() wordt aangeroepen bij Escape of wanneer focus buiten de container komt. */
function trapFocus(container, onEscape) {
  function getFocusable() {
    return Array.prototype.slice.call(
      container.querySelectorAll('button:not([disabled]), input, a[href], [tabindex="0"]')
    ).filter(function (el) {
      return !el.closest('[hidden]') && el.offsetParent !== null;
    });
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { onEscape(); return; }
    if (e.key !== 'Tab') return;
    var focusable = getFocusable();
    if (!focusable.length) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  container.addEventListener('keydown', onKeydown);
  return function cleanup() { container.removeEventListener('keydown', onKeydown); };
}

/* announceStatus — schrijft bericht naar de aria-live regio.
   Wist eerst (zodat herhaling van hetzelfde bericht opnieuw wordt uitgesproken),
   wacht 100 ms en schrijft dan — lang genoeg voor screenreaders om de wisseling te zien. */
var _announceTimer = null;
function announceStatus(message) {
  var announcer = document.getElementById('status-announcer');
  if (!announcer) return;
  clearTimeout(_announceTimer);
  announcer.textContent = '';
  _announceTimer = setTimeout(function () {
    announcer.textContent = message;
  }, 100);
}

/* --- Thema-schakelaar (A-19) ---
   Gebruikt door zowel index.html als editor.html.
   Slaat voorkeur op in localStorage. Respecteert prefers-color-scheme als
   er geen opgeslagen voorkeur is. */

var THEME_KEY = 'kaarteditor-theme';
var _themeInitialized = false;

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  /* Werk alle schakelaar-knoppen op de pagina bij */
  document.querySelectorAll('#btn-theme-toggle').forEach(function (btn) {
    if (theme === 'light') {
      btn.textContent = 'Donker thema';
      btn.setAttribute('aria-label', 'Wissel naar donker thema');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.textContent = 'Licht thema';
      btn.setAttribute('aria-label', 'Wissel naar licht thema');
      btn.setAttribute('aria-pressed', 'false');
    }
  });
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  var next = (current === 'light') ? 'dark' : 'light';
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  announceStatus(next === 'light' ? 'Licht thema geactiveerd' : 'Donker thema geactiveerd');
}

function initThemeToggle() {
  if (_themeInitialized) return;
  _themeInitialized = true;

  /* Bepaal beginwaarde: localStorage → prefers-color-scheme → dark (standaard) */
  var stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}

  var theme;
  if (stored === 'light' || stored === 'dark') {
    theme = stored;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    theme = 'light';
  } else {
    theme = 'dark';
  }
  applyTheme(theme);

  /* Bind knoppen */
  document.querySelectorAll('#btn-theme-toggle').forEach(function (btn) {
    btn.addEventListener('click', toggleTheme);
  });

  /* Volg OS-voorkeur als er geen opgeslagen voorkeur is */
  if (!stored && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
      var hasPref = null;
      try { hasPref = localStorage.getItem(THEME_KEY); } catch (ex) {}
      if (!hasPref) applyTheme(e.matches ? 'light' : 'dark');
    });
  }
}
