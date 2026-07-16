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
        `<span class="anim-word-mask"><span class="anim-word" style="transition-delay:${i * 60}ms">${w}</span></span>`
    )
    .join(' ');
});

// Reveal on scroll — handles both .anim-text (words) and generic [data-anim]
const revealEls = document.querySelectorAll('[data-anim]');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
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
