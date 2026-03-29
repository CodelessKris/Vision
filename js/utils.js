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
