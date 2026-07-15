// script.js

// Icons
lucide.createIcons();

// Loading screen
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPercent = document.getElementById('loader-percent');

let progress = 0;
const loadInterval = setInterval(() => {
  progress += Math.random() * 14;
  if (progress >= 100) {
    progress = 100;
    clearInterval(loadInterval);
    setTimeout(() => loader.classList.add('hidden'), 400);
  }
  loaderBar.style.width = progress + '%';
  loaderPercent.textContent = Math.floor(progress) + '%';
}, 150);

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

// Nav links scroll smoothly to their section
document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    lenis.scrollTo(target, { offset: -20 });
  });
});

// Highlight the active nav link based on which section is in view
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

// Fade in AND out as you scroll past — no more "only once"
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

// Live clock, top-right of nav
const clockEl = document.getElementById('nav-clock');
function updateClock() {
  clockEl.textContent = new Date().toLocaleTimeString('en-GB'); // HH:MM:SS
}
updateClock();
setInterval(updateClock, 1000);