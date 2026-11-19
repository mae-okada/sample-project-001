const scene = document.querySelector('[data-scene]');
const frame = scene.querySelector('.hero-frame');
const motionPreference = window.matchMedia('(min-width: 57rem) and (prefers-reduced-motion: no-preference)');
let pendingFrame = 0;

function paintScene() {
  pendingFrame = 0;
  const distance = scene.offsetHeight - frame.offsetHeight;
  const progress = distance > 0
    ? Math.min(1, Math.max(0, -scene.getBoundingClientRect().top / distance))
    : 0;

  frame.style.setProperty('--landscape-scale', String(1.02 + progress * 0.17));
}

function schedulePaint() {
  if (!pendingFrame) pendingFrame = window.requestAnimationFrame(paintScene);
}

function syncMotionPreference() {
  document.documentElement.classList.toggle('motion', motionPreference.matches);
  if (motionPreference.matches) {
    window.addEventListener('scroll', schedulePaint, { passive: true });
    window.addEventListener('resize', schedulePaint);
    schedulePaint();
    return;
  }

  window.removeEventListener('scroll', schedulePaint);
  window.removeEventListener('resize', schedulePaint);
  window.cancelAnimationFrame(pendingFrame);
  pendingFrame = 0;
  frame.style.removeProperty('--landscape-scale');
}

motionPreference.addEventListener('change', syncMotionPreference);
syncMotionPreference();

document.getElementById('year').textContent = new Date().getFullYear();
