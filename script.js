lucide.createIcons();

// Loader — hides once the page is ready, walking guy plays regardless
const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  setTimeout(() => loader.classList.add('hidden'), 1200);
});

// Smooth scroll
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

document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    lenis.scrollTo(target, { offset: -20 });
  });
});

const sections = document.querySelectorAll('#about, #contact');
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

const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => revealObserver.observe(el));

const clockEl = document.getElementById('nav-clock');
function updateClock() {
  clockEl.textContent = new Date().toLocaleTimeString('en-GB');
}
updateClock();
setInterval(updateClock, 1000);

// Contact form — sends via Formspree, no backend server needed
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