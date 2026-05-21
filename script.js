'use strict';

/* ── EMAIL HELPER ─────────────────────────────────────────────────────────
 * Assembles the support address at runtime so the string never appears in
 * minified/bundled source where a bot regex could scrape it.
 * Parts are stored separately and joined only when needed.
 */
function _gContact() {
  var _a = ['orientartgallery', 'za', '@', 'gmail', '.com'];
  return _a.join('');
}




const CONFIG = {

  API_BASE_URL: 'https://orientartgallery.pythonanywhere.com', 

  MIN_MESSAGE_LENGTH: 30,

 
  SPAM_MIN_ELAPSED_MS: 4000,

  /** Selector used to find all elements that trigger cursor hover effect. */
  HOVERABLE_SELECTOR: 'a, button, .col-card, .product-card, .testi-card, .install-item, .consult-card, .framing-feat, .about-val, .process-step, .nav-links a',
};


const PAGE_LOAD_TIME = Date.now();


const DOM = {
  loader:       document.getElementById('loader'),
  cursorDot:    document.getElementById('cursor-dot'),
  cursorRing:   document.getElementById('cursor-ring'),
  scrollBar:    document.getElementById('scroll-bar'),
  navbar:       document.getElementById('navbar'),
  hamburger:    document.getElementById('hamburger'),
  mobileNav:    document.getElementById('mobile-nav'),
  mobOverlay:   document.getElementById('mob-overlay'),
  orderForm:    document.getElementById('order-form'),
  submitBtn:    document.getElementById('submit-btn'),
  btnText:      document.getElementById('btn-text'),
  btnLoading:   document.getElementById('btn-loading'),
  formSuccess:  document.getElementById('form-success'),
  formError:    document.getElementById('form-error'),
  formErrorMsg: document.getElementById('form-error-msg'),
  formWrapper:  document.getElementById('form-wrapper'),
  uploadArea:   document.getElementById('upload-area'),
  uploadChosen: document.getElementById('upload-chosen'),
  attachment:   document.getElementById('attachment'),
  yearEl:       document.getElementById('year'),
  heroCanvas:   document.getElementById('hero-canvas'),
};


(function initLoader() {
  if (!DOM.loader) return;

  const MIN_DISPLAY_MS = 2800;
  const start = Date.now();

  function hideLoader() {
    const elapsed = Date.now() - start;
    const delay   = Math.max(0, MIN_DISPLAY_MS - elapsed);
    setTimeout(() => {
      DOM.loader.classList.add('hidden');
      DOM.loader.addEventListener('transitionend', () => {
        DOM.loader.setAttribute('aria-hidden', 'true');
      }, { once: true });
    }, delay);
  }

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
  }
})();


(function initCursor() {
  if (!DOM.cursorDot || !DOM.cursorRing) return;

  /* Check for genuine pointer device */
  const isPointerFine = window.matchMedia('(pointer: fine)').matches;
  if (!isPointerFine) return;

  DOM.cursorDot.style.display  = 'block';
  DOM.cursorRing.style.display = 'block';

  let mouseX = -100, mouseY = -100;
  let ringX   = -100, ringY  = -100;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;

    DOM.cursorDot.style.left  = `${mouseX}px`;
    DOM.cursorDot.style.top   = `${mouseY}px`;
    DOM.cursorRing.style.left = `${ringX}px`;
    DOM.cursorRing.style.top  = `${ringY}px`;

    rafId = requestAnimationFrame(animateCursor);
  }
  rafId = requestAnimationFrame(animateCursor);

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(CONFIG.HOVERABLE_SELECTOR)) {
      DOM.cursorRing.classList.add('hovered');
      DOM.cursorDot.classList.add('active');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(CONFIG.HOVERABLE_SELECTOR)) {
      DOM.cursorRing.classList.remove('hovered');
      DOM.cursorDot.classList.remove('active');
    }
  });

  document.addEventListener('mouseleave', () => {
    DOM.cursorDot.style.opacity  = '0';
    DOM.cursorRing.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    DOM.cursorDot.style.opacity  = '1';
    DOM.cursorRing.style.opacity = '1';
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else rafId = requestAnimationFrame(animateCursor);
  });
})();


(function initScrollProgress() {
  if (!DOM.scrollBar) return;

  function updateScrollBar() {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    DOM.scrollBar.style.width = `${scrollPercent}%`;
    DOM.scrollBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
  }

  window.addEventListener('scroll', updateScrollBar, { passive: true });
  updateScrollBar(); /* initialise */
})();


(function initNavbar() {
  if (!DOM.navbar) return;

  function updateNavbar() {
    DOM.navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* Active link — highlight nav link matching visible section */
  const sections = document.querySelectorAll('section[id], div[id="marquee"]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-nav a[href^="#"]');

  function updateActiveLink() {
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) current = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();

/* ================================================================
   5. MOBILE NAVIGATION TOGGLE
   Hamburger opens slide-in mobile nav panel with overlay.
   Closes on: overlay click, nav link click, Escape key.
   ================================================================ */
(function initMobileNav() {
  if (!DOM.hamburger || !DOM.mobileNav || !DOM.mobOverlay) return;

  function openNav() {
    DOM.hamburger.classList.add('open');
    DOM.mobileNav.classList.add('open');
    DOM.mobOverlay.classList.add('open');
    DOM.mobileNav.removeAttribute('aria-hidden');
    DOM.hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    /* Focus first link for accessibility */
    const firstLink = DOM.mobileNav.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeNav() {
    DOM.hamburger.classList.remove('open');
    DOM.mobileNav.classList.remove('open');
    DOM.mobOverlay.classList.remove('open');
    DOM.mobileNav.setAttribute('aria-hidden', 'true');
    DOM.hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  DOM.hamburger.addEventListener('click', () => {
    DOM.mobileNav.classList.contains('open') ? closeNav() : openNav();
  });

  DOM.mobOverlay.addEventListener('click', closeNav);

  /* Close when a nav link is clicked */
  DOM.mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  /* Keyboard: Escape closes panel */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DOM.mobileNav.classList.contains('open')) closeNav();
  });
})();

/* ================================================================
   6. SCROLL REVEAL ANIMATIONS
   IntersectionObserver adds .in to .reveal elements once they
   enter the viewport. Respects prefers-reduced-motion.
   ================================================================ */
(function initReveal() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    /* Immediately show all reveal elements */
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target); /* fire once only */
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();

/* ================================================================
   7. HERO CANVAS — Animated Islamic Geometric Pattern
   Draws an animated grid of 8-pointed star geometry using Canvas2D.
   Subtle, slow-moving, low-opacity — cinematic depth layer.
   ================================================================ */
(function initHeroCanvas() {
  const canvas = DOM.heroCanvas;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, animFrame;
  let t = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function drawGeometricStar(cx, cy, r, rotation, alpha) {
    const points = 8;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#b8902a';
    ctx.lineWidth   = 0.4;
    ctx.beginPath();

    for (let i = 0; i < points * 2; i++) {
      const angle  = (Math.PI / points) * i + rotation;
      const radius = i % 2 === 0 ? r : r * 0.42;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    /* Inner ring */
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const gridSize = Math.min(W, H) * 0.18;
    const cols     = Math.ceil(W / gridSize) + 2;
    const rows     = Math.ceil(H / gridSize) + 2;

    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const cx = col * gridSize + (gridSize / 2);
        const cy = row * gridSize + (gridSize / 2);
        /* Parallax: different rows drift at different speeds */
        const drift  = Math.sin(t * 0.0004 + row * 0.6) * 8;
        const alpha  = 0.028 + Math.sin(t * 0.0006 + col * 0.8 + row * 0.5) * 0.012;
        const rotate = t * 0.00008 + row * 0.18;

        drawGeometricStar(cx, cy + drift, gridSize * 0.40, rotate, Math.max(0.005, alpha));
      }
    }

    t++;
    animFrame = requestAnimationFrame(draw);
  }

  function start() {
    resize();
    if (animFrame) cancelAnimationFrame(animFrame);
    draw();
  }

  /* Throttled resize */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(start, 150);
  });

  /* Pause when not visible (performance) */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrame);
    } else {
      start();
    }
  });

  /* Don't run canvas if reduced motion */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    start();
  }
})();

/* ================================================================
   8. FOOTER — current year
   ================================================================ */
(function initFooterYear() {
  if (DOM.yearEl) DOM.yearEl.textContent = new Date().getFullYear();
})();

/* ================================================================
   9. FILE UPLOAD PREVIEW
   Shows the selected filename inside the upload dropzone.
   Provides drag-over visual feedback.
   ================================================================ */
(function initFileUpload() {
  const area     = DOM.uploadArea;
  const input    = DOM.attachment;
  const chosen   = DOM.uploadChosen;
  if (!area || !input || !chosen) return;

  input.addEventListener('change', () => {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const name = file.name.length > 40
        ? file.name.substring(0, 37) + '…'
        : file.name;
      chosen.textContent = `✓  ${name}`;
    } else {
      chosen.textContent = '';
    }
  });

  /* Drag-over feedback */
  area.addEventListener('dragover', (e) => {
    e.preventDefault();
    area.classList.add('drag-over');
  });
  ['dragleave', 'dragend', 'drop'].forEach((ev) => {
    area.addEventListener(ev, () => area.classList.remove('drag-over'));
  });
})();

/* ================================================================
   10. ORDER / QUOTE FORM
   ================================================================
   Flow:
   1. User fills form → JS validates client-side
   2. Honeypot check (if .website field filled → silently "succeed")
   3. Timing check (< SPAM_MIN_ELAPSED_MS → soft rejection message)
   4. Build FormData payload
   5. POST to Flask backend via fetch()
   6. Handle: loading state, success, validation errors, server errors
   ================================================================ */
(function initOrderForm() {
  const form      = DOM.orderForm;
  if (!form) return;

  /* ── State ────────────────────────────────────────────────────── */
  let isSubmitting = false; /* Anti double-submit guard */

  /* ── Field references ─────────────────────────────────────────── */
  const fields = {
    name:     form.querySelector('#name'),
    email:    form.querySelector('#email'),
    phone:    form.querySelector('#phone'),
    service:  form.querySelector('#service'),
    message:  form.querySelector('#message'),
    honeypot: form.querySelector('#website'),   /* hidden bot trap */
  };

  /* ── Validation helpers ───────────────────────────────────────── */

  /**
   * RFC 5322 simplified email pattern.
   * Covers the vast majority of real addresses without false negatives.
   */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /**
   * showFieldError(field, errorElId, message)
   * Marks a field invalid and shows its associated error span.
   */
  function showFieldError(field, errorElId, message) {
    field.classList.add('invalid');
    field.setAttribute('aria-invalid', 'true');
    const errorEl = document.getElementById(errorElId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  /**
   * clearFieldError(field, errorElId)
   * Removes invalid state from a field.
   */
  function clearFieldError(field, errorElId) {
    field.classList.remove('invalid');
    field.removeAttribute('aria-invalid');
    const errorEl = document.getElementById(errorElId);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  /** clearAllErrors — reset all field errors */
  function clearAllErrors() {
    clearFieldError(fields.name,    'name-error');
    clearFieldError(fields.email,   'email-error');
    clearFieldError(fields.service, 'service-error');
    clearFieldError(fields.message, 'message-error');
    hideFormError();
  }

  /**
   * validateForm() → { valid: Boolean, errors: Object }
   * Runs all client-side validation checks.
   * Returns an object containing whether the form is valid,
   * and a map of field name → error message for any failures.
   */
  function validateForm() {
    const errors = {};
    const vals   = {
      name:    fields.name.value.trim(),
      email:   fields.email.value.trim(),
      service: fields.service.value,
      message: fields.message.value.trim(),
    };

    if (!vals.name || vals.name.length < 2) {
      errors.name = 'Please enter your full name.';
    }
    if (!vals.email) {
      errors.email = 'An email address is required.';
    } else if (!EMAIL_RE.test(vals.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!vals.service) {
      errors.service = 'Please select the service you require.';
    }
    if (!vals.message) {
      errors.message = 'Please describe your order or enquiry.';
    } else if (vals.message.length < CONFIG.MIN_MESSAGE_LENGTH) {
      errors.message = `Please provide a little more detail (at least ${CONFIG.MIN_MESSAGE_LENGTH} characters).`;
    }

    return {
      valid:  Object.keys(errors).length === 0,
      errors,
    };
  }

  /** Show inline field errors from validation result */
  function applyFieldErrors(errors) {
    if (errors.name)    showFieldError(fields.name,    'name-error',    errors.name);
    if (errors.email)   showFieldError(fields.email,   'email-error',   errors.email);
    if (errors.service) showFieldError(fields.service, 'service-error', errors.service);
    if (errors.message) showFieldError(fields.message, 'message-error', errors.message);
  }

  /* ── Real-time inline clearing ────────────────────────────────── */
  /* Remove error state as user corrects their input */
  [
    ['name',    'name-error'],
    ['email',   'email-error'],
    ['service', 'service-error'],
    ['message', 'message-error'],
  ].forEach(([fieldKey, errorId]) => {
    const el = fields[fieldKey];
    if (!el) return;
    const eventType = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(eventType, () => clearFieldError(el, errorId));
  });

  /* ── Banner-level error/success helpers ───────────────────────── */

  function showFormError(message) {
    if (!DOM.formError || !DOM.formErrorMsg) return;
    DOM.formErrorMsg.textContent = message;
    DOM.formError.classList.add('show');
    /* Scroll it into view */
    DOM.formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideFormError() {
    if (!DOM.formError) return;
    DOM.formError.classList.remove('show');
  }

  function showSuccessState() {
    if (!DOM.formWrapper || !DOM.formSuccess) return;
    DOM.formWrapper.style.display = 'none';
    DOM.formSuccess.classList.add('show');
    DOM.formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ── Loading state helpers ────────────────────────────────────── */

  function setLoadingState(loading) {
    if (!DOM.submitBtn || !DOM.btnText || !DOM.btnLoading) return;
    DOM.submitBtn.disabled = loading;
    if (loading) {
      DOM.btnText.hidden    = true;
      DOM.btnLoading.hidden = false;
    } else {
      DOM.btnText.hidden    = false;
      DOM.btnLoading.hidden = true;
    }
  }

  /* ── Honeypot check ───────────────────────────────────────────── */
  /**
   * isBotSubmission()
   *
   * The honeypot field (#website) is hidden from all real users via CSS:
   *   .honeypot-wrapper { position: absolute; left: -9999px; ... }
   *
   * Automated bots crawl forms and fill every input they find,
   * including this one. A real human navigating the page normally
   * will never see, tab to, or fill this field.
   *
   * If the honeypot field contains any value:
   *   → treat as bot.
   *   → pretend to succeed (return true so we fake a success response)
   *   → do NOT call the backend. Do NOT send any email. Do NOT log.
   *
   * This silently discards the submission — bots receive no signal
   * that they were detected, so they cannot adapt their strategy.
   */
  function isBotSubmission() {
    return fields.honeypot && fields.honeypot.value.trim() !== '';
  }

  /* ── Timing check ─────────────────────────────────────────────── */
  /**
   * isFastSubmission()
   *
   * Records the exact millisecond the page became interactive (PAGE_LOAD_TIME).
   * If a user submits the form in under SPAM_MIN_ELAPSED_MS (default 4s),
   * it is virtually impossible for a human to have:
   *   1. Read the page
   *   2. Scrolled to the form
   *   3. Filled in all fields thoughtfully
   *
   * This catches automated scripts that POST directly to the form endpoint.
   * Note: Fast submissions are surfaced as a user-facing validation message
   * (not a silent discard) — this gives genuine edge cases a path to retry.
   */
  function isFastSubmission() {
    return (Date.now() - PAGE_LOAD_TIME) < CONFIG.SPAM_MIN_ELAPSED_MS;
  }

  /* ── Form submit handler ──────────────────────────────────────── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* Double-submit guard: if already in-flight, do nothing */
    if (isSubmitting) return;

    clearAllErrors();

    /* ── Step 1: Client-side validation ──────────────────────────── */
    const { valid, errors } = validateForm();
    if (!valid) {
      applyFieldErrors(errors);
      /* Focus the first invalid field */
      const firstErrorField = [fields.name, fields.email, fields.service, fields.message]
        .find((f) => f.classList.contains('invalid'));
      if (firstErrorField) firstErrorField.focus();
      return;
    }

    /* ── Step 2: Honeypot bot detection ───────────────────────────── */
    if (isBotSubmission()) {
      /*
       * Silently "succeed" — fake the success state so bot scripts
       * receive no indication they were caught.
       * We do NOT call the backend, do NOT send any email.
       */
      showSuccessState();
      return;
    }

    /* ── Step 3: Timing / fast-submission check ───────────────────── */
    if (isFastSubmission()) {
      showFormError(
        'Please take a moment to fill in your details — we want to make sure we respond to you accurately.'
      );
      return;
    }

    /* ── Step 4: Build FormData payload ───────────────────────────── */
    const formData = new FormData();
    formData.append('name',    fields.name.value.trim());
    formData.append('email',   fields.email.value.trim());
    formData.append('phone',   fields.phone ? fields.phone.value.trim() : '');
    formData.append('service', fields.service.value);
    formData.append('message', fields.message.value.trim());

    /* Attach file if selected (backend handles it, no required) */
    if (DOM.attachment && DOM.attachment.files && DOM.attachment.files[0]) {
      formData.append('attachment', DOM.attachment.files[0]);
    }

    /* ── Step 5: Lock submission + show loading state ─────────────── */
    isSubmitting = true;
    setLoadingState(true);
    hideFormError();

    /* ── Step 6: Fetch to Flask backend ──────────────────────────── */
    try {
      const endpoint = `${CONFIG.API_BASE_URL}/api/order`;

      const response = await fetch(endpoint, {
        method:  'POST',
        body:    formData,
        headers: {
          /*
           * Do NOT set Content-Type when using FormData — the browser
           * sets it automatically with the correct multipart boundary.
           */
          'X-Requested-With': 'XMLHttpRequest', /* helps backend identify AJAX */
        },
        /* 20 second timeout — PythonAnywhere free tier can be slow on cold start */
        signal: AbortSignal.timeout ? AbortSignal.timeout(20000) : undefined,
      });

      /* ── Step 7: Parse response ─────────────────────────────────── */
      let data;
      try {
        data = await response.json();
      } catch {
        /* Non-JSON response (CORS issue, server crash HTML page, etc.) */
        throw new Error('SERVER_PARSE_ERROR');
      }

      if (response.ok && data.status === 'success') {
        /* ✓ SUCCESS ─────────────────────────────────────────────── */
        showSuccessState();
        form.reset();
        if (DOM.uploadChosen) DOM.uploadChosen.textContent = '';

      } else if (response.status === 400 && data.status === 'validation_error') {
        /* ✗ VALIDATION ERROR from server ────────────────────────── */
        const serverErrors = data.errors || {};
        applyFieldErrors(serverErrors);
        showFormError(data.message || 'Please review your details and try again.');

      } else if (response.status === 429) {
        /* ✗ RATE LIMITED / SPAM DETECTED by server ──────────────── */
        showFormError(
          data.message || 'Too many requests. Please try again shortly.'
        );

      } else {
        /* ✗ OTHER SERVER ERROR ───────────────────────────────────── */
        throw new Error(data.message || 'SERVER_ERROR');
      }

    } catch (error) {
      /* ── Step 8: Graceful failure handling ──────────────────────── */

      let userMessage;

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        userMessage = 'The request timed out. Please check your connection and try again.';
      } else if (error.message === 'SERVER_PARSE_ERROR') {
        userMessage = 'We encountered an issue communicating with our server. Please try again or contact us directly at ' + _gContact() + '';
      } else if (!navigator.onLine) {
        userMessage = 'You appear to be offline. Please check your internet connection and try again.';
      } else if (error.message === 'Failed to fetch') {
        /*
         * "Failed to fetch" is the browser's generic network error.
         * Could be: CORS misconfiguration, backend down, DNS failure.
         * Give the user a helpful fallback.
         */
        userMessage = 'We could not reach our server at this time. Please try again in a moment, or email us directly at ' + _gContact() + '';
      } else {
        userMessage = `Something went wrong: ${error.message}. Please try again or contact us at ' + _gContact() + '`;
      }

      showFormError(userMessage);

      /* Log full error to console for developer debugging */
      console.error('[Orient Art Form Error]', error);

    } finally {
      /* Always re-enable the form regardless of outcome */
      isSubmitting = false;
      setLoadingState(false);
    }
  });

})();

/* ================================================================
   11. SMOOTH SCROLL — for same-page anchor links
   Ensures smooth scroll on browsers that don't support CSS
   scroll-behavior, and calculates navbar offset correctly.
   ================================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = DOM.navbar ? DOM.navbar.offsetHeight : 80;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
})();

/* ================================================================
   12. MARQUEE — pause on hover (accessibility + UX)
   The CSS handles .marquee-track:hover { animation-play-state: paused }
   but we add an explicit listener here for keyboard users who tab into
   the marquee items.
   ================================================================ */
(function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;

  track.addEventListener('focusin',  () => { track.style.animationPlayState = 'paused'; });
  track.addEventListener('focusout', () => { track.style.animationPlayState = 'running'; });
})();

/* ================================================================
   13. PRODUCT CARD — "ORDER NOW" quick links
   Clicking anywhere on a product card (except its button) scrolls
   to the contact form. Improves conversion UX for touch users.
   ================================================================ */
(function initProductCards() {
  document.querySelectorAll('.product-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      /* Don't override if user clicked the actual button/link */
      if (e.target.closest('a, button')) return;

      const contact = document.getElementById('contact');
      if (!contact) return;

      const navbarHeight = DOM.navbar ? DOM.navbar.offsetHeight : 80;
      const targetY = contact.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
})();

/* ================================================================
   14. LAZY IMAGE ENHANCEMENT
   Adds loading="lazy" to any <img> tags within the main content
   that don't already have it — future-proofs when real photos
   are added to the image placeholder areas.
   ================================================================ */
(function initLazyImages() {
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('main img:not([loading])').forEach((img) => {
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    });
  }
})();