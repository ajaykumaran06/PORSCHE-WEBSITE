/* ═══════════════════════════════════════════════════════
   PORSCHE WEBSITE — JavaScript
   Taste-Skill: MOTION_INTENSITY: 6
   - Scroll-aware nav
   - IntersectionObserver reveals
   - Magnetic buttons (mouse physics)
   - Hero parallax
   - Timeline animated entries
   - Color swatch switcher
   - Mobile menu
   - Number counter animations
═══════════════════════════════════════════════════════ */

'use strict';

/* ── Utility: throttle ── */
function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
}

/* ── Utility: clamp ── */
function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

/* ══════════════════════════════════
   1. SCROLL-AWARE NAVIGATION
══════════════════════════════════ */
(function initNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const onScroll = throttle(() => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, 50);

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ══════════════════════════════════
   2. MOBILE MENU TOGGLE
══════════════════════════════════ */
(function initMobileMenu() {
  const btn = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const links = menu ? menu.querySelectorAll('a') : [];
  if (!btn || !menu) return;

  let open = false;

  function toggle() {
    open = !open;
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';

    // Animate hamburger → X
    const spans = btn.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(3.5px) rotate(45deg)';
      spans[1].style.transform = 'translateY(-3.5px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.transform = '';
    }
  }

  btn.addEventListener('click', toggle);
  links.forEach(a => a.addEventListener('click', () => { if (open) toggle(); }));
})();

/* ══════════════════════════════════
   3. SCROLL REVEAL (IntersectionObserver)
══════════════════════════════════ */
(function initScrollReveal() {
  // Add .reveal class to target elements
  const targets = [
    '#models-tag', '#models-title', '#models-desc',
    '#models-grid',
    '#perf-tag', '#perf-title', '#perf-body-1', '#perf-body-2', '#perf-metrics', '#perf-cta',
    '#heritage-tag', '#heritage-title', '#heritage-body',
    '#exp-tag', '#exp-title', '#exp-body', '#btn-configurator',
    '#config-card',
    '.model-card',
    '.metric',
  ];

  targets.forEach((sel, i) => {
    const els = document.querySelectorAll(sel);
    els.forEach((el, j) => {
      el.classList.add('reveal');
      // stagger sibling elements
      if (els.length > 1) {
        el.style.transitionDelay = `${j * 0.1}s`;
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════
   4. TIMELINE — OBSERVER
══════════════════════════════════ */
(function initTimeline() {
  const items = document.querySelectorAll('.timeline-item');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -20px 0px' });

  items.forEach(item => observer.observe(item));
})();

/* ══════════════════════════════════
   5. HERO ENTRANCE
══════════════════════════════════ */
(function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  // Trigger subtle zoom-out on the hero image
  setTimeout(() => hero.classList.add('loaded'), 100);
})();

/* ══════════════════════════════════
   6. HERO PARALLAX (scroll)
══════════════════════════════════ */
(function initHeroParallax() {
  const heroImg = document.querySelector('.hero__img');
  const heroContent = document.querySelector('.hero__content');
  if (!heroImg) return;

  // Only on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const onScroll = throttle(() => {
    const scrollY = window.scrollY;
    const progress = clamp(scrollY / window.innerHeight, 0, 1);
    heroImg.style.transform = `scale(1) translateY(${progress * 15}%)`;
    if (heroContent) {
      heroContent.style.transform = `translateY(${progress * 60}px)`;
      heroContent.style.opacity = 1 - progress * 1.8;
    }
  }, 16);

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ══════════════════════════════════
   7. MAGNETIC BUTTON EFFECT
══════════════════════════════════ */
(function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;

  const btns = document.querySelectorAll('.btn--primary, .btn--outline');

  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.28;
      const dy = (e.clientY - cy) * 0.28;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ══════════════════════════════════
   8. ANIMATED COUNTER (spec bar)
══════════════════════════════════ */
(function initCounters() {
  const values = document.querySelectorAll('.hero__spec-value');
  if (!values.length) return;

  const targets = [];
  values.forEach(el => {
    const raw = el.textContent.trim();
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
    const prefix = raw.match(/^[^0-9]*/)?.[0] || '';
    const suffix = raw.match(/[^0-9.]+$/)?.[0] || '';
    if (!isNaN(num)) {
      targets.push({ el, start: 0, end: num, prefix, suffix });
      el.textContent = prefix + '0' + suffix;
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      targets.forEach(({ el, start, end, prefix, suffix }) => {
        const duration = 1200;
        const startTime = performance.now();
        function update(now) {
          const t = clamp((now - startTime) / duration, 0, 1);
          const ease = 1 - Math.pow(1 - t, 4); // easeOutQuart
          const val = start + (end - start) * ease;
          el.textContent = prefix + (Number.isInteger(end) ? Math.round(val) : val.toFixed(1)) + suffix;
          if (t < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      });
      observer.disconnect();
    });
  }, { threshold: 0.5 });

  const specBar = document.querySelector('.hero__spec-bar');
  if (specBar) observer.observe(specBar);
})();

/* ══════════════════════════════════
   9. COLOR SWATCH SWITCHER
══════════════════════════════════ */
(function initColorSwatches() {
  const swatches = document.querySelectorAll('.color-swatch');
  const colors = {
    'swatch-red': { name: 'Guards Red', price: '€ 134,580' },
    'swatch-night': { name: 'Night Blue', price: '€ 136,200' },
    'swatch-silver': { name: 'Chalk Silver', price: '€ 133,900' },
    'swatch-green': { name: 'Python Green', price: '€ 137,490' },
  };

  const interiorEl = document.querySelector('.config-row:nth-child(3) .config-val');
  const priceEl = document.querySelector('.config-val--price');

  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      sw.classList.add('active');

      const data = colors[sw.id];
      if (!data) return;

      // animate price change
      if (priceEl) {
        priceEl.style.opacity = '0';
        priceEl.style.transform = 'translateY(-6px)';
        setTimeout(() => {
          priceEl.textContent = data.price;
          priceEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          priceEl.style.opacity = '1';
          priceEl.style.transform = '';
        }, 200);
      }
    });
  });
})();

/* ══════════════════════════════════
   10. SMOOTH ANCHOR SCROLL
══════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ══════════════════════════════════
   11. MODEL CARD TILT
══════════════════════════════════ */
(function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.model-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) scale(1.015)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => { card.style.transition = ''; }, 600);
    });
  });
})();

/* ══════════════════════════════════
   12. CURSOR SPOTLIGHT (subtle)
══════════════════════════════════ */
(function initSpotlight() {
  if (window.matchMedia('(hover: none)').matches) return;

  const spotlight = document.createElement('div');
  spotlight.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 998;
    width: 380px;
    height: 380px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(155,26,26,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity 0.4s ease;
    top: 0; left: 0;
  `;
  document.body.appendChild(spotlight);

  let cx = -999, cy = -999;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    cx = e.clientX;
    cy = e.clientY;
  });

  function loop() {
    spotlight.style.left = cx + 'px';
    spotlight.style.top = cy + 'px';
    rafId = requestAnimationFrame(loop);
  }
  loop();

  document.addEventListener('mouseleave', () => { spotlight.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { spotlight.style.opacity = '1'; });
})();

/* ══════════════════════════════════
   13. MARQUEE PAUSE ON HOVER
══════════════════════════════════ */
(function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  track.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });
  track.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });
})();

/* ══════════════════════════════════
   14. PERFORMANCE STAT COUNTER
══════════════════════════════════ */
(function initPerfStat() {
  const statEl = document.querySelector('.performance__stat-value');
  if (!statEl) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const target = 9000;
      const duration = 1400;
      const start = performance.now();

      function update(now) {
        const t = clamp((now - start) / duration, 0, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        statEl.textContent = Math.round(ease * target).toLocaleString();
        if (t < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.disconnect();
    });
  }, { threshold: 0.5 });

  observer.observe(statEl);
})();

console.log('%cPORSCHE', 'font-size:2rem;font-weight:900;letter-spacing:0.15em;color:#9b1a1a');
console.log('%cDriven by Dreams.', 'font-family:monospace;color:#888;font-size:0.75rem;letter-spacing:0.15em');

/* ══════════════════════════════════
   15. PORSCHE CONFIGURATOR LOGIC
══════════════════════════════════ */
window.configState = {
  model: '911 Carrera',
  exteriorColor: 'Carrara White',
  interiorColor: 'Standard Black',
  wheels: '19-inch Carrera',
  basePrice: 124580,
  optionsPrice: 0,
  totalPrice: 124580
};

const modelData = {
  '911 Carrera': { basePrice: 124580, specs: '3.7s 0-100 km/h · 450 hp', img: 'hero.png' },
  'Taycan': { basePrice: 92100, specs: '2.8s 0-100 km/h · 761 hp', img: 'taycan.png' },
  '718 Cayman': { basePrice: 68400, specs: '3.4s 0-100 km/h · 500 hp', img: 'cayman.png' },
  'Panamera': { basePrice: 112000, specs: '3.1s 0-100 km/h · 630 hp', img: 'panamera.png' },
  'Macan': { basePrice: 75000, specs: '4.5s 0-100 km/h · 440 hp', img: 'macan.png' },
  'Cayenne': { basePrice: 89000, specs: '3.3s 0-100 km/h · 640 hp', img: 'cayenne.png' }
};

window.openConfigurator = function () {
  const modal = document.getElementById('config-modal');
  const backdrop = document.getElementById('config-backdrop');
  if (!modal) return;
  modal.style.display = 'block';
  setTimeout(() => {
    modal.classList.add('open');
    backdrop.classList.add('open');
  }, 10);
  document.body.style.overflow = 'hidden';
};

window.closeConfigurator = function () {
  const modal = document.getElementById('config-modal');
  const backdrop = document.getElementById('config-backdrop');
  if (!modal) return;
  modal.classList.remove('open');
  backdrop.classList.remove('open');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 600);
  document.body.style.overflow = '';
};

window.showConfigTab = function (tabId, event) {
  document.querySelectorAll('.config-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.config-panel').forEach(p => p.classList.remove('active'));

  const target = event?.currentTarget || event?.target;
  if (target) target.classList.add('active');
  document.getElementById('panel-' + tabId).classList.add('active');
};

window.selectModel = function (modelName, event) {
  configState.model = modelName;
  configState.basePrice = modelData[modelName].basePrice;

  document.getElementById('config-display-model').textContent = modelName;
  document.getElementById('config-display-specs').textContent = modelData[modelName].specs;
  document.getElementById('config-preview-img').src = modelData[modelName].img;

  updateConfigUI('model', event?.currentTarget || event?.target);
};

window.selectColor = function (colorName, price, event) {
  configState.exteriorColor = colorName;
  document.getElementById('selected-color-name').textContent = colorName;

  const img = document.getElementById('config-preview-img');
  const colors = {
    'Carrara White': 'brightness(1.1)',
    'Jet Black': 'brightness(0.5) contrast(1.2)',
    'Guards Red': 'sepia(1) saturate(5) hue-rotate(-50deg)',
    'Gentian Blue': 'sepia(1) saturate(3) hue-rotate(180deg) brightness(0.7)',
    'Python Green': 'sepia(1) saturate(4) hue-rotate(80deg)',
    'Chalk': 'sepia(0.2) brightness(0.9) grayscale(0.5)',
    'Racing Yellow': 'sepia(1) saturate(5) hue-rotate(10deg)',
    'Shark Blue': 'sepia(1) saturate(4) hue-rotate(160deg)'
  };
  img.style.filter = colors[colorName] || 'none';

  updateConfigUI('color', event?.currentTarget || event?.target, price);
};

window.selectInterior = function (name, price, event) {
  configState.interiorColor = name;
  updateConfigUI('interior', event?.currentTarget || event?.target, price);
};

window.selectWheels = function (name, price, event) {
  configState.wheels = name;
  updateConfigUI('wheels', event?.currentTarget || event?.target, price);
};

function updateConfigUI(type, element, optionPrice = 0) {
  if (!element) return;
  if (type === 'color') {
    element.parentElement.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
  } else {
    element.parentElement.querySelectorAll('.config-option').forEach(o => o.classList.remove('active'));
  }
  element.classList.add('active');
  calculateTotal();
}

function calculateTotal() {
  const modelBase = modelData[configState.model].basePrice;
  let totalOptions = 0;
  document.querySelectorAll('.config-option.active .option-price, .color-circle.active').forEach(el => {
    const priceText = el.querySelector('.option-price')?.textContent || '0';
    const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
    totalOptions += price;
  });

  configState.totalPrice = modelBase + totalOptions;
  document.getElementById('config-total-price').textContent = '€ ' + configState.totalPrice.toLocaleString();
}

document.getElementById('nav-configure')?.addEventListener('click', (e) => { e.preventDefault(); openConfigurator(); });
document.getElementById('mob-configure')?.addEventListener('click', (e) => { e.preventDefault(); openConfigurator(); });
document.getElementById('hero-configure')?.addEventListener('click', (e) => { e.preventDefault(); openConfigurator(); });
document.getElementById('btn-configurator')?.addEventListener('click', (e) => { e.preventDefault(); openConfigurator(); });

/* ══════════════════════════════════
   16. INFO MODAL LOGIC
   Handles deep dive and model info
══════════════════════════════════ */
const infoContent = {
  'engineering': {
    tag: 'Innovation / Engineering',
    title: 'Porsche Engineering Philosophy',
    body: `
      <p class="body-text" style="color: var(--text-primary); margin-bottom: 1rem;">Engineering at Porsche is more than just technical data; it's a relentless pursuit of the perfect synergy between driver and machine.</p>
      <p class="body-text">Every Boxer engine is built on the principle of a low center of gravity, ensuring unparalleled cornering stability. Our PDK (Porsche Doppelkupplung) transmission enables gear changes in milliseconds, faster than a human heartbeat, ensuring there is zero interruption in the flow of power.</p>
      <div style="margin-top: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="glass-card" style="padding: 1rem; border: 1px solid var(--border);">
          <span class="mono" style="display:block; color: var(--accent-warm); margin-bottom: 0.5rem;">Materials</span>
          <p style="font-size: 0.82rem; color: var(--text-secondary);">Intelligent lightweight construction using aluminum and high-strength steels.</p>
        </div>
        <div class="glass-card" style="padding: 1rem; border: 1px solid var(--border);">
          <span class="mono" style="display:block; color: var(--accent-warm); margin-bottom: 0.5rem;">Testing</span>
          <p style="font-size: 0.82rem; color: var(--text-secondary);">Over 10,000 km of high-speed endurance testing at the Nürburgring.</p>
        </div>
      </div>
    `
  },
  '911': {
    tag: 'Icon / Heritage',
    title: 'The Soul of the 911',
    body: `
      <p class="body-text" style="color: var(--text-primary); margin-bottom: 1rem;">Since 1963, the 911 has been the heart of the Porsche brand. It is the yardstick for all other sports cars.</p>
      <p class="body-text">The silhouette is unmistakable. The rear-engine layout is unique. It combines track-ready performance with daily usability unlike any other machine in existence. The 2025 lineup features enhanced aerodynamics and a digitized interior that stays true to its analog roots.</p>
      <ul style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem; list-style: disc; padding-left: 1.2rem;">
        <li>Rear-mounted Twin-turbo flat-six engine</li>
        <li>Active Suspension Management (PASM)</li>
        <li>Classic 5-dial instrument cluster (digital)</li>
      </ul>
    `
  },
  'taycan': {
    tag: 'Future / Electric',
    title: 'Taycan: Electric Performance',
    body: `
      <p class="body-text" style="color: var(--text-primary); margin-bottom: 1rem;">The Taycan is the first all-electric sports car with the soul of a Porsche.</p>
      <p class="body-text">Powered by an 800-volt system instead of the usual 400 volts, it offers reproducible high performance and minimal charging times. Its design follows the Porsche DNA: clear, expressive, and timeless—but with a silhouette that whispers "future".</p>
      <div style="margin-top: 1.5rem; background: var(--bg-2); padding: 1.5rem; border-radius: 4px;">
        <span class="mono" style="color: var(--accent-light);">Performance Data</span>
        <div style="display: flex; justify-content: space-between; margin-top: 1rem;">
          <div><span style="font-size: 1.2rem; font-weight: 700; display:block;">2.8s</span><span class="mono">0-100 km/h</span></div>
          <div><span style="font-size: 1.2rem; font-weight: 700; display:block;">800V</span><span class="mono">Architecture</span></div>
        </div>
      </div>
    `
  },
  'cayman': {
    tag: 'Purist / Mid-Engine',
    title: '718 Cayman: Center of Gravity',
    body: `
      <p class="body-text" style="color: var(--text-primary); margin-bottom: 1rem;">The 718 Cayman is built for the sport of it. It’s a mid-engine roadster with a legendary past.</p>
      <p class="body-text">Having the engine behind the driver but in front of the rear axle provides a balance that makes every curve feel like it was designed for you. It’s a machine that values agility and precision over raw power alone, though it has plenty of both.</p>
      <p class="body-text" style="margin-top: 1rem;">Every shift of the steering wheel is translated into immediate action, creating a direct connection between you and the asphalt.</p>
    `
  },
  'macan': {
    tag: 'Versatile / Performance',
    title: 'Macan: The Dynamic SUV',
    body: `
      <p class="body-text" style="color: var(--text-primary); margin-bottom: 1rem;">The Macan is the compact SUV that combines everyday usability with the heart of a sports car.</p>
      <p class="body-text">With its precise steering and lightning-fast gear changes, it offers an engaging driving experience that defies its size. The 2025 Macan range introduces the all-electric Macan, setting new standards for E-performance in the SUV segment.</p>
    `
  },
  'panamera': {
    tag: 'Luxury / Performance',
    title: 'Panamera: Courage Changes Everything',
    body: `
      <p class="body-text" style="color: var(--text-primary); margin-bottom: 1rem;">The Panamera is a luxury sedan that refuses to compromise on sports car performance.</p>
      <p class="body-text">Whether you are driving or being driven, the Panamera offers a unique combination of comfort and typical Porsche dynamics. It's designed for those who want the luxury of four seats without losing the thrill of a 911.</p>
    `
  },
  'about': {
    tag: 'Brand / Vision',
    title: 'About Porsche',
    body: `
      <p class="body-text" style="color: var(--text-primary); margin-bottom: 1rem;">Founded in 1931 by Ferdinand Porsche, we are a brand built on the pursuit of dreams.</p>
      <p class="body-text">Our philosophy "Driven by Dreams" means we are constantly innovating to create the most emotional driving experiences possible. We don't just build cars; we create icons that transcend generations.</p>
    `
  },
  'history': {
    tag: 'Legacy / Timeline',
    title: 'Our History',
    body: `
      <p class="body-text" style="color: var(--text-primary); margin-bottom: 1rem;">From the 356 "No. 1" Roadster to the cutting-edge Taycan, Porsche's history is a timeline of victory and innovation.</p>
      <p class="body-text">We have secured over 30,000 racing victories, including multiple wins at the 24 Hours of Le Mans. Every victory on the track is a lesson applied to our production cars on the road.</p>
    `
  },
  'motorsport': {
    tag: 'Racing / DNA',
    title: 'Motorsport DNA',
    body: `
      <p class="body-text" style="color: var(--text-primary); margin-bottom: 1rem;">Motorsport is the laboratory where we test our wildest ideas before they reach your driveway.</p>
      <p class="body-text">Whether it's Formula E or customer racing, Porsche is always competing. We believe that competition breeds better engineering, better efficiency, and ultimately, a better drive.</p>
    `
  },
  'sustainability': {
    tag: 'Responsibility / Future',
    title: 'Sustainability Journey',
    body: `
      <p class="body-text" style="color: var(--text-primary); margin-bottom: 1rem;">We aim to be CO2-neutral across the entire value chain for our new vehicles by 2030.</p>
      <p class="body-text">From eFuels to the electrification of our entire model range, Porsche is committed to preserving the joy of driving for future generations while respecting our planet.</p>
    `
  }
};

window.showInfo = function (id, event) {
  if (event) event.preventDefault();
  const content = infoContent[id];
  if (!content) return;

  document.getElementById('info-tag').textContent = content.tag;
  document.getElementById('info-title').textContent = content.title;
  document.getElementById('info-body').innerHTML = content.body;

  const modal = document.getElementById('info-modal');
  const backdrop = document.getElementById('info-backdrop');

  modal.style.display = 'block';
  setTimeout(() => {
    modal.classList.add('open');
    backdrop.classList.add('open');
  }, 10);
  document.body.style.overflow = 'hidden';
};

window.closeInfo = function () {
  const modal = document.getElementById('info-modal');
  const backdrop = document.getElementById('info-backdrop');
  if (!modal) return;
  modal.classList.remove('open');
  backdrop.classList.remove('open');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 400);
  document.body.style.overflow = '';
};
