/* =============================================================================
   clipart.js — Clipart-bibliotheek: modal, grid-navigatie, zoeken, SVG-data
   Kaarteditor | Sprint 2

   SVG's zijn ingesloten als stringconstanten — geen externe bestandsaanvragen,
   compatibel met file://-protocol. Elk SVG heeft viewBox="0 0 64 64" en gebruikt
   fill="currentColor" zodat het kan worden aangepast via CSS.
   ============================================================================= */

var KaartClipart = (function () {
  'use strict';

  /* ==========================================================================
     CLIPART DATA — 40+ items in 5 categorieën
     ========================================================================== */

  var CLIPART_DATA = [
    /* ---- Verjaardag ---- */
    { id: 'ballon', category: 'verjaardag', label: 'Ballon',
      keywords: ['ballon', 'feest', 'verjaardag'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="32" cy="24" rx="16" ry="20" fill="currentColor"/><path d="M32 44 Q30 50 32 54 Q34 50 32 44Z" fill="currentColor"/><line x1="32" y1="54" x2="28" y2="64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' },
    { id: 'taart', category: 'verjaardag', label: 'Taart',
      keywords: ['taart', 'verjaardag', 'kaarsje'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="34" width="48" height="22" rx="4" fill="currentColor"/><path d="M8 34 Q32 22 56 34Z" fill="currentColor" opacity="0.7"/><line x1="22" y1="30" x2="22" y2="18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="22" cy="16" r="3" fill="currentColor"/><line x1="32" y1="28" x2="32" y2="14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="12" r="3" fill="currentColor"/><line x1="42" y1="30" x2="42" y2="18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="42" cy="16" r="3" fill="currentColor"/></svg>' },
    { id: 'cadeau', category: 'verjaardag', label: 'Cadeau',
      keywords: ['cadeau', 'verjaardag', 'pakje'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="28" width="48" height="32" rx="2" fill="currentColor"/><rect x="6" y="20" width="52" height="10" rx="2" fill="currentColor" opacity="0.8"/><rect x="28" y="20" width="8" height="40" fill="currentColor" opacity="0.6"/><path d="M32 20 Q20 10 14 14 Q10 18 20 22Z" fill="currentColor"/><path d="M32 20 Q44 10 50 14 Q54 18 44 22Z" fill="currentColor"/></svg>' },
    { id: 'confetti', category: 'verjaardag', label: 'Confetti',
      keywords: ['confetti', 'feest', 'verjaardag'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="10" width="8" height="8" rx="1" transform="rotate(30 12 14)" fill="currentColor"/><circle cx="32" cy="10" r="4" fill="currentColor" opacity="0.7"/><rect x="48" y="8" width="6" height="6" rx="1" transform="rotate(-20 51 11)" fill="currentColor" opacity="0.8"/><circle cx="14" cy="36" r="3" fill="currentColor" opacity="0.6"/><rect x="26" y="28" width="10" height="6" rx="1" transform="rotate(45 31 31)" fill="currentColor"/><circle cx="52" cy="32" r="5" fill="currentColor" opacity="0.9"/><rect x="10" y="50" width="7" height="7" rx="1" transform="rotate(-30 13 53)" fill="currentColor" opacity="0.8"/><circle cx="38" cy="52" r="4" fill="currentColor" opacity="0.7"/><rect x="52" y="48" width="6" height="6" rx="1" transform="rotate(15 55 51)" fill="currentColor"/></svg>' },
    { id: 'feesthoed', category: 'verjaardag', label: 'Feesthoed',
      keywords: ['feesthoed', 'verjaardag', 'feest', 'hoed'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 10,52 54,52" fill="currentColor"/><rect x="8" y="52" width="48" height="8" rx="2" fill="currentColor" opacity="0.7"/><circle cx="32" cy="4" r="3" fill="currentColor" opacity="0.5"/><line x1="18" y1="30" x2="24" y2="36" stroke="currentColor" stroke-width="2" opacity="0.5"/><line x1="38" y1="24" x2="46" y2="32" stroke="currentColor" stroke-width="2" opacity="0.5"/></svg>' },
    { id: 'slingers', category: 'verjaardag', label: 'Slingers',
      keywords: ['slingers', 'verjaardag', 'feest'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M4 16 Q16 28 28 16 Q40 4 52 16 Q58 22 60 16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="4" cy="16" r="4" fill="currentColor"/><circle cx="16" cy="26" r="4" fill="currentColor" opacity="0.8"/><circle cx="28" cy="16" r="4" fill="currentColor" opacity="0.9"/><circle cx="40" cy="6" r="4" fill="currentColor" opacity="0.7"/><circle cx="52" cy="16" r="4" fill="currentColor" opacity="0.8"/><circle cx="60" cy="16" r="4" fill="currentColor"/><path d="M4 36 Q16 48 28 36 Q40 24 52 36 Q58 42 60 36" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/></svg>' },
    { id: 'vuurwerk', category: 'verjaardag', label: 'Vuurwerk',
      keywords: ['vuurwerk', 'feest', 'verjaardag'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="28" r="5" fill="currentColor"/><line x1="32" y1="4" x2="32" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="32" y1="38" x2="32" y2="52" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="28" x2="22" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="42" y1="28" x2="56" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="11" x2="24" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="40" y1="36" x2="49" y2="45" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="49" y1="11" x2="40" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="24" y1="36" x2="15" y2="45" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' },
    { id: 'ster-5', category: 'verjaardag', label: 'Ster',
      keywords: ['ster', 'verjaardag', 'feest'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 38,24 58,24 42,36 48,56 32,44 16,56 22,36 6,24 26,24" fill="currentColor"/></svg>' },

    /* ---- Feest ---- */
    { id: 'champagne', category: 'feest', label: 'Champagneglas',
      keywords: ['champagne', 'feest', 'glas', 'toast'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M20 8 L44 8 L38 36 L26 36Z" fill="currentColor"/><rect x="29" y="36" width="6" height="14" fill="currentColor"/><rect x="20" y="50" width="24" height="4" rx="2" fill="currentColor"/><circle cx="28" cy="18" r="2" fill="currentColor" opacity="0.4"/><circle cx="36" cy="22" r="2" fill="currentColor" opacity="0.4"/><circle cx="30" cy="26" r="1.5" fill="currentColor" opacity="0.4"/></svg>' },
    { id: 'hart', category: 'feest', label: 'Hart',
      keywords: ['hart', 'liefde', 'feest'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 54 L8 30 Q4 18 16 14 Q24 12 32 22 Q40 12 48 14 Q60 18 56 30Z" fill="currentColor"/></svg>' },
    { id: 'muzieknoot', category: 'feest', label: 'Muzieknoot',
      keywords: ['muziek', 'noot', 'feest'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="20" cy="50" rx="10" ry="7" fill="currentColor"/><ellipse cx="46" cy="44" rx="10" ry="7" fill="currentColor"/><rect x="28" y="12" width="4" height="40" fill="currentColor"/><rect x="28" y="12" width="22" height="4" fill="currentColor"/><rect x="28" y="22" width="22" height="4" fill="currentColor"/></svg>' },
    { id: 'kroon', category: 'feest', label: 'Kroon',
      keywords: ['kroon', 'koning', 'feest'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M8 50 L8 22 L20 36 L32 10 L44 36 L56 22 L56 50Z" fill="currentColor"/><rect x="6" y="50" width="52" height="8" rx="2" fill="currentColor" opacity="0.8"/><circle cx="32" cy="10" r="4" fill="currentColor" opacity="0.6"/></svg>' },
    { id: 'trofee', category: 'feest', label: 'Trofee',
      keywords: ['trofee', 'prijs', 'winnaar'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M18 8 Q10 8 10 20 Q10 34 24 38 L24 48 L20 48 L20 56 L44 56 L44 48 L40 48 L40 38 Q54 34 54 20 Q54 8 46 8Z" fill="currentColor"/></svg>' },
    { id: 'medaille', category: 'feest', label: 'Medaille',
      keywords: ['medaille', 'prijs', 'winnaar'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 36,16 20,8 32,20 44,8 28,16" fill="currentColor"/><circle cx="32" cy="40" r="18" fill="currentColor"/><polygon points="32,28 34,35 42,35 36,39 38,47 32,43 26,47 28,39 22,35 30,35" fill="currentColor" opacity="0.4"/></svg>' },
    { id: 'dans', category: 'feest', label: 'Dansende figuur',
      keywords: ['dans', 'feest', 'bewegen'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="10" r="7" fill="currentColor"/><line x1="32" y1="17" x2="32" y2="38" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="32" y1="24" x2="16" y2="18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="32" y1="24" x2="48" y2="32" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="32" y1="38" x2="18" y2="52" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="32" y1="38" x2="46" y2="54" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>' },
    { id: 'diamant', category: 'feest', label: 'Diamant',
      keywords: ['diamant', 'edelsteen', 'feest'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,58 4,24 14,8 50,8 60,24" fill="currentColor"/><polygon points="32,58 4,24 32,30 60,24" fill="currentColor" opacity="0.6"/><polygon points="14,8 4,24 32,30 50,8" fill="currentColor" opacity="0.8"/><polygon points="14,8 32,4 50,8 32,30" fill="currentColor" opacity="0.5"/></svg>' },

    /* ---- Natuur ---- */
    { id: 'bloem', category: 'natuur', label: 'Bloem',
      keywords: ['bloem', 'natuur', 'tuin'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="8" fill="currentColor"/><ellipse cx="32" cy="12" rx="8" ry="10" fill="currentColor" opacity="0.7"/><ellipse cx="32" cy="52" rx="8" ry="10" fill="currentColor" opacity="0.7"/><ellipse cx="12" cy="32" rx="10" ry="8" fill="currentColor" opacity="0.7"/><ellipse cx="52" cy="32" rx="10" ry="8" fill="currentColor" opacity="0.7"/><ellipse cx="17" cy="17" rx="7" ry="9" transform="rotate(45 17 17)" fill="currentColor" opacity="0.5"/><ellipse cx="47" cy="17" rx="7" ry="9" transform="rotate(-45 47 17)" fill="currentColor" opacity="0.5"/><ellipse cx="17" cy="47" rx="7" ry="9" transform="rotate(-45 17 47)" fill="currentColor" opacity="0.5"/><ellipse cx="47" cy="47" rx="7" ry="9" transform="rotate(45 47 47)" fill="currentColor" opacity="0.5"/></svg>' },
    { id: 'boom', category: 'natuur', label: 'Boom',
      keywords: ['boom', 'natuur', 'groen'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 8,36 20,36 10,54 32,54 32,54 54,54 44,36 56,36" fill="currentColor"/><rect x="28" y="54" width="8" height="8" rx="1" fill="currentColor" opacity="0.8"/></svg>' },
    { id: 'zon', category: 'natuur', label: 'Zon',
      keywords: ['zon', 'zomer', 'natuur'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="12" fill="currentColor"/><line x1="32" y1="4" x2="32" y2="14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="32" y1="50" x2="32" y2="60" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="4" y1="32" x2="14" y2="32" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="50" y1="32" x2="60" y2="32" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="12" y1="12" x2="19" y2="19" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="45" y1="45" x2="52" y2="52" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="52" y1="12" x2="45" y2="19" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="19" y1="45" x2="12" y2="52" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>' },
    { id: 'wolk', category: 'natuur', label: 'Wolk',
      keywords: ['wolk', 'lucht', 'natuur'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="22" cy="36" r="12" fill="currentColor"/><circle cx="36" cy="30" r="14" fill="currentColor"/><circle cx="48" cy="36" r="10" fill="currentColor"/><rect x="10" y="36" width="44" height="16" fill="currentColor"/></svg>' },
    { id: 'regenboog', category: 'natuur', label: 'Regenboog',
      keywords: ['regenboog', 'natuur', 'kleur'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M4 52 Q4 12 32 12 Q60 12 60 52" stroke="currentColor" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M12 52 Q12 22 32 22 Q52 22 52 52" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.7"/><path d="M20 52 Q20 30 32 30 Q44 30 44 52" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.5"/></svg>' },
    { id: 'vlinder', category: 'natuur', label: 'Vlinder',
      keywords: ['vlinder', 'natuur', 'lente'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 32 Q16 16 8 24 Q4 36 20 40 Q28 42 32 32Z" fill="currentColor"/><path d="M32 32 Q48 16 56 24 Q60 36 44 40 Q36 42 32 32Z" fill="currentColor" opacity="0.8"/><path d="M32 32 Q18 40 12 52 Q20 58 28 48 Q32 40 32 32Z" fill="currentColor" opacity="0.7"/><path d="M32 32 Q46 40 52 52 Q44 58 36 48 Q32 40 32 32Z" fill="currentColor" opacity="0.6"/><ellipse cx="32" cy="32" rx="3" ry="16" fill="currentColor"/></svg>' },
    { id: 'blad', category: 'natuur', label: 'Blad',
      keywords: ['blad', 'natuur', 'herfst'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M8 56 Q12 32 32 12 Q52 12 54 32 Q56 52 32 54 Q18 55 8 56Z" fill="currentColor"/><line x1="8" y1="56" x2="44" y2="22" stroke="currentColor" stroke-width="2" opacity="0.4"/><line x1="26" y1="50" x2="44" y2="34" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="18" y1="46" x2="32" y2="30" stroke="currentColor" stroke-width="1.5" opacity="0.4"/></svg>' },
    { id: 'berg', category: 'natuur', label: 'Bergen',
      keywords: ['berg', 'natuur', 'landschap'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,6 4,56 60,56" fill="currentColor"/><polygon points="50,20 32,56 64,56 68,56" fill="currentColor" opacity="0.7"/><polygon points="26,16 30,12 34,16 32,14" fill="currentColor" opacity="0.3"/></svg>' },

    /* ---- Dieren ---- */
    { id: 'kat', category: 'dieren', label: 'Kat',
      keywords: ['kat', 'poes', 'dier'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="34" r="18" fill="currentColor"/><polygon points="14,20 10,6 22,18" fill="currentColor"/><polygon points="50,20 54,6 42,18" fill="currentColor"/><circle cx="24" cy="32" r="3" fill="currentColor" opacity="0.3"/><circle cx="40" cy="32" r="3" fill="currentColor" opacity="0.3"/><path d="M26 40 Q32 46 38 40" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><line x1="20" y1="36" x2="6" y2="34" stroke="currentColor" stroke-width="1.5"/><line x1="20" y1="38" x2="6" y2="40" stroke="currentColor" stroke-width="1.5"/><line x1="44" y1="36" x2="58" y2="34" stroke="currentColor" stroke-width="1.5"/><line x1="44" y1="38" x2="58" y2="40" stroke="currentColor" stroke-width="1.5"/></svg>' },
    { id: 'hond', category: 'dieren', label: 'Hond',
      keywords: ['hond', 'dier', 'huisdier'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="30" r="16" fill="currentColor"/><ellipse cx="16" cy="24" rx="7" ry="10" fill="currentColor" opacity="0.8"/><ellipse cx="48" cy="24" rx="7" ry="10" fill="currentColor" opacity="0.8"/><circle cx="26" cy="28" r="3" fill="currentColor" opacity="0.3"/><circle cx="38" cy="28" r="3" fill="currentColor" opacity="0.3"/><ellipse cx="32" cy="38" rx="8" ry="5" fill="currentColor" opacity="0.7"/><path d="M28 42 Q32 48 36 42" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' },
    { id: 'vogel', category: 'dieren', label: 'Vogel',
      keywords: ['vogel', 'dier', 'natuur'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="36" cy="34" rx="20" ry="14" fill="currentColor"/><circle cx="50" cy="26" r="10" fill="currentColor"/><polygon points="56,24 64,22 58,28" fill="currentColor" opacity="0.8"/><circle cx="54" cy="24" r="2" fill="currentColor" opacity="0.3"/><path d="M20 34 Q14 28 8 34" stroke="currentColor" stroke-width="2" fill="none"/><path d="M20 38 Q14 44 8 38" stroke="currentColor" stroke-width="2" fill="none"/></svg>' },
    { id: 'vis', category: 'dieren', label: 'Vis',
      keywords: ['vis', 'zee', 'dier'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="28" cy="32" rx="22" ry="14" fill="currentColor"/><polygon points="50,22 64,14 64,50 50,42" fill="currentColor" opacity="0.8"/><circle cx="18" cy="28" r="3" fill="currentColor" opacity="0.3"/><path d="M28 26 Q34 22 38 28" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M28 36 Q34 40 38 36" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' },
    { id: 'konijn', category: 'dieren', label: 'Konijn',
      keywords: ['konijn', 'haas', 'dier'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="38" r="16" fill="currentColor"/><ellipse cx="22" cy="16" rx="6" ry="14" fill="currentColor"/><ellipse cx="42" cy="16" rx="6" ry="14" fill="currentColor"/><ellipse cx="22" cy="16" rx="3" ry="10" fill="currentColor" opacity="0.4"/><ellipse cx="42" cy="16" rx="3" ry="10" fill="currentColor" opacity="0.4"/><circle cx="26" cy="36" r="3" fill="currentColor" opacity="0.3"/><circle cx="38" cy="36" r="3" fill="currentColor" opacity="0.3"/><circle cx="32" cy="42" r="4" fill="currentColor" opacity="0.5"/></svg>' },
    { id: 'beer', category: 'dieren', label: 'Beer',
      keywords: ['beer', 'teddybeer', 'dier'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="34" r="18" fill="currentColor"/><circle cx="16" cy="18" r="9" fill="currentColor"/><circle cx="48" cy="18" r="9" fill="currentColor"/><ellipse cx="32" cy="42" rx="8" ry="6" fill="currentColor" opacity="0.7"/><circle cx="26" cy="30" r="3" fill="currentColor" opacity="0.3"/><circle cx="38" cy="30" r="3" fill="currentColor" opacity="0.3"/><circle cx="32" cy="36" r="2" fill="currentColor" opacity="0.4"/></svg>' },
    { id: 'uil', category: 'dieren', label: 'Uil',
      keywords: ['uil', 'vogel', 'dier'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="32" cy="36" rx="18" ry="22" fill="currentColor"/><circle cx="24" cy="28" r="8" fill="currentColor" opacity="0.4"/><circle cx="40" cy="28" r="8" fill="currentColor" opacity="0.4"/><circle cx="24" cy="28" r="4" fill="currentColor"/><circle cx="40" cy="28" r="4" fill="currentColor"/><polygon points="32,34 28,40 36,40" fill="currentColor" opacity="0.7"/><polygon points="14,18 20,10 20,24" fill="currentColor"/><polygon points="50,18 44,10 44,24" fill="currentColor"/></svg>' },
    { id: 'lieveheersbeestje', category: 'dieren', label: 'Lieveheersbeestje',
      keywords: ['lieveheersbeestje', 'insect', 'natuur'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 14 Q14 14 14 34 Q14 52 32 54 Q50 52 50 34 Q50 14 32 14Z" fill="currentColor"/><circle cx="22" cy="30" r="4" fill="currentColor" opacity="0.3"/><circle cx="42" cy="30" r="4" fill="currentColor" opacity="0.3"/><circle cx="22" cy="42" r="4" fill="currentColor" opacity="0.3"/><circle cx="42" cy="42" r="4" fill="currentColor" opacity="0.3"/><line x1="32" y1="14" x2="32" y2="54" stroke="currentColor" stroke-width="2" opacity="0.4"/><ellipse cx="32" cy="12" rx="10" ry="6" fill="currentColor" opacity="0.8"/><line x1="26" y1="8" x2="20" y2="2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="38" y1="8" x2="44" y2="2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' },

    /* ---- Overig ---- */
    { id: 'huis', category: 'overig', label: 'Huis',
      keywords: ['huis', 'thuis', 'woning'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 4,30 12,30 12,58 52,58 52,30 60,30" fill="currentColor"/><rect x="22" y="38" width="10" height="20" rx="1" fill="currentColor" opacity="0.4"/><rect x="34" y="38" width="12" height="12" rx="1" fill="currentColor" opacity="0.4"/></svg>' },
    { id: 'auto', category: 'overig', label: 'Auto',
      keywords: ['auto', 'voertuig', 'rijden'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="4" y="34" width="56" height="18" rx="3" fill="currentColor"/><path d="M12 34 L18 18 L46 18 L52 34Z" fill="currentColor" opacity="0.8"/><circle cx="18" cy="52" r="7" fill="currentColor" opacity="0.6"/><circle cx="46" cy="52" r="7" fill="currentColor" opacity="0.6"/><rect x="20" y="22" width="12" height="10" rx="1" fill="currentColor" opacity="0.3"/><rect x="34" y="22" width="12" height="10" rx="1" fill="currentColor" opacity="0.3"/></svg>' },
    { id: 'boek', category: 'overig', label: 'Boek',
      keywords: ['boek', 'lezen', 'kennis'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M8 10 Q8 8 12 8 L32 8 L32 56 L12 56 Q8 56 8 54Z" fill="currentColor"/><path d="M32 8 L52 8 Q56 8 56 10 L56 54 Q56 56 52 56 L32 56Z" fill="currentColor" opacity="0.7"/><line x1="36" y1="18" x2="52" y2="18" stroke="currentColor" stroke-width="2" opacity="0.4"/><line x1="36" y1="26" x2="52" y2="26" stroke="currentColor" stroke-width="2" opacity="0.4"/><line x1="36" y1="34" x2="52" y2="34" stroke="currentColor" stroke-width="2" opacity="0.4"/></svg>' },
    { id: 'koffie', category: 'overig', label: 'Koffiekopje',
      keywords: ['koffie', 'thee', 'kopje', 'drinken'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M10 26 L10 48 Q10 54 20 54 L40 54 Q50 54 50 48 L50 26Z" fill="currentColor"/><path d="M50 30 Q60 30 60 38 Q60 46 50 46" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="8" y="56" width="48" height="4" rx="2" fill="currentColor" opacity="0.8"/><path d="M22 18 Q24 10 20 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M30 18 Q32 10 28 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M38 18 Q40 10 36 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' },
    { id: 'brief', category: 'overig', label: 'Brief',
      keywords: ['brief', 'post', 'bericht'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="6" y="14" width="52" height="36" rx="3" fill="currentColor"/><path d="M6 14 L32 36 L58 14" stroke="currentColor" stroke-width="2" fill="none" opacity="0.5"/></svg>' },
    { id: 'klok', category: 'overig', label: 'Klok',
      keywords: ['klok', 'tijd', 'horloge'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="34" r="24" fill="currentColor"/><line x1="32" y1="12" x2="32" y2="34" stroke="currentColor" stroke-width="3" opacity="0.4"/><line x1="32" y1="34" x2="46" y2="40" stroke="currentColor" stroke-width="3" opacity="0.4"/><line x1="26" y1="8" x2="38" y2="8" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.7"/></svg>' },
    { id: 'sleutel', category: 'overig', label: 'Sleutel',
      keywords: ['sleutel', 'huis', 'slot'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="22" cy="24" r="14" fill="currentColor"/><circle cx="22" cy="24" r="7" fill="currentColor" opacity="0.3"/><rect x="32" y="22" width="26" height="6" rx="2" fill="currentColor"/><rect x="50" y="28" width="6" height="8" rx="1" fill="currentColor" opacity="0.8"/><rect x="42" y="28" width="5" height="6" rx="1" fill="currentColor" opacity="0.8"/></svg>' },
    { id: 'puzzel', category: 'overig', label: 'Puzzelstuk',
      keywords: ['puzzel', 'spel', 'stuk'],
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M8 8 L28 8 Q28 8 28 14 Q28 20 34 20 Q34 20 34 14 Q34 8 54 8 L54 28 Q54 28 48 28 Q42 28 42 34 Q42 40 48 40 Q54 40 54 40 L54 56 L34 56 Q34 56 34 50 Q34 44 28 44 Q22 44 22 50 Q22 56 8 56 L8 36 Q8 36 14 36 Q20 36 20 30 Q20 24 14 24 Q8 24 8 24Z" fill="currentColor"/></svg>' }
  ];

  /* ==========================================================================
     MODULE — Modal, grid, zoeken, navigatie
     ========================================================================== */

  var modal        = null;
  var gridEl       = null;
  var searchEl     = null;
  var openerBtn    = null;  /* knop die modal opende — focus terugkeer */
  var activeCategory = 'alle';
  var filteredItems  = [];  /* huidig zichtbare cliparts */
  var focusedIndex   = 0;   /* index in filteredItems */
  var COLS           = 4;   /* kolommen in grid (aanpasbaar) */

  /* --- Modal bouwen ------------------------------------------------------- */

  var activeTab = 'library'; /* 'library' of 'online' */

  function buildModal() {
    modal = document.createElement('div');
    modal.id = 'clipart-modal';
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'clipart-modal-title');
    modal.hidden = true;

    modal.innerHTML =
      '<div class="modal-content clipart-modal-content">' +
        '<div class="modal-header">' +
          '<h2 id="clipart-modal-title">Clipart toevoegen</h2>' +
          '<button type="button" class="btn modal-close" id="clipart-modal-close" aria-label="Sluit clipart-bibliotheek">Sluiten</button>' +
        '</div>' +
        /* Tabbladen */
        '<div class="clipart-tabs" role="tablist" aria-label="Clipart bron">' +
          '<button type="button" role="tab" id="clipart-tab-library" class="btn clipart-tab" ' +
                  'aria-selected="true" aria-controls="clipart-panel-library" tabindex="0">' +
            'Bibliotheek' +
          '</button>' +
          '<button type="button" role="tab" id="clipart-tab-online" class="btn clipart-tab" ' +
                  'aria-selected="false" aria-controls="clipart-panel-online" tabindex="-1">' +
            'Online zoeken' +
          '</button>' +
          '<button type="button" role="tab" id="clipart-tab-upload" class="btn clipart-tab" ' +
                  'aria-selected="false" aria-controls="clipart-panel-upload" tabindex="-1">' +
            'Eigen afbeelding' +
          '</button>' +
        '</div>' +
        /* Bibliotheek-tabpanel */
        '<div role="tabpanel" id="clipart-panel-library" aria-labelledby="clipart-tab-library">' +
          '<div class="clipart-controls">' +
            '<div class="clipart-search-row">' +
              '<label for="clipart-search">Zoeken</label>' +
              '<input type="search" id="clipart-search" placeholder="Zoek clipart..." autocomplete="off">' +
            '</div>' +
            '<div class="clipart-categories" role="group" aria-label="Categorie filter">' +
              '<button type="button" class="btn btn-toggle" aria-pressed="true" data-category="alle">Alle</button>' +
              '<button type="button" class="btn btn-toggle" aria-pressed="false" data-category="verjaardag">Verjaardag</button>' +
              '<button type="button" class="btn btn-toggle" aria-pressed="false" data-category="feest">Feest</button>' +
              '<button type="button" class="btn btn-toggle" aria-pressed="false" data-category="natuur">Natuur</button>' +
              '<button type="button" class="btn btn-toggle" aria-pressed="false" data-category="dieren">Dieren</button>' +
              '<button type="button" class="btn btn-toggle" aria-pressed="false" data-category="overig">Overig</button>' +
            '</div>' +
          '</div>' +
          '<div class="clipart-grid-container">' +
            '<p class="clipart-empty" id="clipart-empty" hidden>Geen cliparts gevonden</p>' +
            '<div class="clipart-grid" id="clipart-grid" role="grid" aria-label="Cliparts"></div>' +
          '</div>' +
        '</div>' +
        /* Online-tabpanel wordt hieronder toegevoegd via KaartImageSearch.getPanel() */
      '</div>';

    document.body.appendChild(modal);

    /* Online-panel toevoegen vanuit imagesearch.js */
    if (typeof KaartImageSearch !== 'undefined') {
      modal.querySelector('.modal-content').appendChild(KaartImageSearch.getPanel());
    }

    /* Upload-panel toevoegen vanuit imageupload.js */
    if (typeof KaartImageUpload !== 'undefined') {
      modal.querySelector('.modal-content').appendChild(KaartImageUpload.getPanel());
    }

    gridEl   = modal.querySelector('#clipart-grid');
    searchEl = modal.querySelector('#clipart-search');

    /* Sluit-knop */
    modal.querySelector('#clipart-modal-close').addEventListener('click', close);

    /* Klik op overlay (maar niet op inhoud) sluit modal */
    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });

    /* Escape + focustrap */
    trapFocus(modal, close);
    /* Grid/tablist-pijltjestoetsen */
    modal.addEventListener('keydown', handleModalNavKeydown);

    /* Zoekbalk */
    var debouncedFilter = debounce(function () {
      filterGrid();
    }, 200);
    searchEl.addEventListener('input', debouncedFilter);

    /* Categoriefilter */
    modal.querySelectorAll('[data-category]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setCategory(this.getAttribute('data-category'));
      });
    });

    /* Tab-knoppen */
    modal.querySelector('#clipart-tab-library').addEventListener('click', function () {
      switchClipartTab('library');
    });
    modal.querySelector('#clipart-tab-online').addEventListener('click', function () {
      switchClipartTab('online');
    });
    modal.querySelector('#clipart-tab-upload').addEventListener('click', function () {
      switchClipartTab('upload');
    });
  }

  /* --- Tab wisselen -------------------------------------------------------- */

  function switchClipartTab(tabId) {
    if (activeTab === tabId) return;
    activeTab = tabId;

    var tabs = [
      { id: 'library', tabEl: '#clipart-tab-library', panelEl: '#clipart-panel-library' },
      { id: 'online',  tabEl: '#clipart-tab-online',  panelEl: '#clipart-panel-online' },
      { id: 'upload',  tabEl: '#clipart-tab-upload',  panelEl: '#clipart-panel-upload' }
    ];

    tabs.forEach(function (t) {
      var tab   = modal.querySelector(t.tabEl);
      var panel = modal.querySelector(t.panelEl);
      var isActive = t.id === tabId;

      if (tab) {
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
      }
      if (panel) panel.hidden = !isActive;
    });

    /* Activeer/deactiveer sub-modules */
    if (typeof KaartImageSearch !== 'undefined') {
      if (tabId === 'online') KaartImageSearch.activate();
      else KaartImageSearch.deactivate();
    }
    if (typeof KaartImageUpload !== 'undefined') {
      if (tabId === 'upload') KaartImageUpload.activate();
      else KaartImageUpload.deactivate();
    }

    /* Focus naar zoekbalk bij bibliotheek */
    if (tabId === 'library') {
      requestAnimationFrame(function () {
        if (searchEl) searchEl.focus();
      });
    }
  }

  /* --- Grid renderen ------------------------------------------------------ */

  function renderGrid() {
    var query   = searchEl ? searchEl.value.trim().toLowerCase() : '';
    filteredItems = CLIPART_DATA.filter(function (item) {
      if (activeCategory !== 'alle' && item.category !== activeCategory) return false;
      if (!query) return true;
      return item.label.toLowerCase().indexOf(query) !== -1 ||
        item.keywords.some(function (kw) { return kw.indexOf(query) !== -1; });
    });

    gridEl.innerHTML = '';

    var emptyMsg = document.getElementById('clipart-empty');

    if (filteredItems.length === 0) {
      if (emptyMsg) emptyMsg.hidden = false;
      announceStatus('Geen cliparts gevonden');
      return;
    }

    if (emptyMsg) emptyMsg.hidden = true;
    announceStatus(filteredItems.length + ' clipart' + (filteredItems.length === 1 ? '' : 's') + ' gevonden');

    /* Bepaal COLS dynamisch op basis van modalbreedte */
    var modalWidth = modal.querySelector('.clipart-modal-content').offsetWidth;
    if (modalWidth < 400) COLS = 2;
    else if (modalWidth < 600) COLS = 3;
    else COLS = 4;

    /* Bouw grid: rows en cellen */
    var rowEl = null;
    filteredItems.forEach(function (item, idx) {
      if (idx % COLS === 0) {
        rowEl = document.createElement('div');
        rowEl.setAttribute('role', 'row');
        gridEl.appendChild(rowEl);
      }

      var cell = document.createElement('div');
      cell.setAttribute('role', 'gridcell');

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'clipart-cell';
      btn.setAttribute('tabindex', idx === focusedIndex ? '0' : '-1');
      btn.setAttribute('aria-label', item.label + ' \u2014 ' + capitalize(item.category));
      btn.setAttribute('data-clipart-idx', idx);
      btn.innerHTML = item.svg;
      /* SVG is decoratief — aria-label op de knop beschrijft het item volledig */
      var svgEl = btn.querySelector('svg');
      if (svgEl) svgEl.setAttribute('aria-hidden', 'true');

      btn.addEventListener('click', function () {
        selectClipart(idx);
      });

      cell.appendChild(btn);
      rowEl.appendChild(cell);
    });

    /* Zorg dat focusedIndex geldig blijft */
    if (focusedIndex >= filteredItems.length) focusedIndex = 0;
    updateFocusedCell();
  }

  function filterGrid() {
    focusedIndex = 0;
    renderGrid();
  }

  function setCategory(cat) {
    activeCategory = cat;
    modal.querySelectorAll('[data-category]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-category') === cat ? 'true' : 'false');
    });
    focusedIndex = 0;
    renderGrid();
  }

  /* --- Grid-navigatie (roving tabindex) ---------------------------------- */

  function updateFocusedCell() {
    var cells = gridEl.querySelectorAll('.clipart-cell');
    cells.forEach(function (cell, i) {
      cell.setAttribute('tabindex', i === focusedIndex ? '0' : '-1');
    });
  }

  function focusCell(idx) {
    if (idx < 0 || idx >= filteredItems.length) return;
    focusedIndex = idx;
    updateFocusedCell();
    var cells = gridEl.querySelectorAll('.clipart-cell');
    if (cells[focusedIndex]) cells[focusedIndex].focus();
  }

  function handleGridKeydown(e) {
    var total = filteredItems.length;
    if (total === 0) return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        focusCell((focusedIndex + 1) % total);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusCell((focusedIndex - 1 + total) % total);
        break;
      case 'ArrowDown':
        e.preventDefault();
        focusCell(Math.min(focusedIndex + COLS, total - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusCell(Math.max(focusedIndex - COLS, 0));
        break;
      case 'Home':
        e.preventDefault();
        focusCell(Math.floor(focusedIndex / COLS) * COLS);
        break;
      case 'End':
        e.preventDefault();
        focusCell(Math.min(Math.floor(focusedIndex / COLS) * COLS + COLS - 1, total - 1));
        break;
    }
  }

  /* --- Keyboard-navigatie (grid + tablist) --------------------------------- */

  function handleModalNavKeydown(e) {
    /* Pijltjestoets-navigatie in bibliotheek-grid */
    if (document.activeElement && document.activeElement.classList.contains('clipart-cell')) {
      if (['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].indexOf(e.key) !== -1) {
        handleGridKeydown(e);
        return;
      }
    }

    /* Pijltjestoets-navigatie in tablist (cyclisch door 3 tabs) */
    if (document.activeElement && document.activeElement.getAttribute('role') === 'tab') {
      var tabOrder = ['library', 'online', 'upload'];
      var curIdx   = tabOrder.indexOf(activeTab);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        var nextIdx = (curIdx + 1) % tabOrder.length;
        switchClipartTab(tabOrder[nextIdx]);
        var newTab = modal.querySelector('[role="tab"][aria-selected="true"]');
        if (newTab) newTab.focus();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        var prevIdx = (curIdx - 1 + tabOrder.length) % tabOrder.length;
        switchClipartTab(tabOrder[prevIdx]);
        var newTab2 = modal.querySelector('[role="tab"][aria-selected="true"]');
        if (newTab2) newTab2.focus();
        return;
      }
    }
  }

  /* --- Clipart selecteren ------------------------------------------------- */

  function selectClipart(idx) {
    var item = filteredItems[idx];
    if (!item) return;

    /* Sluit modal pas nadat het SVG geladen is — anders flikkeren de vorige
       eigenschappen nog even door omdat de selectie nog niet is bijgewerkt. */
    KaartCanvas.addImage(item.svg, function () {
      announceStatus('Clipart \u201c' + item.label + '\u201d toegevoegd');
      close();
    }, { kaartLabel: item.label });
  }

  /* --- Open / sluit ------------------------------------------------------- */

  function open() {
    openerBtn = document.activeElement;
    focusedIndex = 0;
    if (searchEl) searchEl.value = '';
    modal.hidden = false;

    /* Start altijd op de bibliotheek-tab */
    activeTab = '';          /* wis guard zodat switchClipartTab niet short-circuit */
    switchClipartTab('library');

    /* Defer naar na de browser-layoutpas: offsetWidth is 0 zolang modal hidden is.
       setCategory roept intern renderGrid() aan — dat moet ná de layout plaatsvinden
       zodat COLS correct bepaald wordt op basis van de werkelijke modalbreedte. */
    requestAnimationFrame(function () {
      setCategory('alle');
      if (searchEl) searchEl.focus();
    });
  }

  function close() {
    modal.hidden = true;
    if (openerBtn && typeof openerBtn.focus === 'function') {
      openerBtn.focus();
    }
  }

  /* --- Hulpfunctie -------------------------------------------------------- */

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* --- Init --------------------------------------------------------------- */

  function init() {
    buildModal();
  }

  function openUploadTab() {
    openerBtn = document.activeElement;
    focusedIndex = 0;
    if (searchEl) searchEl.value = '';
    modal.hidden = false;

    activeTab = '';
    switchClipartTab('upload');
  }

  return {
    init:          init,
    open:          open,
    openUploadTab: openUploadTab,
    close:         close
  };

})();
