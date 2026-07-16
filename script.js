lucide.createIcons();

// Loader — hides once the page is ready
const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  setTimeout(() => loader.classList.add('hidden'), 1200);
});

// Smooth scroll (Lenis)
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Anchor navigation via Lenis
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -20 });
  });
});

// Locomotive-style text reveal — wrap each word in a masked span
document.querySelectorAll('.anim-text').forEach((el) => {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map(
      (w, i) =>
        `<span class="anim-word-mask"><span class="anim-word" style="transition-delay:${i * 140}ms">${w}</span></span>`
    )
    .join(' ');
});

// Reveal on scroll — fade in when entering, fade out when leaving (don't stay)
const revealEls = document.querySelectorAll('[data-anim]');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => revealObserver.observe(el));

// Active nav link highlight
const sections = document.querySelectorAll('#about, #work, #contact');
const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
        const link = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  },
  { threshold: 0.5 }
);
sections.forEach((s) => navObserver.observe(s));

// Navbar scrolled state + scroll progress bar
const navbar = document.querySelector('.navbar');
const scrollBar = document.getElementById('scroll-bar');
lenis.on('scroll', ({ scroll, limit }) => {
  navbar.classList.toggle('scrolled', scroll > 40);
  const pct = limit > 0 ? (scroll / limit) * 100 : 0;
  scrollBar.style.width = pct + '%';
});

// Clock
const clockEl = document.getElementById('nav-clock');
function updateClock() {
  clockEl.textContent = new Date().toLocaleTimeString('en-GB');
}
updateClock();
setInterval(updateClock, 1000);

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Floating tags — constant idle drift + cursor avoidance (they run away from the pointer)
const tags = [...document.querySelectorAll('.floating-tag')].map((el, i) => ({
  el,
  phase: i * 2.1,      // offset so they don't bob in sync
  dodgeX: 0,
  dodgeY: 0,
}));

let pointer = { x: -9999, y: -9999 };
window.addEventListener('pointermove', (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
});
window.addEventListener('pointerleave', () => {
  pointer.x = -9999;
  pointer.y = -9999;
});

const AVOID_RADIUS = 130;   // how close the cursor gets before the tag flees
const AVOID_STRENGTH = 90;  // max push distance in px

function animateTags(t) {
  const time = t / 1000;
  tags.forEach((tag, i) => {
    const rect = tag.el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // vector from pointer to tag center
    const dx = cx - pointer.x;
    const dy = cy - pointer.y;
    const dist = Math.hypot(dx, dy);

    let targetX = 0;
    let targetY = 0;
    if (dist < AVOID_RADIUS) {
      const force = (1 - dist / AVOID_RADIUS) * AVOID_STRENGTH;
      const nx = dx / (dist || 1);
      const ny = dy / (dist || 1);
      targetX = nx * force;
      targetY = ny * force;
    }

    // ease toward the target dodge position, then spring back when cursor leaves
    tag.dodgeX += (targetX - tag.dodgeX) * 0.12;
    tag.dodgeY += (targetY - tag.dodgeY) * 0.12;

    // idle bobbing motion
    const bobX = Math.sin(time * 0.9 + tag.phase) * 8;
    const bobY = Math.cos(time * 1.1 + tag.phase) * 10;
    const rot = Math.sin(time * 0.7 + tag.phase) * 6 + tag.dodgeX * 0.08;

    tag.el.style.setProperty('--tx', (bobX + tag.dodgeX).toFixed(2) + 'px');
    tag.el.style.setProperty('--ty', (bobY + tag.dodgeY).toFixed(2) + 'px');
    tag.el.style.setProperty('--rot', rot.toFixed(2) + 'deg');

    tag.el.classList.toggle('dodging', dist < AVOID_RADIUS);
  });
  requestAnimationFrame(animateTags);
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (tags.length && !reduceMotion) requestAnimationFrame(animateTags);

// Contact form — sends via Formspree, no backend needed
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
const submitBtn = document.getElementById('form-submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  statusEl.textContent = 'Sending...';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      statusEl.textContent = 'Message sent — thanks!';
      form.reset();
    } else {
      statusEl.textContent = 'Something went wrong. Try again or email me directly.';
    }
  } catch (err) {
    statusEl.textContent = 'Network error. Try again or email me directly.';
  }

  submitBtn.disabled = false;
});
