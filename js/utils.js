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
