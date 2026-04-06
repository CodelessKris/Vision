/* =============================================================================
   templates.js — Voorgedefinieerde kaartsjablonen als startpunt
   Kaarteditor | Sprint 6

   Elke template bevat een .kaart-compatibele JSON-structuur met Fabric.js
   canvas-objecten. Thumbnails zijn inline SVG's. Geen externe bestanden.
   ============================================================================= */

var KaartTemplates = (function () {
  'use strict';

  /* Referentie-canvasafmetingen waarop templates zijn gebaseerd.
     loadState() + resizeCanvas() schaalt automatisch mee naar werkelijke grootte. */
  var REF_W = 420;
  var REF_H = 596;

  /* --- Hulpfuncties voor Fabric.js JSON objecten --------------------------- */

  function textObj(text, opts) {
    var defaults = {
      type:        'textbox',
      version:     '5.3.0',
      originX:     'center',
      originY:     'center',
      left:        REF_W / 2,
      top:         REF_H / 2,
      width:       Math.floor(REF_W * 0.8),
      height:      50,
      fill:        '#333333',
      stroke:      null,
      strokeWidth: 1,
      strokeDashArray:    null,
      strokeLineCap:      'butt',
      strokeDashOffset:   0,
      strokeLineJoin:     'miter',
      strokeUniform:      false,
      strokeMiterLimit:   4,
      scaleX:      1,
      scaleY:      1,
      angle:       0,
      flipX:       false,
      flipY:       false,
      opacity:     1,
      shadow:      null,
      visible:     true,
      backgroundColor: '',
      fillRule:    'nonzero',
      paintFirst:  'fill',
      globalCompositeOperation: 'source-over',
      skewX:       0,
      skewY:       0,
      fontFamily:  'Atkinson Hyperlegible',
      fontSize:    36,
      fontWeight:  'normal',
      fontStyle:   'normal',
      textAlign:   'center',
      underline:   false,
      overline:    false,
      linethrough: false,
      textBackgroundColor: '',
      charSpacing: 0,
      lineHeight:  1.16,
      direction:   'ltr',
      minWidth:    20,
      splitByGrapheme: false,
      styles:      {},
      path:        null,
      pathStartOffset: 0,
      pathSide:    'left',
      pathAlign:   'baseline',
      text:        text,
      kaartLabel:  '',
      kaartAssetId: ''
    };
    return Object.assign({}, defaults, opts || {});
  }

  function canvasJson(objects) {
    return {
      version: '5.3.0',
      objects: objects || []
    };
  }

  /* --- Template-definities ------------------------------------------------- */

  var TEMPLATE_DATA = [
    {
      id: 'verjaardag-klassiek',
      name: 'Verjaardag klassiek',
      category: 'Verjaardag',
      description: 'Warme verjaardagskaart met elegant lettertype',
      thumbnail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148 210"><rect width="148" height="210" rx="4" fill="#fff3e0"/><rect x="20" y="30" width="108" height="16" rx="2" fill="#e65100" opacity="0.7"/><rect x="30" y="60" width="88" height="10" rx="2" fill="#bf360c" opacity="0.5"/><circle cx="74" cy="130" r="30" fill="#ff9800" opacity="0.3"/><rect x="44" y="120" width="60" height="8" rx="1" fill="#e65100" opacity="0.4"/></svg>',
      kaartData: {
        version: '1.0',
        appName: 'Kaarteditor',
        format: 'A5-dubbel',
        title: 'Verjaardag klassiek',
        created: null,
        modified: null,
        front: {
          background: '#fff3e0',
          canvas: canvasJson([
            textObj('Gefeliciteerd!', {
              top: 120,
              fontSize: 52,
              fontFamily: 'Pacifico',
              fill: '#e65100'
            }),
            textObj('met je verjaardag', {
              top: 200,
              fontSize: 24,
              fontFamily: 'Caveat',
              fill: '#bf360c'
            })
          ])
        },
        inside: {
          background: '#fffde7',
          canvas: canvasJson([
            textObj('Van harte\ngefeliciteerd!', {
              top: REF_H / 2 - 40,
              fontSize: 32,
              fontFamily: 'Caveat',
              fill: '#5d4037'
            }),
            textObj('Een hele fijne dag gewenst.', {
              top: REF_H / 2 + 60,
              fontSize: 20,
              fontFamily: 'Atkinson Hyperlegible',
              fill: '#795548'
            })
          ])
        },
        embeddedAssets: {}
      }
    },
    {
      id: 'beterschap',
      name: 'Beterschap',
      category: 'Beterschap',
      description: 'Zachte kaart om beterschap te wensen',
      thumbnail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148 210"><rect width="148" height="210" rx="4" fill="#e8f5e9"/><rect x="15" y="40" width="118" height="14" rx="2" fill="#2e7d32" opacity="0.6"/><rect x="30" y="68" width="88" height="10" rx="2" fill="#388e3c" opacity="0.4"/><ellipse cx="74" cy="140" rx="20" ry="22" fill="#66bb6a" opacity="0.3"/><ellipse cx="74" cy="130" rx="12" ry="14" fill="#43a047" opacity="0.25"/></svg>',
      kaartData: {
        version: '1.0',
        appName: 'Kaarteditor',
        format: 'A5-dubbel',
        title: 'Beterschap',
        created: null,
        modified: null,
        front: {
          background: '#e8f5e9',
          canvas: canvasJson([
            textObj('Beterschap!', {
              top: 120,
              fontSize: 48,
              fontFamily: 'Dancing Script',
              fill: '#2e7d32'
            }),
            textObj('we denken aan je', {
              top: 195,
              fontSize: 22,
              fontFamily: 'Patrick Hand',
              fill: '#388e3c'
            })
          ])
        },
        inside: {
          background: '#f1f8e9',
          canvas: canvasJson([
            textObj('Word snel beter!', {
              top: REF_H / 2 - 30,
              fontSize: 30,
              fontFamily: 'Patrick Hand',
              fill: '#33691e'
            }),
            textObj('We wensen je veel sterkte\nen een voorspoedig herstel.', {
              top: REF_H / 2 + 60,
              fontSize: 18,
              fontFamily: 'Atkinson Hyperlegible',
              fill: '#558b2f'
            })
          ])
        },
        embeddedAssets: {}
      }
    },
    {
      id: 'bedankt',
      name: 'Bedankt',
      category: 'Bedankje',
      description: 'Hartelijk bedankkaartje in warme tinten',
      thumbnail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148 210"><rect width="148" height="210" rx="4" fill="#fce4ec"/><rect x="20" y="45" width="108" height="16" rx="2" fill="#c62828" opacity="0.6"/><rect x="35" y="75" width="78" height="10" rx="2" fill="#d32f2f" opacity="0.4"/><path d="M74 130 L60 144 Q52 132 60 126 Q66 122 74 130 Q82 122 88 126 Q96 132 88 144Z" fill="#e57373" opacity="0.5"/></svg>',
      kaartData: {
        version: '1.0',
        appName: 'Kaarteditor',
        format: 'A5-dubbel',
        title: 'Bedankt',
        created: null,
        modified: null,
        front: {
          background: '#fce4ec',
          canvas: canvasJson([
            textObj('Bedankt!', {
              top: 130,
              fontSize: 56,
              fontFamily: 'Lobster',
              fill: '#c62828'
            }),
            textObj('voor alles', {
              top: 210,
              fontSize: 24,
              fontFamily: 'Satisfy',
              fill: '#d32f2f'
            })
          ])
        },
        inside: {
          background: '#fff8e1',
          canvas: canvasJson([
            textObj('Dank je wel!', {
              top: REF_H / 2 - 30,
              fontSize: 34,
              fontFamily: 'Satisfy',
              fill: '#bf360c'
            }),
            textObj('Jouw vriendelijkheid\nbetekent veel voor mij.', {
              top: REF_H / 2 + 60,
              fontSize: 18,
              fontFamily: 'Atkinson Hyperlegible',
              fill: '#6d4c41'
            })
          ])
        },
        embeddedAssets: {}
      }
    },
    {
      id: 'succes',
      name: 'Succes',
      category: 'Succes',
      description: 'Stoere succeskaart met krachtig lettertype',
      thumbnail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148 210"><rect width="148" height="210" rx="4" fill="#e3f2fd"/><rect x="18" y="40" width="112" height="18" rx="2" fill="#1565c0" opacity="0.7"/><rect x="30" y="72" width="88" height="10" rx="2" fill="#1976d2" opacity="0.4"/><polygon points="74,115 78,128 92,128 80,136 84,150 74,142 64,150 68,136 56,128 70,128" fill="#42a5f5" opacity="0.4"/></svg>',
      kaartData: {
        version: '1.0',
        appName: 'Kaarteditor',
        format: 'A5-dubbel',
        title: 'Succes',
        created: null,
        modified: null,
        front: {
          background: '#e3f2fd',
          canvas: canvasJson([
            textObj('SUCCES!', {
              top: 120,
              fontSize: 54,
              fontFamily: 'Permanent Marker',
              fill: '#1565c0'
            }),
            textObj('je kunt het!', {
              top: 200,
              fontSize: 26,
              fontFamily: 'Caveat',
              fill: '#1976d2'
            })
          ])
        },
        inside: {
          background: '#e8eaf6',
          canvas: canvasJson([
            textObj('Heel veel succes!', {
              top: REF_H / 2 - 30,
              fontSize: 30,
              fontFamily: 'Caveat',
              fill: '#283593'
            }),
            textObj('Ik geloof in je.\nJe gaat het geweldig doen!', {
              top: REF_H / 2 + 60,
              fontSize: 18,
              fontFamily: 'Atkinson Hyperlegible',
              fill: '#3949ab'
            })
          ])
        },
        embeddedAssets: {}
      }
    },
    {
      id: 'feest',
      name: 'Feest',
      category: 'Uitnodiging',
      description: 'Feestelijke uitnodiging in paars en goud',
      thumbnail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148 210"><rect width="148" height="210" rx="4" fill="#f3e5f5"/><rect x="20" y="40" width="108" height="18" rx="2" fill="#6a1b9a" opacity="0.7"/><rect x="30" y="72" width="88" height="10" rx="2" fill="#7b1fa2" opacity="0.4"/><rect x="30" y="120" width="10" height="10" rx="1" fill="#ab47bc" opacity="0.35" transform="rotate(25 35 125)"/><circle cx="74" cy="135" r="5" fill="#ce93d8" opacity="0.4"/><rect x="100" y="115" width="8" height="8" rx="1" fill="#ba68c8" opacity="0.3" transform="rotate(-15 104 119)"/><circle cx="50" cy="150" r="4" fill="#ab47bc" opacity="0.3"/></svg>',
      kaartData: {
        version: '1.0',
        appName: 'Kaarteditor',
        format: 'A5-dubbel',
        title: 'Feest',
        created: null,
        modified: null,
        front: {
          background: '#f3e5f5',
          canvas: canvasJson([
            textObj('FEEST!', {
              top: 120,
              fontSize: 58,
              fontFamily: 'Pacifico',
              fill: '#6a1b9a'
            }),
            textObj('je bent uitgenodigd', {
              top: 205,
              fontSize: 22,
              fontFamily: 'Dancing Script',
              fill: '#7b1fa2'
            })
          ])
        },
        inside: {
          background: '#fce4ec',
          canvas: canvasJson([
            textObj('Je bent uitgenodigd!', {
              top: REF_H / 2 - 60,
              fontSize: 28,
              fontFamily: 'Dancing Script',
              fill: '#880e4f'
            }),
            textObj('Datum: ...\nTijd: ...\nLocatie: ...', {
              top: REF_H / 2 + 30,
              fontSize: 20,
              fontFamily: 'Atkinson Hyperlegible',
              fill: '#4a148c',
              textAlign: 'left'
            }),
            textObj('We hopen je te zien!', {
              top: REF_H / 2 + 140,
              fontSize: 20,
              fontFamily: 'Caveat',
              fill: '#7b1fa2'
            })
          ])
        },
        embeddedAssets: {}
      }
    },
    {
      id: 'liefde',
      name: 'Liefde',
      category: 'Valentijn',
      description: 'Romantische kaart met sierlijk lettertype',
      thumbnail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148 210"><rect width="148" height="210" rx="4" fill="#ffebee"/><rect x="15" y="45" width="118" height="14" rx="2" fill="#b71c1c" opacity="0.6"/><rect x="30" y="73" width="88" height="10" rx="2" fill="#c62828" opacity="0.4"/><path d="M74 120 L54 140 Q42 124 54 116 Q64 110 74 120 Q84 110 94 116 Q106 124 94 140Z" fill="#ef5350" opacity="0.45"/></svg>',
      kaartData: {
        version: '1.0',
        appName: 'Kaarteditor',
        format: 'A5-dubbel',
        title: 'Liefde',
        created: null,
        modified: null,
        front: {
          background: '#ffebee',
          canvas: canvasJson([
            textObj('Ik hou van jou', {
              top: 130,
              fontSize: 44,
              fontFamily: 'Satisfy',
              fill: '#b71c1c'
            }),
            textObj('voor altijd', {
              top: 210,
              fontSize: 26,
              fontFamily: 'Lobster',
              fill: '#c62828'
            })
          ])
        },
        inside: {
          background: '#fce4ec',
          canvas: canvasJson([
            textObj('Lieve schat,', {
              top: REF_H / 2 - 60,
              fontSize: 30,
              fontFamily: 'Satisfy',
              fill: '#880e4f'
            }),
            textObj('Elke dag met jou\nis een cadeau.', {
              top: REF_H / 2 + 20,
              fontSize: 22,
              fontFamily: 'Dancing Script',
              fill: '#ad1457'
            }),
            textObj('Voor altijd de jouwe', {
              top: REF_H / 2 + 120,
              fontSize: 20,
              fontFamily: 'Lobster',
              fill: '#c62828'
            })
          ])
        },
        embeddedAssets: {}
      }
    }
  ];

  /* --- Grid renderen (index.html) ------------------------------------------ */

  function renderGrid() {
    var container = document.getElementById('template-grid');
    if (!container) return;

    TEMPLATE_DATA.forEach(function (tpl) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn template-card';
      btn.setAttribute('aria-label', 'Sjabloon openen: ' + tpl.name + ' (' + tpl.category + ')');

      var thumbDiv = document.createElement('div');
      thumbDiv.className = 'template-card-thumb';
      thumbDiv.innerHTML = tpl.thumbnail;
      thumbDiv.setAttribute('aria-hidden', 'true');

      var nameSpan = document.createElement('span');
      nameSpan.className = 'template-card-name';
      nameSpan.textContent = tpl.name;

      var catSpan = document.createElement('span');
      catSpan.className = 'template-card-category';
      catSpan.textContent = tpl.category;

      btn.appendChild(thumbDiv);
      btn.appendChild(nameSpan);
      btn.appendChild(catSpan);

      btn.addEventListener('click', function () {
        openTemplate(tpl);
      });

      container.appendChild(btn);
    });
  }

  function openTemplate(tpl) {
    /* Deep clone zodat de constante niet gemuteerd wordt */
    var data = JSON.parse(JSON.stringify(tpl.kaartData));
    /* Wis timestamps zodat de kaart een vers tijdstip krijgt in de editor */
    data.created  = null;
    data.modified = null;

    /* Gebruik bestaand sessionStorage bridge (KaartStorage.storeAndNavigate) */
    if (typeof KaartStorage !== 'undefined' && KaartStorage.storeAndNavigate) {
      KaartStorage.storeAndNavigate(JSON.stringify(data));
    } else {
      /* Fallback: direct navigeren */
      sessionStorage.setItem('kaarteditor-pending-open', JSON.stringify(data));
      window.location.href = 'editor.html';
    }
  }

  /* --- Publieke API -------------------------------------------------------- */

  return {
    getAll:     function () { return TEMPLATE_DATA; },
    renderGrid: renderGrid
  };

})();
