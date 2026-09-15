class ParticlesSystem {
  constructor() {
    this.canvas = document.getElementById('particles-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.raf = 0;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init(); this.setupEventListeners();
    if (this.reduced) this.render();
    else this.animate();
  }
  count() {
    return Math.min(120, Math.max(24, Math.floor((this.canvas.width * this.canvas.height) / 15000)));
  }
  init() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.particles = [];
    const n = this.count();
    for (let i = 0; i < n; i++) this.particles.push(new Particle(this.canvas));
  }
  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      const nc = this.count();
      const diff = nc - this.particles.length;
      if (diff > 0) for (let i = 0; i < diff; i++) this.particles.push(new Particle(this.canvas));
      else if (diff < 0) this.particles.splice(0, Math.abs(diff));
      if (this.reduced) this.render();
    });
    window.addEventListener('mousemove', e => { this.mouse.x = e.x; this.mouse.y = e.y; });
    window.addEventListener('mouseout', () => { this.mouse.x = null; this.mouse.y = null; });
    window.addEventListener('touchstart', e => {
      const t = e.touches[0];
      this.mouse.x = t.clientX; this.mouse.y = t.clientY;
    }, { passive: true });
    window.addEventListener('touchmove', e => {
      const t = e.touches[0];
      this.mouse.x = t.clientX; this.mouse.y = t.clientY;
    }, { passive: true });
    window.addEventListener('touchend', () => { this.mouse.x = null; this.mouse.y = null; });
    document.addEventListener('visibilitychange', () => {
      if (this.reduced) return;
      if (document.hidden) cancelAnimationFrame(this.raf);
      else this.animate();
    });
  }
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach((p, i) => {
      p.update(this.mouse); p.draw(this.ctx);
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[j].x - p.x, dy = this.particles[j].y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          const op = (1 - dist/120) * 0.5;
          this.ctx.strokeStyle = 'rgba(220,228,245,' + op + ')';
          this.ctx.lineWidth = 0.6;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    });
  }
  animate() {
    this.render();
    this.raf = requestAnimationFrame(() => this.animate());
  }
}
class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.5; this.speedY = (Math.random() - 0.5) * 0.5;
    this.baseX = this.x; this.baseY = this.y;
  }
  update(mouse) {
    if (mouse.x != null) {
      const dx = mouse.x - this.x, dy = mouse.y - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < mouse.radius) {
        const f = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx/dist)*f*4; this.y -= (dy/dist)*f*4;
      }
    }
    this.x += (this.baseX - this.x) * 0.05; this.y += (this.baseY - this.y) * 0.05;
    this.baseX += this.speedX; this.baseY += this.speedY;
    if (this.baseX < 0 || this.baseX > this.canvas.width) this.speedX *= -1;
    if (this.baseY < 0 || this.baseY > this.canvas.height) this.speedY *= -1;
  }
  draw(ctx) {
    ctx.fillStyle = 'rgba(225,232,248,0.85)';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill();
  }
}

window.addEventListener('load', () => { new ParticlesSystem(); });

const header = document.getElementById('main-header');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const cur = window.scrollY;
  if (cur > 20) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
  if (cur > lastScroll && cur > 100) header.classList.add('header-hidden');
  else header.classList.remove('header-hidden');
  lastScroll = cur <= 0 ? 0 : cur;
}, { passive: true });

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

const gridObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.card-stagger').forEach(card => card.classList.add('visible'));
      gridObs.unobserve(e.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

document.querySelectorAll('.skills-grid, .projects-grid, .stack-grid').forEach(grid => gridObs.observe(grid));

document.querySelectorAll('#hero .fade-up').forEach(el => {
  setTimeout(() => el.classList.add('visible'), 120);
});

setTimeout(() => {
  const lines = document.querySelectorAll('#terminalCode > div');
  lines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateY(10px)';
    line.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    setTimeout(() => { line.style.opacity = '1'; line.style.transform = 'none'; }, i * 80);
  });
}, 200);

const typeTarget = document.getElementById('typeTarget');
if (typeTarget && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const typeTokens = [
    ['message', 'c-fn'],
    ['(', 'c-op'],
    ['F.text', 'c-plain'],
    [' == ', 'c-op'],
    ['"', 'c-str'],
    ['WORD', 'c-str'],
    ['"', 'c-str'],
    [')', 'c-op']
  ];
  const typeWords = ['Купить', 'Продать', 'Заказать', 'Предложить'];
  let typeBase = 0;
  for (const t of typeTokens) {
    if (t[0] === 'WORD') break;
    typeBase += t[0].length;
  }
  let typeWi = 0;
  let typeN = 0;
  const typeLen = () => typeBase + typeWords[typeWi].length + 2;
  function typePaint() {
    let out = '';
    let rest = typeN;
    for (const t of typeTokens) {
      if (rest <= 0) break;
      const s = t[0] === 'WORD' ? typeWords[typeWi] : t[0];
      const take = s.slice(0, rest);
      if (take) out += '<span class="' + t[1] + '">' + take + '</span>';
      rest -= s.length;
    }
    typeTarget.innerHTML = out + '<span class="type-caret"></span>';
  }
  function typeErase() {
    if (typeN > typeBase) {
      typeN--;
      typePaint();
      setTimeout(typeErase, 30);
    } else {
      typeWi = (typeWi + 1) % typeWords.length;
      setTimeout(typeTick, 350);
    }
  }
  function typeTick() {
    if (typeN < typeLen()) {
      typeN++;
      typePaint();
      setTimeout(typeTick, 55);
    } else {
      setTimeout(typeErase, 2000);
    }
  }
  const staticCaret = typeTarget.nextElementSibling;
  if (staticCaret && staticCaret.classList.contains('type-caret')) staticCaret.remove();
  setTimeout(() => { typeN = 0; typePaint(); typeTick(); }, 800);
}

const previewVideo = document.querySelector('.project-preview video');
if (previewVideo) {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) previewVideo.play().catch(() => {});
      else previewVideo.pause();
    });
  }, { threshold: 0.2 }).observe(previewVideo);
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const t = document.querySelector(this.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();
