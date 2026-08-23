/* =========================================================
   EURO STORM DÉBOSSELAGE — JS
   - Mobile menu toggle
   - Franchise calculator
   - Smooth scroll for hash links
   - Sticky CTA visibility
   ========================================================= */

(() => {
  'use strict';

  /* ---------- Mobile menu ---------- */
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.getElementById('mobile-menu');
  const navEl = document.querySelector('.nav');

  const setNavHeightVar = () => {
    if (navEl) {
      document.documentElement.style.setProperty('--nav-h', navEl.offsetHeight + 'px');
    }
  };
  setNavHeightVar();
  window.addEventListener('resize', setNavHeightVar);

  const closeMenu = () => {
    if (!burger || !mobileMenu) return;
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('hidden', '');
    document.body.classList.remove('menu-open');
  };

  const openMenu = () => {
    if (!burger || !mobileMenu) return;
    setNavHeightVar();
    burger.setAttribute('aria-expanded', 'true');
    mobileMenu.removeAttribute('hidden');
    document.body.classList.add('menu-open');
  };

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      open ? closeMenu() : openMenu();
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    /* Close on scroll outside the menu (page scroll) */
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      if (burger.getAttribute('aria-expanded') === 'true') {
        const dy = Math.abs(window.scrollY - lastY);
        if (dy > 8) closeMenu();
      }
      lastY = window.scrollY;
    }, { passive: true });

    /* Close on Esc */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        burger.focus();
      }
    });

    /* Close when resizing to desktop */
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) closeMenu();
    });
  }

  /* ---------- Franchise calculator ----------
     Règles métier :
     - Devis < 500€        → l'offre ne s'applique pas
     - Devis 500€ – 1999€  → réduction = 10% du devis
     - Devis ≥ 2000€       → réduction = 250€ (garantie)
     - Vous payez = max(0, franchise - réduction)
  */
  const VOUCHER_MAX = 250;
  const VOUCHER_THRESHOLD = 2000;
  const DEVIS_MIN = 500;
  const VOUCHER_RATE = 0.10;

  const devisInput = document.getElementById('devis');
  const calcInput = document.getElementById('franchise');
  const calcSavings = document.getElementById('calcSavings');
  const calcPay = document.getElementById('calcPay');
  const calcRule = document.getElementById('calcRule');
  const calcForm = document.getElementById('calcForm');
  const calcResult = document.querySelector('.calc__result');

  const fmt = (n) => `${Math.max(0, Math.round(n)).toLocaleString('fr-FR')}€`;

  const updateCalc = () => {
    if (!calcInput || !devisInput) return;

    const devisRaw = parseFloat(devisInput.value);
    const franchiseRaw = parseFloat(calcInput.value);
    const devis = isNaN(devisRaw) ? 0 : Math.max(0, devisRaw);
    const franchise = isNaN(franchiseRaw) ? 0 : Math.max(0, franchiseRaw);

    let reduction = 0;
    let ruleText = '';
    let alert = false;

    if (devis < DEVIS_MIN) {
      reduction = 0;
      ruleText = `Devis minimum requis : ${DEVIS_MIN}€`;
      alert = true;
    } else if (devis >= VOUCHER_THRESHOLD) {
      reduction = VOUCHER_MAX;
      ruleText = `Devis ≥ 2 000€ · réduction de 250€ garantie`;
    } else {
      reduction = Math.round(devis * VOUCHER_RATE);
      ruleText = `Devis < 2 000€ · réduction de 10% (${fmt(reduction)})`;
    }

    const pay = Math.max(0, franchise - reduction);

    if (calcSavings) calcSavings.textContent = fmt(reduction);
    if (calcPay) calcPay.textContent = pay === 0 ? '0€' : fmt(pay);
    if (calcRule) calcRule.textContent = ruleText;
    if (calcResult) calcResult.classList.toggle('calc__result--alert', alert);
  };

  if (devisInput) {
    devisInput.addEventListener('input', updateCalc);
    devisInput.addEventListener('change', updateCalc);
  }
  if (calcInput) {
    calcInput.addEventListener('input', updateCalc);
    calcInput.addEventListener('change', updateCalc);
  }
  updateCalc();

  if (calcForm) {
    calcForm.addEventListener('submit', (e) => {
      e.preventDefault();
      updateCalc();
      const target = document.getElementById('FORMULAIRE_AGENDA_GHL');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ---------- Smooth scroll offset for sticky nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      const navH = document.querySelector('.nav')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });

      if (history.pushState) history.pushState(null, '', href);
    });
  });

  /* ---------- Sticky CTA: hide near final CTA ---------- */
  const stickyCta = document.querySelector('.sticky-cta');
  const finalSection = document.getElementById('FORMULAIRE_AGENDA_GHL');

  if (stickyCta && finalSection && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        stickyCta.style.opacity = entry.isIntersecting ? '0' : '1';
        stickyCta.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
        stickyCta.style.transform = entry.isIntersecting ? 'translateY(20px)' : 'translateY(0)';
      });
    }, { threshold: 0.25 });
    io.observe(finalSection);
  }

  if (stickyCta) {
    stickyCta.style.transition = 'opacity .25s ease, transform .25s ease';
  }

  /* ---------- FAQ: only one open at a time (optional, smoother UX) ---------- */
  const faqs = document.querySelectorAll('.faq__item');
  faqs.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqs.forEach(other => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* =========================================================
     LOCATOR : géolocalisation → CEP → manuel
     Configuration des centres dans `centers.js` (window.EURO_STORM_CENTERS)
     ========================================================= */

  const CENTERS = (window.EURO_STORM_CENTERS || []).filter(c => c && c.active);
  const POSTAL_API = 'https://api-adresse.data.gouv.fr/search/';

  /* ---------- DOM refs ---------- */
  const locator       = document.getElementById('locator');
  const locatorReco   = document.getElementById('locatorReco');
  const locatorAll    = document.getElementById('locatorAll');
  const postalForm    = document.getElementById('postalForm');
  const postalInput   = document.getElementById('postalInput');
  const postalError   = document.getElementById('postalError');
  const errorTitle    = document.getElementById('locatorErrorTitle');
  const errorMsg      = document.getElementById('locatorErrorMsg');

  /* ---------- Utilities ---------- */

  // Distance Haversine en km
  const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Centre actif le plus proche d'un point (lat,lng)
  const findNearestCenter = (lat, lng) => {
    if (!CENTERS.length) return null;
    let best = null;
    let bestDist = Infinity;
    for (const c of CENTERS) {
      const d = haversine(lat, lng, c.coordinates.lat, c.coordinates.lng);
      if (d < bestDist) { bestDist = d; best = c; }
    }
    return best ? { center: best, distanceKm: bestDist } : null;
  };

  // Format distance en km/m
  const fmtDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    if (km < 10) return `${km.toFixed(1)} km`;
    return `${Math.round(km)} km`;
  };

  /* ---------- State machine ---------- */

  const STATES = ['intro','geolocating','postal','postal_loading','recommendation','manual','error'];

  const setState = (state) => {
    if (!locator) return;
    if (!STATES.includes(state)) state = 'intro';
    locator.setAttribute('data-state', state);
    locator.querySelectorAll('.locator__panel').forEach(panel => {
      const ps = panel.getAttribute('data-state');
      if (ps === state) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  };

  /* ---------- Card rendering ---------- */

  const renderLocationCard = (center, opts = {}) => {
    const { distanceKm = null, recommended = false } = opts;
    const mapsLink = center.mapsLink ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.address + ' ' + center.postalCode + ' ' + center.city)}`;

    return `
      <article class="location" data-loc="${center.id}">
        ${distanceKm !== null ? `<span class="location__distance" aria-label="Distance">${fmtDistance(distanceKm)}</span>` : ''}
        <div class="location__top">
          <div class="location__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div class="location__head">
            <p class="location__brand">${center.brand}</p>
            <h3 class="location__name">${center.name}</h3>
          </div>
        </div>
        <address class="location__address">
          ${center.address}<br>
          ${center.postalCode} ${center.city}, France
        </address>
        <a href="${mapsLink}" target="_blank" rel="noopener" class="location__map">
          <span aria-hidden="true">📍</span> Voir l'itinéraire
          <span class="location__map-arrow" aria-hidden="true">↗</span>
        </a>
        <button type="button" class="btn btn--cta btn--lg btn--block location__cta" data-open-modal data-loc="${center.id}">
          ${recommended ? 'Réserver maintenant' : `Réserver à ${center.city}`} <span aria-hidden="true">→</span>
        </button>
        <p class="location__assurance">
          <span class="check" aria-hidden="true">✓</span>
          Confirmation immédiate par SMS
        </p>
      </article>
    `;
  };

  // Bind les boutons "Réserver" générés dynamiquement
  const bindReserveButtons = (root) => {
    root.querySelectorAll('[data-open-modal]').forEach(btn => {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openCalendarModal(btn.dataset.loc);
      });
    });
  };

  const showRecommendation = (center, distanceKm) => {
    if (!locatorReco) return;
    locatorReco.innerHTML = renderLocationCard(center, { distanceKm, recommended: true });
    bindReserveButtons(locatorReco);
    setState('recommendation');
  };

  const showManualList = () => {
    if (!locatorAll) return;
    locatorAll.innerHTML = CENTERS.map(c => renderLocationCard(c)).join('');
    bindReserveButtons(locatorAll);
    setState('manual');
  };

  /* ---------- Geolocation ---------- */

  const handleGeolocation = () => {
    if (!('geolocation' in navigator)) {
      showError('Géolocalisation non disponible', 'Votre navigateur ne prend pas en charge la géolocalisation.');
      return;
    }
    setState('geolocating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const result = findNearestCenter(pos.coords.latitude, pos.coords.longitude);
        if (!result) {
          showError('Aucun atelier disponible', 'Aucun centre actif n\'a été trouvé.');
          return;
        }
        showRecommendation(result.center, result.distanceKm);
      },
      (err) => {
        // 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
        if (err.code === 1) {
          // user a refusé → on bascule directement sur le code postal
          setState('postal');
        } else {
          showError('Localisation indisponible', 'Saisissez votre code postal pour continuer.');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  /* ---------- Postal code lookup ---------- */

  const handlePostalSubmit = async (e) => {
    e.preventDefault();
    if (!postalInput) return;
    const value = postalInput.value.trim();

    if (!/^\d{5}$/.test(value)) {
      showPostalError('Veuillez saisir un code postal valide (5 chiffres).');
      return;
    }
    showPostalError(null);
    setState('postal_loading');

    try {
      const url = `${POSTAL_API}?q=${encodeURIComponent(value)}&type=municipality&limit=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('http');
      const data = await res.json();

      if (!data.features || !data.features.length) {
        setState('postal');
        showPostalError('Code postal introuvable. Vérifiez votre saisie.');
        return;
      }
      const [lng, lat] = data.features[0].geometry.coordinates;
      const result = findNearestCenter(lat, lng);
      if (!result) {
        showError('Aucun atelier disponible', 'Aucun centre actif n\'a été trouvé.');
        return;
      }
      showRecommendation(result.center, result.distanceKm);

    } catch (err) {
      setState('postal');
      showPostalError('Erreur de connexion. Réessayez ou choisissez un atelier manuellement.');
    }
  };

  const showPostalError = (msg) => {
    if (!postalError) return;
    if (msg) {
      postalError.textContent = msg;
      postalError.removeAttribute('hidden');
    } else {
      postalError.setAttribute('hidden', '');
      postalError.textContent = '';
    }
  };

  const showError = (title, msg) => {
    if (errorTitle) errorTitle.textContent = title;
    if (errorMsg) errorMsg.textContent = msg;
    setState('error');
  };

  /* ---------- Action dispatcher ---------- */

  const handleAction = (action) => {
    switch (action) {
      case 'geo':     handleGeolocation(); break;
      case 'postal':  setState('postal'); setTimeout(() => postalInput?.focus(), 100); break;
      case 'manual':  showManualList(); break;
      case 'back':    setState('intro'); break;
      case 'reset':   setState('intro'); break;
      default: setState('intro');
    }
  };

  /* ---------- Bind locator events ---------- */

  if (locator) {
    locator.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      e.preventDefault();
      handleAction(btn.dataset.action);
    });
  }

  if (postalForm) {
    postalForm.addEventListener('submit', handlePostalSubmit);
  }

  // Si un seul centre actif → pas de choix, ouverture directe possible
  if (CENTERS.length === 1) {
    // Affiche directement la recommandation pour le centre unique
    const c = CENTERS[0];
    if (locatorReco) {
      locatorReco.innerHTML = renderLocationCard(c, { recommended: true });
      bindReserveButtons(locatorReco);
    }
    showRecommendation(c, null);
  } else if (CENTERS.length > 1) {
    // Par défaut : afficher directement la liste des ateliers (moins de clics
    // pour réserver). La géolocalisation reste accessible en un clic.
    showManualList();
  }

  /* =========================================================
     CALENDAR MODAL
     ========================================================= */

  const lmodal      = document.getElementById('locationModal');
  const lmodalTitle = document.getElementById('lmodalTitle');
  const lmodalAddr  = document.getElementById('lmodalAddr');
  const lmodalBody  = document.getElementById('lmodalBody');
  let lastFocused   = null;

  const openCalendarModal = (locId) => {
    const center = CENTERS.find(c => c.id === locId);
    if (!center || !lmodal) return;

    lastFocused = document.activeElement;
    lmodalTitle.textContent = `${center.name} — ${center.brand}`;
    lmodalAddr.textContent  = `${center.address}, ${center.postalCode} ${center.city}`;

    const url = center.calendar || '';
    const isPlaceholder = !url || url.includes('{{');

    if (isPlaceholder) {
      lmodalBody.innerHTML = `
        <div class="lmodal__placeholder">
          <strong>Calendrier non configuré pour ${center.city}.</strong><br>
          Remplacez la valeur <code>calendar</code> du centre <code>${center.id}</code> dans <code>centers.js</code> par l'URL du calendrier GHL.<br><br>
          <code>${url || '(vide)'}</code>
        </div>`;
    } else {
      lmodalBody.innerHTML = `
        <iframe
          src="${url}"
          title="Réservation diagnostic ${center.name}"
          loading="lazy"
          allow="payment"
        ></iframe>`;
    }

    lmodal.removeAttribute('hidden');
    document.body.classList.add('lmodal-open');

    setTimeout(() => {
      const closeBtn = lmodal.querySelector('.lmodal__close');
      if (closeBtn) closeBtn.focus();
    }, 200);
  };

  const closeCalendarModal = () => {
    if (!lmodal) return;
    lmodal.setAttribute('hidden', '');
    lmodalBody.innerHTML = '';
    document.body.classList.remove('lmodal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  };

  if (lmodal) {
    lmodal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close]')) closeCalendarModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !lmodal.hasAttribute('hidden')) closeCalendarModal();
    });
  }

})();
