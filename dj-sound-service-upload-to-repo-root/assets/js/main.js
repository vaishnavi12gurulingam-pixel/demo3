/* =========================================================
   PulseSound - main.js
   - Injects the shared header and footer (identical on every page)
   - Theme (dark / light) and direction (LTR / RTL) toggles
   - Sticky header state, scroll progress, back-to-top after hero
   - Mobile menu (closes on link, Escape and resize)
   - Hero player, sound lab (equalizer + mix switch), carousel
   - Dial-in mixing board (event picker drives the faders)
   - Custom form validation (no default browser validation bubbles)
   - AOS scroll animation initialisation
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase() || 'index.html';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reusable debounce utility */
  function debounce(fn, wait) {
    var timer;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  var HOME_PAGES = ['index.html', 'home-2.html'];

  var NAV_LINKS = [
    {
      href: 'index.html', label: 'Home', children: [
        { href: 'index.html', label: 'Home 1' },
        { href: 'home-2.html', label: 'Home 2' }
      ]
    },
    { href: 'about.html', label: 'About' },
    { href: 'services.html', label: 'Services' },
    { href: 'packages.html', label: 'Packages' },
    { href: 'contact.html', label: 'Contact' }
  ];

  /* ---------- Shared templates (identical on every page) ---------- */
  /* The 404 page uses a minimal shell: no nav links, no footer, and a Back to site button */
  function isBareShell() {
    return !!(document.body && document.body.classList.contains('page-404'));
  }

  function bareHeaderTemplate() {
    return '' +
      '<header class="site-header" id="siteHeader">' +
      '<nav class="container navbar" aria-label="Main navigation">' +
      '<a href="index.html" class="brand" aria-label="PulseSound home">' +
      '<img src="../assets/images/logo.svg" alt="PulseSound logo" width="38" height="38">' +
      '<span>PulseSound</span>' +
      '</a>' +
      '<div class="nav-actions">' +
      '<button class="icon-btn" id="themeToggle" type="button" aria-label="Switch to light mode"></button>' +
      '<button class="dir-toggle" id="dirToggle" type="button">RTL</button>' +
      '<a href="index.html" class="btn btn-primary btn-sm nf-back">Back to site</a>' +
      '</div>' +
      '</nav>' +
      '<span class="scroll-progress" id="scrollProgress" aria-hidden="true"></span>' +
      '</header>';
  }

  function headerTemplate() {
    if (isBareShell()) return bareHeaderTemplate();
    var links = NAV_LINKS.map(function (l) {
      if (l.children) {
        var groupActive = HOME_PAGES.indexOf(currentPage) !== -1 ? ' active' : '';
        var items = l.children.map(function (c) {
          var on = c.href === currentPage ? ' class="active" aria-current="page"' : '';
          return '<li><a href="' + c.href + '"' + on + '>' + c.label + '</a></li>';
        }).join('');
        return '<li class="has-dropdown">' +
          '<button class="nav-drop-btn' + groupActive + '" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="homeMenu">' +
          l.label + ' <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>' +
          '</button>' +
          '<ul class="dropdown" id="homeMenu">' + items + '</ul>' +
          '</li>';
      }
      var active = l.href === currentPage ? ' class="active"' : '';
      return '<li><a href="' + l.href + '"' + active + '>' + l.label + '</a></li>';
    }).join('');

    return '' +
      '<header class="site-header" id="siteHeader">' +
      '<nav class="container navbar" aria-label="Main navigation">' +
      '<a href="index.html" class="brand" aria-label="PulseSound home">' +
      '<img src="../assets/images/logo.svg" alt="PulseSound logo" width="38" height="38">' +
      '<span>PulseSound</span>' +
      '</a>' +
      '<ul class="nav-links" id="navLinks">' + links + '</ul>' +
      '<div class="nav-actions">' +
      '<button class="icon-btn" id="themeToggle" type="button" aria-label="Switch to light mode"></button>' +
      '<button class="dir-toggle" id="dirToggle" type="button">RTL</button>' +
      '<a href="contact.html" class="btn btn-primary btn-sm nav-cta">Book now</a>' +
      '<button class="icon-btn menu-toggle" id="menuToggle" type="button" aria-expanded="false" aria-controls="navLinks" aria-label="Open menu"><i class="fa-solid fa-bars"></i></button>' +
      '</div>' +
      '</nav>' +
      '<span class="scroll-progress" id="scrollProgress" aria-hidden="true"></span>' +
      '</header>';
  }

  function footerTemplate() {
    var year = new Date().getFullYear();
    return '' +
      '<footer class="site-footer">' +
      '<div class="container">' +
      '<div class="footer-grid">' +
      '<div class="footer-brand">' +
      '<a href="index.html" class="brand">' +
      '<img src="../assets/images/logo.svg" alt="PulseSound logo" width="38" height="38">' +
      '<span>PulseSound</span>' +
      '</a>' +
      '<p>Professional DJs and premium sound systems for weddings, clubs, corporate events and festivals.</p>' +
      '<div class="socials">' +
      '<a href="404.html" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>' +
      '<a href="404.html" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>' +
      '<a href="404.html" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>' +
      '<a href="404.html" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>' +
      '</div>' +
      '</div>' +
      '<div class="footer-col">' +
      '<h4>Explore</h4>' +
      '<ul>' +
      '<li><a href="index.html">Home</a></li>' +
      '<li><a href="about.html">About</a></li>' +
      '<li><a href="services.html">Services</a></li>' +
      '<li><a href="packages.html">Packages</a></li>' +
      '<li><a href="contact.html">Contact</a></li>' +
      '</ul>' +
      '</div>' +
      '<div class="footer-col">' +
      '<h4>Events</h4>' +
      '<ul>' +
      '<li><a href="services.html">Weddings</a></li>' +
      '<li><a href="services.html">Club nights</a></li>' +
      '<li><a href="services.html">Corporate</a></li>' +
      '<li><a href="services.html">Festivals</a></li>' +
      '<li><a href="services.html">Private parties</a></li>' +
      '</ul>' +
      '</div>' +
      '<div class="footer-col">' +
      '<h4>Contact</h4>' +
      '<ul>' +
      '<li><i class="fa-solid fa-phone"></i><a href="tel:+10000000000">+1 (000) 000-0000</a></li>' +
      '<li><i class="fa-solid fa-envelope"></i><a href="mailto:hello@pulsesound.example">hello@pulsesound.example</a></li>' +
      '<li><i class="fa-solid fa-clock"></i>Daily 9:00 to 22:00</li>' +
      '</ul>' +
      '<p class="footer-note">We confirm your date within a day of your enquiry.</p>' +
      '</div>' +
      '<div class="footer-col">' +
      '<h4>Get event tips</h4>' +
      '<p class="footer-note">Monthly tips on planning weddings, club nights and festival sound.</p>' +
      '<p class="footer-note footer-note--line">Tips land once a month.</p>' +
      '<form class="newsletter" data-validate novalidate>' +
      '<div class="form-group">' +
      '<label for="newsletterEmail">Email address</label>' +
      '<div class="input-row">' +
      '<input class="form-control" type="email" id="newsletterEmail" name="email" placeholder="Your email" required data-msg-required="Please enter your email address.">' +
      '<button class="btn btn-primary" type="submit" aria-label="Subscribe"><i class="fa-solid fa-paper-plane"></i></button>' +
      '</div>' +
      '<p class="error-msg" aria-live="polite"></p>' +
      '</div>' +
      '<p class="form-status" aria-live="polite"></p>' +
      '</form>' +
      '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
      '<span>&copy; <span id="year">' + year + '</span> PulseSound. All rights reserved.</span>' +
      '<span>Privacy &middot; Terms</span>' +
      '</div>' +
      '</div>' +
      '</footer>';
  }

  function injectShared() {
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if (h) h.innerHTML = headerTemplate();
    if (f) f.innerHTML = isBareShell() ? '' : footerTemplate();

    if (!document.getElementById('backToTop')) {
      document.body.insertAdjacentHTML('beforeend',
        '<button class="back-to-top" id="backToTop" type="button" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>');
    }
  }

  /* ---------- Theme and direction ---------- */
  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('ps-theme', theme); } catch (e) { /* private mode */ }
    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.innerHTML = theme === 'dark'
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  /* The button names the direction it switches to: RTL while the page is LTR, and LTR once it is RTL */
  function updateDirLabel(dir) {
    var btn = document.getElementById('dirToggle');
    if (!btn) return;
    var next = dir === 'rtl' ? 'LTR' : 'RTL';
    btn.textContent = next;
    btn.setAttribute('aria-label', 'Switch text direction to ' + next);
  }

  function setDirection(dir) {
    root.setAttribute('dir', dir);
    try { localStorage.setItem('ps-dir', dir); } catch (e) { /* private mode */ }
    updateDirLabel(dir);
  }

  function bindToggles() {
    var themeBtn = document.getElementById('themeToggle');
    var dirBtn = document.getElementById('dirToggle');
    setTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    updateDirLabel(root.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr');

    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
      });
    }
    if (dirBtn) {
      dirBtn.addEventListener('click', function () {
        setDirection(root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl');
      });
    }
  }

  /* ---------- Mobile menu ---------- */
  function bindMenu() {
    var menuBtn = document.getElementById('menuToggle');
    var navList = document.getElementById('navLinks');
    if (!menuBtn || !navList) return;

    function setOpen(open) {
      navList.classList.toggle('open', open);
      /* Lock page scroll while the mobile menu is open (the menu panel itself still scrolls) */
      root.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menuBtn.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    }

    menuBtn.addEventListener('click', function () {
      setOpen(!navList.classList.contains('open'));
    });

    navList.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    /* Touch devices (iOS Safari especially) can still scroll the page behind an overflow:hidden root.
       Block wheel/touch scrolling anywhere outside the open menu panel. */
    function blockOutsideScroll(e) {
      if (!navList.classList.contains('open')) return;
      if (navList.contains(e.target)) return;
      e.preventDefault();
    }
    document.addEventListener('touchmove', blockOutsideScroll, { passive: false });
    document.addEventListener('wheel', blockOutsideScroll, { passive: false });

    window.addEventListener('resize', debounce(function () {
      if (window.innerWidth >= 1025) setOpen(false);
    }, 150), { passive: true });
  }

  /* ---------- Sticky header state, progress bar and back-to-top ---------- */
  function bindScroll() {
    var header = document.getElementById('siteHeader');
    var progress = document.getElementById('scrollProgress');
    var backBtn = document.getElementById('backToTop');
    var hero = document.querySelector('.hero, .page-hero, .h2-hero');
    var queued = false;
    var maxScroll = 1;
    var threshold = 600;
    var wasScrolled = null;
    var wasBackShown = null;

    function recalc() {
      maxScroll = Math.max(1, (root.scrollHeight || document.body.scrollHeight) - window.innerHeight);
      threshold = hero ? hero.offsetHeight : 600;
    }

    function update() {
      queued = false;
      var y = window.pageYOffset || root.scrollTop || 0;
      var isScrolled = y > 10;
      if (header && isScrolled !== wasScrolled) {
        header.classList.toggle('scrolled', isScrolled);
        wasScrolled = isScrolled;
      }
      if (progress) {
        var ratio = Math.min(Math.max(y / maxScroll, 0), 1);
        progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      }
      if (backBtn) {
        var isBackShown = y > threshold;
        if (isBackShown !== wasBackShown) {
          backBtn.classList.toggle('show', isBackShown);
          wasBackShown = isBackShown;
        }
      }
    }

    function queue() {
      if (!queued) {
        queued = true;
        window.requestAnimationFrame(update);
      }
    }

    recalc();
    update();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', debounce(function () {
      recalc();
      queue();
    }, 100), { passive: true });

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
  }

  /* ---------- Custom form validation ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^\+?[0-9\s()-]{7,20}$/;

  function getMessage(field) {
    var value = field.value.trim();
    var isRequired = field.hasAttribute('required');

    if (field.type === 'checkbox') {
      if (isRequired && !field.checked) return field.getAttribute('data-msg-required') || 'Please tick this box to continue.';
      return '';
    }

    if (isRequired && !value) {
      return field.getAttribute('data-msg-required') || 'This field is required.';
    }
    if (!value) return '';

    if (field.type === 'email' && !EMAIL_RE.test(value)) {
      return 'Please enter a valid email address, for example name@example.com.';
    }
    if (field.type === 'tel' && !PHONE_RE.test(value)) {
      return 'Please enter a valid phone number (7 to 20 digits).';
    }
    if (field.type === 'number') {
      var n = Number(value);
      if (!Number.isInteger(n) || n < 1 || n > 5000) {
        return 'Please enter a whole number between 1 and 5000.';
      }
    }
    if (field.type === 'date') {
      var p = value.split('-').map(Number);
      var chosen = new Date(p[0], p[1] - 1, p[2]);
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(chosen.getTime())) return 'Please enter a valid date.';
      if (chosen < today) return 'The event date cannot be in the past.';
    }
    if (field.dataset.minLength && value.length < Number(field.dataset.minLength)) {
      return 'Please enter at least ' + field.dataset.minLength + ' characters.';
    }
    return '';
  }

  function setFieldState(field, message) {
    var group = field.closest('.form-group');
    if (!group) return !message;
    var err = group.querySelector('.error-msg');
    group.classList.toggle('is-invalid', !!message);
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (err) err.textContent = message;
    return !message;
  }

  function bindForms() {
    document.querySelectorAll('form[data-validate]').forEach(function (form) {
      var fields = Array.prototype.slice.call(
        form.querySelectorAll('input:not([type="submit"]):not([type="button"]), select, textarea')
      );
      var status = form.querySelector('.form-status');

      fields.forEach(function (field) {
        field.addEventListener('blur', function () {
          field.setAttribute('data-touched', '1');
          setFieldState(field, getMessage(field));
        });
        field.addEventListener('input', function () {
          if (field.hasAttribute('data-touched')) setFieldState(field, getMessage(field));
        });
        field.addEventListener('change', function () {
          if (field.hasAttribute('data-touched')) setFieldState(field, getMessage(field));
        });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var valid = true;
        var firstInvalid = null;

        fields.forEach(function (field) {
          field.setAttribute('data-touched', '1');
          var ok = setFieldState(field, getMessage(field));
          if (!ok) {
            valid = false;
            if (!firstInvalid) firstInvalid = field;
          }
        });

        if (!valid) {
          if (status) {
            status.className = 'form-status error';
            status.textContent = 'Please fix the highlighted fields and try again.';
          }
          firstInvalid.focus();
          return;
        }

        if (status) {
          status.className = 'form-status success';
          status.innerHTML = '<i class="fa-solid fa-circle-check"></i> Thank you! We have received your request and will reply within 24 hours.';
        }
        form.reset();
        fields.forEach(function (field) {
          field.removeAttribute('data-touched');
          field.setAttribute('aria-invalid', 'false');
          var g = field.closest('.form-group');
          if (g) g.classList.remove('is-invalid');
        });
      });
    });
  }

  /* ---------- AOS (scroll animations) ---------- */
  function initAOS() {
    if (window.AOS) {
      window.AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 80,
        disable: reduceMotion,
        debounceDelay: 50,
        throttleDelay: 99
      });
    }
  }

  /* ---------- Hero player (track list, transport, play/pause) ---------- */
  function bindHeroPlayer() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var items = Array.prototype.slice.call(hero.querySelectorAll('.track-item'));
    if (!items.length) return;

    var titleEl = document.getElementById('nowTitle');
    var subEl = document.getElementById('nowSub');
    var playBtn = document.getElementById('playToggle');
    var idx = 0;

    function setActive(i) {
      idx = (i + items.length) % items.length;
      items.forEach(function (el, k) {
        el.classList.toggle('active', k === idx);
        el.setAttribute('aria-pressed', k === idx ? 'true' : 'false');
      });
      if (titleEl) titleEl.textContent = items[idx].getAttribute('data-title');
      if (subEl) subEl.textContent = items[idx].getAttribute('data-sub');
    }

    items.forEach(function (el, k) {
      el.addEventListener('click', function () { setActive(k); });
    });

    hero.querySelectorAll('[data-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setActive(idx + Number(btn.getAttribute('data-step')));
      });
    });

    if (playBtn) {
      playBtn.addEventListener('click', function () {
        var paused = hero.classList.toggle('paused');
        playBtn.innerHTML = paused ? '<i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-pause"></i>';
        playBtn.setAttribute('aria-label', paused ? 'Play' : 'Pause');
      });
    }

    setActive(0);
  }

  /* ---------- Sound lab: equalizer, mix switch, sleeve play buttons ---------- */
  function bindSoundLab() {
    var lab = document.getElementById('lab');
    if (!lab) return;

    var eq = document.getElementById('eq');
    var playBtn = document.getElementById('labPlay');
    var titleEl = document.getElementById('labTitle');
    var subEl = document.getElementById('labSub');
    var coverEl = document.getElementById('labCover');
    var numEl = document.getElementById('labNum');
    var noteEl = document.getElementById('labNote');
    var modeBtns = lab.querySelectorAll('.pill-btn');
    var sleeveBtns = document.querySelectorAll('.sleeve-play');

    var PLAY_ICON = '<i class="fa-solid fa-play"></i>';
    var PAUSE_ICON = '<i class="fa-solid fa-pause"></i>';

    /* Build 32 bars with a stable, pleasant height shape and varied timing */
    if (eq && !eq.children.length) {
      for (var i = 0; i < 32; i++) {
        var bar = document.createElement('span');
        var h = 0.35 + Math.abs(Math.sin(i * 0.61 + 0.4)) * 0.65;
        bar.style.setProperty('--h', h.toFixed(2));
        bar.style.setProperty('--d', (0.55 + ((i * 37) % 11) / 10).toFixed(2) + 's');
        bar.style.setProperty('--delay', (-(((i * 13) % 7) / 10)).toFixed(1) + 's');
        eq.appendChild(bar);
      }
    }

    function isPlaying() { return lab.classList.contains('is-playing'); }

    function setPlaying(on) {
      lab.classList.toggle('is-playing', on);
      if (playBtn) {
        playBtn.innerHTML = on ? PAUSE_ICON : PLAY_ICON;
        playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
        playBtn.setAttribute('aria-pressed', String(on));
      }
      syncSleeves();
    }

    function setMode(mode) {
      lab.setAttribute('data-mode', mode);
      modeBtns.forEach(function (b) {
        var on = b.getAttribute('data-mode') === mode;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      if (noteEl) {
        noteEl.textContent = mode === 'pulse'
          ? 'PulseSound mix: tuned on site for this venue, this crowd and this music.'
          : 'Standard mix: a generic setup with no venue tuning.';
      }
    }

    function loadTrack(btn) {
      if (titleEl) titleEl.textContent = btn.getAttribute('data-title');
      if (subEl) subEl.textContent = btn.getAttribute('data-sub');
      if (coverEl) coverEl.style.setProperty('--grad', btn.getAttribute('data-grad'));
      if (coverEl) coverEl.style.setProperty('--img', btn.getAttribute('data-img') ? "url('" + btn.getAttribute('data-img') + "')" : 'none');
      if (numEl) numEl.textContent = btn.getAttribute('data-num');
    }

    function currentTitle() { return titleEl ? titleEl.textContent : ''; }

    function syncSleeves() {
      sleeveBtns.forEach(function (b) {
        var on = isPlaying() && b.getAttribute('data-title') === currentTitle();
        var sleeve = b.closest('.sleeve');
        b.innerHTML = on ? PAUSE_ICON : PLAY_ICON;
        b.setAttribute('aria-pressed', String(on));
        b.setAttribute('aria-label', (on ? 'Pause ' : 'Play ') + b.getAttribute('data-title'));
        if (sleeve) sleeve.classList.toggle('is-current', on);
      });
    }

    /* A visitor's own pause is remembered, so scrolling never restarts a track they stopped */
    function userToggle(next) {
      if (next) { lab.removeAttribute('data-user-paused'); } else { lab.setAttribute('data-user-paused', 'true'); }
      setPlaying(next);
    }

    if (playBtn) {
      playBtn.addEventListener('click', function () { userToggle(!isPlaying()); });
    }

    modeBtns.forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
    });

    sleeveBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('data-title') === currentTitle()) {
          userToggle(!isPlaying());
        } else {
          loadTrack(b);
          userToggle(true);
        }
      });
    });

    setMode(lab.getAttribute('data-mode') || 'pulse');
    syncSleeves();

    /* Play whenever the lab is on screen; pause when it leaves, unless the visitor paused it themselves */
    if ('IntersectionObserver' in window && !reduceMotion) {
      var labIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            if (!lab.hasAttribute('data-user-paused') && !isPlaying()) {
              lab.setAttribute('data-auto', '1');
              setPlaying(true);
            }
          } else if (isPlaying() && lab.getAttribute('data-auto') === '1') {
            lab.removeAttribute('data-auto');
            setPlaying(false);
          }
        });
      }, { threshold: 0.35 });
      labIO.observe(lab);
    }
  }

  /* ---------- Testimonials carousel (scroll-snap, RTL aware) ---------- */
  /* ---------- Testimonials: tracks, now-playing panel and auto-advance ---------- */
  function bindReviews() {
    var setlist = document.querySelector('[data-setlist]');
    if (!setlist) return;
    var tracks = Array.prototype.slice.call(setlist.querySelectorAll('.track'));
    var textEl = document.getElementById('reviewText');
    var nameEl = document.getElementById('reviewName');
    var roleEl = document.getElementById('reviewRole');
    var avatarEl = document.getElementById('reviewAvatar');
    var starsEl = document.getElementById('reviewStars');
    var panel = document.getElementById('reviewPanel');
    var current = 0;

    // Each client gets the same time on the progress bar; CSS does the timing
    setlist.style.setProperty('--review-dur', '7s');

    function renderStars(count) {
      starsEl.textContent = '';
      for (var i = 0; i < 5; i++) {
        var star = document.createElement('i');
        star.className = (i < count ? 'fa-solid' : 'fa-regular') + ' fa-star';
        star.setAttribute('aria-hidden', 'true');
        starsEl.appendChild(star);
      }
      starsEl.setAttribute('aria-label', count + ' out of 5 stars');
    }

    function show(i) {
      current = (i + tracks.length) % tracks.length;
      var t = tracks[current];
      tracks.forEach(function (tr, k) {
        var on = k === current;
        tr.classList.toggle('is-active', on);
        tr.setAttribute('aria-selected', on ? 'true' : 'false');
        tr.setAttribute('tabindex', on ? '0' : '-1');
      });
      panel.setAttribute('aria-labelledby', t.id);
      textEl.textContent = '\u201C' + t.getAttribute('data-quote') + '\u201D';
      nameEl.textContent = t.getAttribute('data-name');
      roleEl.textContent = t.getAttribute('data-role');
      avatarEl.textContent = t.getAttribute('data-initials');
      renderStars(Number(t.getAttribute('data-stars')));
      // Restart the entrance animation on the quote
      textEl.classList.remove('is-swapping');
      void textEl.offsetWidth;
      textEl.classList.add('is-swapping');
    }

    tracks.forEach(function (tr, k) {
      tr.addEventListener('click', function () { show(k); });
      tr.addEventListener('keydown', function (e) {
        var move = 0;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') move = 1;
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') move = -1;
        if (!move) return;
        e.preventDefault();
        show(k + move);
        tracks[current].focus();
      });
    });

    setlist.querySelectorAll('[data-review-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        show(current + Number(btn.getAttribute('data-review-step')));
      });
    });

    // Auto-advance when the active progress bar finishes; pausing stops the bar before it ends
    tracks.forEach(function (tr) {
      var bar = tr.querySelector('.track-progress');
      if (bar) bar.addEventListener('animationend', function () {
        if (tr.classList.contains('is-active')) show(current + 1);
      });
    });

    function pause(on) { setlist.classList.toggle('is-paused', on); }
    setlist.addEventListener('mouseenter', function () { pause(true); });
    setlist.addEventListener('mouseleave', function () { pause(false); });
    setlist.addEventListener('focusin', function () { pause(true); });
    setlist.addEventListener('focusout', function () { pause(false); });

    show(0);
  }

  /* ---------- Process timeline: draws the route and lights each node as you scroll ---------- */
  function bindSignal() {
    var sig = document.querySelector('[data-signal]');
    if (!sig) return;
    var steps = Array.prototype.slice.call(sig.querySelectorAll('.signal-step'));
    var n = steps.length;
    var queued = false;
    var lastP = -1;

    function update() {
      queued = false;
      var rect = sig.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;

      // Offscreen optimizations: early exit if already clamped
      if (rect.bottom < -100 && lastP === 1) return;
      if (rect.top > vh + 100 && lastP === 0) return;

      var p = reduceMotion ? 1 : (vh * 0.7 - rect.top) / Math.max(rect.height * 0.9, 1);
      p = Math.max(0, Math.min(1, p));

      if (Math.abs(p - lastP) < 0.002 && (p === 0 || p === 1 || lastP !== -1)) return;
      lastP = p;

      var total = p * (n - 1);
      steps.forEach(function (step, i) {
        var fill = Math.max(0, Math.min(1, total - i));
        step.style.setProperty('--fill', fill.toFixed(3));
        step.classList.toggle('is-lit', i === 0 || total >= i - 0.05);
      });
    }

    function queue() {
      if (!queued) {
        queued = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', debounce(function () {
      update();
    }, 150), { passive: true });
    update();
  }

  /* ---------- Events: the chapter in view drives the index, rail and title fill ---------- */
  function bindEvents() {
    var root = document.querySelector('[data-events]');
    if (!root) return;
    var chapters = Array.prototype.slice.call(root.querySelectorAll('.chapter'));
    var num = document.getElementById('eventsNum');
    var rail = root.querySelectorAll('.events-rail li');
    var current = -1;

    function setActive(i) {
      if (i === current || i < 0) return;
      current = i;
      chapters.forEach(function (c, k) { c.classList.toggle('is-active', k === i); });
      rail.forEach(function (r, k) { r.classList.toggle('is-on', k === i); });
      if (num) num.textContent = '0' + (i + 1);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) setActive(chapters.indexOf(e.target));
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      chapters.forEach(function (c) { io.observe(c); });
    } else {
      setActive(0);
    }
  }

  /* ---------- Venue checklist and loudness guide ---------- */
  function bindChecklist() {
    var list = document.querySelector('[data-checklist]');
    if (!list) return;
    var inputs = list.querySelectorAll('.check-input');
    var fg = document.getElementById('ringFg');
    var pctEl = document.getElementById('ringPct');
    var titleEl = document.getElementById('checkTitle');
    var textEl = document.getElementById('checkText');
    var C = 2 * Math.PI * 52;

    function update() {
      var n = 0;
      inputs.forEach(function (i) { if (i.checked) n++; });
      var pct = Math.round((n / inputs.length) * 100);
      fg.style.strokeDashoffset = String(C * (1 - pct / 100));
      pctEl.textContent = pct + '%';
      if (n <= 2) {
        titleEl.textContent = "Let's plan the details";
        textEl.textContent = 'A few answers help us plan the setup. Tell us about the space when you book.';
      } else if (n <= 4) {
        titleEl.textContent = 'Almost there';
        textEl.textContent = 'Sort the remaining points with the venue before you lock in the date.';
      } else {
        titleEl.textContent = 'Ready to go';
        textEl.textContent = 'Your venue looks set up for a smooth night. Lock in your date.';
      }
    }
    inputs.forEach(function (i) { i.addEventListener('change', update); });
    update();
  }

  function bindLoudness() {
    var scale = document.querySelector('[data-loud]');
    if (!scale) return;
    if (!('IntersectionObserver' in window) || reduceMotion) {
      scale.classList.add('is-in');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { scale.classList.add('is-in'); io.disconnect(); }
      });
    }, { threshold: 0.3 });
    io.observe(scale);
  }

  /* ---------- Dial-in rig sheet: pick an event and the channel meters move ---------- */
  var DIAL_EVENTS = {
    wedding: { title: 'Wedding', note: 'Wireless mics for vows and speeches, a soft first-dance mix and warm uplighting.', levels: [60, 70, 95, 55, 50] },
    club: { title: 'Club night', note: 'Full-range line arrays, pro decks, moving heads and fog synced to the drop, with a generator-ready backup.', levels: [100, 100, 20, 100, 85] },
    corporate: { title: 'Corporate', note: 'Clean vocal coverage for talks, background music that stays out of the way and a crew that keeps the schedule.', levels: [55, 60, 90, 35, 60] },
    festival: { title: 'Festival', note: 'Stage-grade rig, multi-zone sound and a spare for every critical item, sized for open-air crowds.', levels: [100, 90, 60, 95, 100] }
  };

  function bindDial() {
    var board = document.querySelector('[data-mixer]');
    if (!board) return;
    var picks = Array.prototype.slice.call(board.querySelectorAll('[data-event]'));
    var meters = Array.prototype.slice.call(board.querySelectorAll('[data-ch] .dl-meter-fill'));
    var vals = Array.prototype.slice.call(board.querySelectorAll('[data-ch] .dl-ch-val'));
    var titleEl = board.querySelector('[data-title]');
    var noteEl = board.querySelector('[data-note]');

    function show(key) {
      var ev = DIAL_EVENTS[key];
      if (!ev) return;
      picks.forEach(function (b) {
        var on = b.getAttribute('data-event') === key;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      meters.forEach(function (m, i) {
        m.style.setProperty('--level', ev.levels[i]);
        if (vals[i]) vals[i].textContent = ev.levels[i];
      });
      if (titleEl) titleEl.textContent = ev.title;
      if (noteEl) noteEl.textContent = ev.note;
    }

    picks.forEach(function (b) {
      b.addEventListener('click', function () { show(b.getAttribute('data-event')); });
    });
  }

  /* ---------- Header dropdown (Home 1 / Home 2) ---------- */
  function bindDropdown() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.has-dropdown'));
    if (!items.length) return;

    function setOpen(item, open) {
      item.classList.toggle('is-open', open);
      var b = item.querySelector('.nav-drop-btn');
      if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    items.forEach(function (item) {
      var b = item.querySelector('.nav-drop-btn');
      if (!b) return;
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = !item.classList.contains('is-open');
        items.forEach(function (o) { setOpen(o, false); });
        setOpen(item, open);
      });
    });

    document.addEventListener('click', function (e) {
      items.forEach(function (o) { if (!o.contains(e.target)) setOpen(o, false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') items.forEach(function (o) { setOpen(o, false); });
    });
  }

  /* ---------- Home 2: mood shift (scroll changes colour and word) ---------- */
  function bindMood() {
    var sec = document.querySelector('[data-mood-section]');
    if (!sec) return;
    var word = sec.querySelector('[data-mood-word]');
    var steps = Array.prototype.slice.call(sec.querySelectorAll('[data-mood-step]'));
    if (!steps.length) return;

    function activate(step) {
      if (step.classList.contains('is-active')) return;
      sec.setAttribute('data-mood', step.getAttribute('data-mood-step'));
      steps.forEach(function (s) { s.classList.toggle('is-active', s === step); });
      if (word) {
        word.textContent = step.getAttribute('data-name');
        word.classList.remove('is-swap');
        void word.offsetWidth;
        word.classList.add('is-swap');
      }
    }

    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) activate(e.target); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  }

  /* ---------- Contact: quick date picker fills the enquiry form ---------- */
  function bindDateChips() {
    var box = document.querySelector('[data-date-chips]');
    var dateInput = document.getElementById('cDate');
    if (!box || !dateInput) return;
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    for (var i = 0; i < 14; i++) {
      var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cdate-chip';
      btn.setAttribute('data-date', iso);
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = '<small>' + days[d.getDay()] + '</small><strong>' + d.getDate() + '</strong><small>' + months[d.getMonth()] + '</small>';
      box.appendChild(btn);
    }

    box.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-date]');
      if (!chip) return;
      dateInput.value = chip.getAttribute('data-date');
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      box.querySelectorAll('[data-date]').forEach(function (c) {
        c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
        c.classList.toggle('is-on', c === chip);
      });
      var group = dateInput.closest('.form-group');
      if (group) group.classList.remove('is-invalid');
      var err = group && group.querySelector('.error-msg');
      if (err) err.textContent = '';
    });
  }

  /* ---------- Packages: which package fits (guest and hour chips) ---------- */
  function bindInclusions() {
    var root = document.querySelector('[data-inc]');
    if (!root) return;
    var track = root.querySelector('[data-inc-track]');
    var dots = root.querySelector('[data-inc-dots]');
    var slides = Array.prototype.slice.call(track.children);
    dots.innerHTML = slides.map(function (_, i) {
      return '<button type="button" class="inc-dot" aria-label="Show item ' + (i + 1) + '"></button>';
    }).join('');
    var dotEls = Array.prototype.slice.call(dots.children);
    var slideOffsets = [];
    function measureOffsets() {
      slideOffsets = slides.map(function (el) { return el.offsetLeft; });
    }
    measureOffsets();

    function current() {
      var x = track.scrollLeft;
      var best = 0, bestGap = Infinity;
      for (var i = 0; i < slideOffsets.length; i++) {
        var gap = Math.abs(slideOffsets[i] - x);
        if (gap < bestGap) { bestGap = gap; best = i; }
      }
      return best;
    }
    function go(i) {
      var idx = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slideOffsets[idx] !== undefined ? slideOffsets[idx] : slides[idx].offsetLeft, behavior: 'smooth' });
    }
    var syncQueued = false;
    var lastC = -1;
    function sync() {
      if (syncQueued) return;
      syncQueued = true;
      window.requestAnimationFrame(function () {
        syncQueued = false;
        var c = current();
        if (c === lastC) return;
        lastC = c;
        dotEls.forEach(function (d, i) { d.classList.toggle('is-on', i === c); });
      });
    }
    dotEls.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
    root.querySelector('[data-inc-prev]').addEventListener('click', function () { go(current() - 1); });
    root.querySelector('[data-inc-next]').addEventListener('click', function () { go(current() + 1); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', debounce(function () {
      measureOffsets();
      sync();
    }, 150), { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current() - 1); }
    });
    sync();
  }

  function bindFit() {
    var guestBtns = Array.prototype.slice.call(document.querySelectorAll('[data-guests]'));
    var hourBtns = Array.prototype.slice.call(document.querySelectorAll('[data-hours]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-tier-card]'));
    var summary = document.querySelector('[data-fp-summary]');
    if (!guestBtns.length || !hourBtns.length || !cards.length) return;

    var NAMES = { essential: 'Essential', premium: 'Premium', ultimate: 'Ultimate' };
    var guests = null, hours = null;

    function pick(g, h) {
      if (g > 300 || h > 6) return 'ultimate';
      if (g > 100 || h > 4) return 'premium';
      return 'essential';
    }

    function markGroup(btns, value, attr) {
      btns.forEach(function (b) {
        var on = Number(b.getAttribute(attr)) === value;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    function update() {
      markGroup(guestBtns, guests, 'data-guests');
      markGroup(hourBtns, hours, 'data-hours');
      if (guests === null || hours === null) {
        cards.forEach(function (c) { c.classList.remove('is-pick'); });
        if (summary) summary.textContent = 'Choose a guest count and hours to see your match.';
        return;
      }
      var key = pick(guests, hours);
      cards.forEach(function (c) { c.classList.toggle('is-pick', c.getAttribute('data-tier-card') === key); });
      if (summary) {
        var g = guests >= 500 ? '500+' : guests;
        summary.textContent = g + ' guests and ' + hours + ' hours: ' + NAMES[key] + ' fits best.';
      }
    }

    guestBtns.forEach(function (b) {
      b.addEventListener('click', function () { guests = Number(b.getAttribute('data-guests')); update(); });
    });
    hourBtns.forEach(function (b) {
      b.addEventListener('click', function () { hours = Number(b.getAttribute('data-hours')); update(); });
    });
    update();
  }

  /* ---------- Services: flip the event cards on tap or Enter/Space ---------- */
  function bindEventCards() {
    var cards = document.querySelectorAll('.evp-card');
    if (!cards.length) return;
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var on = !card.classList.contains('is-flipped');
        card.classList.toggle('is-flipped', on);
        card.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    });
  }

  /* ---------- About story: the manifesto lights up word by word as you scroll ---------- */
  function bindStory() {
    var sec = document.querySelector('[data-story]');
    if (!sec) return;
    var words = Array.prototype.slice.call(sec.querySelectorAll('.sw'));
    var text = sec.querySelector('.story-manifesto');
    if (!words.length || !text) return;
    sec.classList.add('is-js');
    var queued = false;

    function update() {
      queued = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var rect = text.getBoundingClientRect();
      // 0 when the sentence reaches 80% of the viewport, 1 once it has been read through
      var p = reduceMotion ? 1 : (vh * 0.8 - rect.top) / Math.max(rect.height + vh * 0.2, 1);
      p = Math.max(0, Math.min(1, p));
      var n = words.length;
      words.forEach(function (w, i) {
        w.classList.toggle('is-on', (i + 1) / n <= p + 0.001);
      });
    }
    function queue() {
      if (!queued) { queued = true; window.requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    update();
  }

  /* ---------- In motion: story-style reel viewer ---------- */
  function bindReels() {
    var root = document.querySelector('.rv');
    if (!root) return;
    var video = root.querySelector('.rv-video');
    var thumbs = Array.prototype.slice.call(root.querySelectorAll('.rv-thumb'));
    var segs = Array.prototype.slice.call(root.querySelectorAll('.rv-seg'));
    var titleEl = document.getElementById('rvTitle');
    var midBtn = root.querySelector('.rv-mid');
    var likeBtn = root.querySelector('.rv-like');
    var followBtn = root.querySelector('.rv-follow');
    var stage = root.querySelector('.rv-stage');
    var n = thumbs.length;
    var current = 0;
    video.muted = true;

    function setPlayIcon(playing) {
      midBtn.setAttribute('aria-label', playing ? 'Pause clip' : 'Play clip');
    }

    function paint(pct) {
      segs.forEach(function (seg, k) {
        var fill = k < current ? 1 : (k === current ? pct : 0);
        seg.firstElementChild.style.transform = 'scaleX(' + fill.toFixed(3) + ')';
      });
    }

    function load(i, keepPlaying) {
      current = (i + n) % n;
      var t = thumbs[current];
      var wasPlaying = keepPlaying && !video.paused;
      video.poster = t.getAttribute('data-poster');
      video.setAttribute('aria-label', t.getAttribute('data-title'));
      video.src = t.getAttribute('data-src');
      video.load();
      titleEl.textContent = t.getAttribute('data-title');
      thumbs.forEach(function (x, k) {
        x.classList.toggle('is-active', k === current);
        x.setAttribute('aria-pressed', k === current ? 'true' : 'false');
      });
      paint(0);
      if (wasPlaying) { video.play().catch(function () { }); }
      setPlayIcon(!video.paused);
    }

    function play() { video.play().catch(function () { }); setPlayIcon(true); }
    function pause() { video.pause(); setPlayIcon(false); }

    video.addEventListener('timeupdate', function () {
      if (video.duration) paint(video.currentTime / video.duration);
    });
    video.addEventListener('ended', function () { load(current + 1, true); });

    root.querySelector('.rv-prev').addEventListener('click', function () { load(current - 1, true); });
    root.querySelector('.rv-next').addEventListener('click', function () { load(current + 1, true); });
    midBtn.addEventListener('click', function () {
      if (video.paused) {
        stage.setAttribute('data-user-paused', 'false');
        play();
      } else {
        stage.setAttribute('data-user-paused', 'true');
        pause();
      }
    });
    thumbs.forEach(function (t, k) {
      t.addEventListener('click', function () { load(k, true); });
    });
    likeBtn.addEventListener('click', function () {
      var on = !likeBtn.classList.contains('is-liked');
      likeBtn.classList.toggle('is-liked', on);
      likeBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    followBtn.addEventListener('click', function () {
      var on = !followBtn.classList.contains('is-following');
      followBtn.classList.toggle('is-following', on);
      followBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      followBtn.textContent = on ? 'Following' : 'Follow';
    });

    setPlayIcon(false);
    paint(0);

    /* Play while the reel is on screen; pause when it leaves. A visitor's own pause is kept. */
    if (!('IntersectionObserver' in window) || reduceMotion) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (stage.getAttribute('data-user-paused') !== 'true') play();
        } else {
          pause();
        }
      });
    }, { threshold: 0.5 });
    io.observe(stage);
  }

  /* ---------- Boot ---------- */
  function boot() {
    injectShared();
    bindToggles();
    bindMenu();
    bindScroll();
    bindForms();
    bindHeroPlayer();
    bindSoundLab();
    bindReviews();
    bindEventCards();
    bindStory();
    bindReels();
    bindChecklist();
    bindLoudness();
    bindSignal();
    bindEvents();
    bindDial();
    bindDropdown();
    bindMood();
    bindDateChips();
    bindFit();
    bindInclusions();
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
    initAOS();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* ---------- By the numbers: count-up on view (home 2) ---------- */
(function () {
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(end) || reduce) return;
    var start = null, dur = 1400;
    el.textContent = '0';
    function step(ts) {
      if (start === null) start = ts;
      var k = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { io.observe(el); });
  }
})();

/* ---------- The rig (stage plan): scroll-driven. Each piece comes on stage as its row crosses the focus line ---------- */
(function () {
  var root = document.querySelector('.sp');
  if (!root) return;
  var rows = Array.prototype.slice.call(root.querySelectorAll('.sp-row'));
  var tokens = Array.prototype.slice.call(root.querySelectorAll('.sp-token'));
  var countEl = root.querySelector('[data-rig-count]');
  var summary = root.querySelector('[data-rig-summary]');
  if (!rows.length) return;

  var FOCUS = 0.62;      // a row lights once it passes 62% of the viewport height
  var current = -1;      // how many pieces are on stage right now
  var ticking = false;

  function setOn(idx, on) {
    root.querySelectorAll('[data-idx="' + idx + '"]').forEach(function (el) {
      el.classList.toggle('is-on', on);
    });
  }

  function render(n) {
    if (n === current) return;
    current = n;
    rows.forEach(function (r, i) {
      var on = i < n;
      setOn(r.getAttribute('data-idx'), on);
      var ic = r.querySelector('.sp-state i');
      if (ic) ic.className = on ? 'fa-solid fa-check' : 'fa-solid fa-plus';
    });
    if (countEl) countEl.textContent = String(n);
    root.style.setProperty('--glow', (n / rows.length).toFixed(2));
    root.setAttribute('data-full', n === rows.length ? 'true' : 'false');
    if (summary) {
      if (!n) summary.textContent = 'Nothing on stage yet. Keep scrolling to start.';
      else if (n === rows.length) summary.textContent = 'Full rig. Nothing left out.';
      else summary.textContent = rows.slice(0, n).map(function (r) { return r.querySelector('strong').textContent; }).join(', ');
    }
  }

  function measure() {
    ticking = false;
    var line = window.innerHeight * FOCUS;
    var n = 0;
    // Rows sit in order, so the lit count is simply how many have crossed the line
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].getBoundingClientRect().top <= line) n = i + 1;
      else break;
    }
    render(n);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(measure);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  measure();
})();

/* ---------- Run of show: timeline fills in once it is on screen (home 2) ---------- */
(function () {
  var clock = document.querySelector('[data-clock]');
  if (!clock) return;
  if (!('IntersectionObserver' in window)) { clock.classList.add('is-on'); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        clock.classList.add('is-on');
        io.disconnect();
      }
    });
  }, { threshold: 0.35 });
  io.observe(clock);
})();
