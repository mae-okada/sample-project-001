const scene = document.querySelector('[data-scene]');
const frame = scene.querySelector('.hero-frame');
const apple = scene.querySelector('.apple');
const canvas = scene.querySelector('.tree');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 57rem)');
let fall;
let observer;
let queued = 0;
let mobilePlayed = false;

function paintOrchard(width, height) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const density = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * density);
  canvas.height = Math.round(height * density);
  ctx.setTransform(canvas.width / 1000, 0, 0, canvas.height / 700, 0, 0);
  let seed = 2701;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  // Distant rows use softer silhouettes than the foreground bough.
  for (let layer = 0; layer < 3; layer++) {
    ctx.fillStyle = ['#6d876b', '#476e59', '#274938'][layer];
    ctx.beginPath();
    ctx.moveTo(0, 700);
    for (let x = -10; x <= 1010; x += 10) {
      ctx.lineTo(x, 480 + layer * 65 + Math.sin(x / 160 + layer) * 30 - random() * 9);
    }
    ctx.lineTo(1010, 700);
    ctx.fill();
  }
  function branch(x, y, length, angle, depth) {
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    ctx.strokeStyle = depth > 3 ? '#3d4230' : '#51553b';
    ctx.lineWidth = Math.pow(1.62, depth);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + (endX-x)*.55, y + (endY-y)*.34, endX, endY);
    ctx.stroke();
    if (depth > 0) {
      branch(endX, endY, length * (.65 + random()*.12), angle - .31 - random()*.35, depth-1);
      branch(endX, endY, length * (.62 + random()*.17), angle + .26 + random()*.39, depth-1);
    } else {
      for (let leaf = 0; leaf < 9; leaf++) {
        ctx.fillStyle = ['#426149','#54734d','#688652','#83965b'][leaf % 4];
        ctx.beginPath();
        ctx.ellipse(endX + random()*42-21, endY + random()*28-14, 7+random()*9, 3+random()*4, random()*3, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }
  branch(1015, 690, 205, -1.69, 7);
  // End the fruiting spur at the stem of the animated apple.
  ctx.strokeStyle = '#484735';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(977, 396);
  ctx.quadraticCurveTo(927, 208, 826, 174);
  ctx.quadraticCurveTo(785, 151, 760 + apple.offsetWidth * 450 / width, 196 - apple.offsetHeight * 105 / height);
  ctx.stroke();
}

function syncScroll() {
  queued = 0;
  const travel = scene.offsetHeight - frame.offsetHeight;
  if (fall && travel > 0) fall.currentTime = 1800 * Math.max(0, Math.min(1, -scene.getBoundingClientRect().top / travel));
}
function requestScroll() {
  if (!queued) queued = requestAnimationFrame(syncScroll);
}
function prepare() {
  const width = frame.clientWidth;
  const height = frame.clientHeight;
  paintOrchard(width, height);
  observer?.disconnect();
  fall?.cancel();
  window.removeEventListener('scroll', requestScroll);
  cancelAnimationFrame(queued);
  queued = 0;
  const moving = !reduced.matches && typeof apple.animate === 'function';
  document.documentElement.classList.toggle('motion', moving && desktop.matches);
  if (!moving) return;
  const poses = [
    [0, 0, 0, 0], [.16, 0, 0, -18], [.24, 0, .01, 12],
    [.70, -.06, .62, -124], [.82, -.08, .54, -155],
    [.94, -.10, .62, -177], [1, -.11, .61, -186]
  ];
  fall = apple.animate(poses.map(([offset, x, y, angle], index) => ({
    offset, transform: 'translate(' + x*width + 'px,' + y*height + 'px) rotate(' + angle + 'deg)',
    easing: [2,4].includes(index) ? 'ease-in' : 'ease-out'
  })), {duration: 1800, fill: 'both'});
  fall.pause();
  if (desktop.matches) {
    window.addEventListener('scroll', requestScroll, {passive:true});
    syncScroll();
  } else if (mobilePlayed) {
    fall.finish();
  } else if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        mobilePlayed = true;
        fall.play();
        observer.disconnect();
      }
    });
    observer.observe(frame);
  }
}
new ResizeObserver(prepare).observe(frame);
desktop.addEventListener('change', prepare);
reduced.addEventListener('change', prepare);

if ('IntersectionObserver' in window) {
  const entrances = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('arrive');
        entrances.unobserve(entry.target);
      }
    }
  }, {threshold: .15});
  document.querySelectorAll('.card, .feature-art, .section-heading').forEach(element => entrances.observe(element));
}
document.getElementById('year').textContent = new Date().getFullYear();
