const scene = document.querySelector('[data-scene]');
const frame = scene.querySelector('.hero-frame');
const motionPreference = window.matchMedia('(min-width: 57rem) and (prefers-reduced-motion: no-preference)');
let pendingFrame = 0;

const canvas = scene.querySelector('.threads');
const context = canvas.getContext('2d');
let lastProgress;
const colours = ['#79ffe1', '#81bfff', '#ffd092'];

// Project three separate ribbons onto the same crossing, then fan them apart.
function drawThreads(progress) {
  if (!context) return;
  const width = frame.clientWidth;
  const height = frame.clientHeight;
  const density = Math.min(window.devicePixelRatio || 1, 2);
  const pixelsWide = Math.round(width * density);
  const pixelsHigh = Math.round(height * density);
  const resized = canvas.width !== pixelsWide || canvas.height !== pixelsHigh;
  if (!resized && lastProgress === progress) return;
  lastProgress = progress;
  if (resized) {
    canvas.width = pixelsWide;
    canvas.height = pixelsHigh;
  }
  context.setTransform(density, 0, 0, density, 0, 0);
  context.clearRect(0, 0, width, height);
  const phase = progress * Math.PI * 1.8;
  colours.forEach((colour, band) => {
    context.strokeStyle = colour;
    context.fillStyle = colour;
    for (let strand = 0; strand < 10; strand++) {
      context.beginPath();
      for (let step = 0; step <= 96; step++) {
        const t = step / 96;
        const angle = t * 7 + phase + band * 2.094 + strand * .044;
        const x = width * (.23 + t * .84);
        const y = height * (.85 - t * .50 + Math.sin(angle) * (.04 + t * .19)
          + Math.cos(t * 5 - phase) * .10 + strand * .0018);
        if (step === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
        if (strand === 4 && step % 12 === 0) {
          context.globalAlpha = .85;
          context.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
      }
      context.lineWidth = strand === 4 ? 1.8 : .8;
      context.globalAlpha = strand === 4 ? .95 : .36;
      context.stroke();
    }
  });
  context.globalAlpha = 1;
}

function paintScene() {
  pendingFrame = 0;
  const distance = scene.offsetHeight - frame.offsetHeight;
  const progress = motionPreference.matches && distance > 0
    ? Math.min(1, Math.max(0, -scene.getBoundingClientRect().top / distance))
    : 0;

  drawThreads(progress);
  frame.style.setProperty('--landscape-scale', String(1.02 + progress * 0.95));
}

function schedulePaint() {
  if (!pendingFrame) pendingFrame = window.requestAnimationFrame(paintScene);
}

function syncMotionPreference() {
  document.documentElement.classList.toggle('motion', motionPreference.matches);
  if (motionPreference.matches) {
    window.addEventListener('scroll', schedulePaint, { passive: true });
    schedulePaint();
    return;
  }

  window.removeEventListener('scroll', schedulePaint);
  window.cancelAnimationFrame(pendingFrame);
  pendingFrame = 0;
  frame.style.removeProperty('--landscape-scale');
  drawThreads(0);
}

window.addEventListener('resize', schedulePaint);
motionPreference.addEventListener('change', syncMotionPreference);
syncMotionPreference();

document.getElementById('year').textContent = new Date().getFullYear();
