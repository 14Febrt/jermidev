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
  const typeWords = ['Buy', 'Sell', 'Order', 'Offer'];
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

const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

(() => {
  const rootEls = Array.from(document.querySelectorAll('.project-card.flip-card'));
  if (!rootEls.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PERSPECTIVE = 1100;
  const TILT_MAX = 12;
  const HOVER_SCALE = 1.03;
  const SPR = { flip: [170, 20], tilt: [240, 24], lift: [320, 26] };

  const active = new Set();
  let raf = 0;
  let last = 0;

  function spring(p, v, t, kd, dt) {
    v += (kd[0] * (t - p) - kd[1] * v) * dt;
    return [p + v * dt, v];
  }

  function wake(c) {
    active.add(c);
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
  }

  function loop(now) {
    const dt = Math.min(0.032, Math.max(0.001, (now - last) / 1000));
    last = now;
    for (const c of Array.from(active)) c.step(dt);
    raf = 0;
    if (active.size) raf = requestAnimationFrame(loop);
  }

  function paint(c) {
    c.rotor.style.transform =
      'perspective(' + PERSPECTIVE + 'px) scale(' + c.lift.toFixed(4) + ')' +
      ' rotateX(' + c.tx.toFixed(3) + 'deg) rotateY(' + (c.turn + c.ty).toFixed(3) + 'deg)';
  }

  function create(root) {
    const c = {
      root,
      rotor: root.querySelector('.flip-rotor'),
      turn: 0, turnV: 0, turnT: 0,
      tx: 0, txv: 0, txt: 0,
      ty: 0, tyv: 0, tyt: 0,
      lift: 1, liftv: 0, liftt: 1,
      drag: null,
      step(dt) {
        [this.turn, this.turnV] = spring(this.turn, this.turnV, this.turnT, SPR.flip, dt);
        [this.tx, this.txv] = spring(this.tx, this.txv, this.txt, SPR.tilt, dt);
        [this.ty, this.tyv] = spring(this.ty, this.tyv, this.tyt, SPR.tilt, dt);
        [this.lift, this.liftv] = spring(this.lift, this.liftv, this.liftt, SPR.lift, dt);
        const settled =
          Math.abs(this.turnT - this.turn) < 0.05 && Math.abs(this.turnV) < 8 &&
          Math.abs(this.txt - this.tx) < 0.01 && Math.abs(this.txv) < 1 &&
          Math.abs(this.tyt - this.ty) < 0.01 && Math.abs(this.tyv) < 1 &&
          Math.abs(this.liftt - this.lift) < 0.0005;
        if (settled) {
          this.turn = this.turnT; this.turnV = 0;
          this.tx = this.txt; this.txv = 0;
          this.ty = this.tyt; this.tyv = 0;
          this.lift = this.liftt; this.liftv = 0;
          active.delete(this);
        }
        paint(this);
      },
      rest() {
        this.txt = 0; this.tyt = 0; this.liftt = 1;
        this.root.classList.remove('is-hover');
        wake(this);
      },
      flip(instant) {
        if (reduced) {
          this.root.classList.toggle('flipped');
          this.root.setAttribute('aria-pressed', this.root.classList.contains('flipped') ? 'true' : 'false');
          return;
        }
        const base = Math.round(this.turn / 180) * 180;
        this.turnT = base + 180;
        this.root.setAttribute('aria-pressed', String(Math.round(this.turnT / 180) % 2 === 1));
        if (instant) { this.turn = this.turnT; this.turnV = 0; paint(this); }
        else wake(this);
      },
      settle(target, velocity) {
        this.turnT = target;
        this.turnV = velocity || 0;
        wake(this);
      }
    };
    return c;
  }

  function bind(c) {
    const root = c.root;

    root.addEventListener('pointerenter', e => {
      if (reduced || e.pointerType === 'touch' || c.drag) return;
      c.liftt = HOVER_SCALE;
      root.classList.add('is-hover');
      wake(c);
    });

    root.addEventListener('pointermove', e => {
      if (c.drag && c.drag.id === e.pointerId) {
        const d = e.clientX - c.drag.x;
        if (!c.drag.moved) {
          const slop = e.pointerType === 'touch' ? 8 : 4;
          if (Math.abs(d) < slop) return;
          c.drag.moved = true;
          root.classList.add('is-dragging');
          c.txt = 0; c.tyt = 0;
        }
        c.turn = c.drag.base + (d / root.offsetWidth) * 180;
        c.turnV = 0;
        const now = performance.now();
        c.drag.hist.push([now, c.turn]);
        while (c.drag.hist.length > 2 && now - c.drag.hist[0][0] > 90) c.drag.hist.shift();
        paint(c);
        wake(c);
        return;
      }
      if (reduced || e.pointerType === 'touch') return;
      const r = root.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      c.txt = (0.5 - py) * 2 * TILT_MAX;
      c.tyt = (px - 0.5) * 2 * TILT_MAX;
      root.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      root.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      wake(c);
    });

    const release = (e, cancelled) => {
      const g = c.drag;
      if (!g || g.id !== e.pointerId) return;
      c.drag = null;
      root.classList.remove('is-dragging');
      if (!root.matches(':hover')) c.rest();
      if (!g.moved) {
        if (!cancelled && !e.target.closest('a')) c.flip(false);
        else c.settle(Math.round(c.turn / 180) * 180, 0);
        return;
      }
      const here = c.turn;
      let v = 0;
      const a = g.hist[0], b = g.hist[g.hist.length - 1];
      if (!cancelled && a && b && b[0] > a[0] && performance.now() - b[0] < 60) {
        v = ((b[1] - a[1]) / (b[0] - a[0])) * 1000;
      }
      const snapBase = Math.round(here / 180) * 180;
      const to = Math.min(snapBase + 180, Math.max(snapBase - 180, Math.round((here + v * 0.16) / 180) * 180));
      c.settle(to, v);
    };

    root.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      if (Math.abs(c.turn - c.turnT) < 6 && Math.abs(c.turnV) < 40) {
        c.turn = c.turnT; c.turnV = 0;
        paint(c);
      }
      if (e.target.closest('a')) return;
      try { root.setPointerCapture(e.pointerId); } catch {}
      c.turnV = 0;
      c.turnT = c.turn;
      c.drag = { id: e.pointerId, x: e.clientX, base: c.turn, moved: false, hist: [] };
      if (!reduced) { c.liftt = HOVER_SCALE; wake(c); }
    });

    root.addEventListener('pointerup', e => release(e, false));
    root.addEventListener('pointercancel', e => release(e, true));
    root.addEventListener('pointerleave', () => { if (!c.drag) c.rest(); });

    root.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (!e.repeat) c.flip(reduced);
    });
    root.addEventListener('click', e => {
      if (e.detail === 0) { c.flip(reduced); return; }
      if (e.target.closest && e.target.closest('a')) return;
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const link = under && under.closest('a');
      if (link && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        window.open(link.href, '_blank', 'noopener');
      }
    });
  }

  rootEls.forEach(root => {
    const c = create(root);
    bind(c);
    paint(c);
  });
})();

(() => {
  const vids = Array.from(document.querySelectorAll('.project-preview.has-video video'));
  if (!vids.length) return;
  const tryPlay = v => {
    if (!v.paused) return;
    const p = v.play();
    if (p && p.catch) p.catch(() => v.classList.add('is-blocked'));
  };
  vids.forEach(v => {
    v.removeAttribute('autoplay');
    const p = v.play();
    if (p && p.catch) p.catch(() => v.classList.add('is-blocked'));
    v.addEventListener('loadeddata', () => tryPlay(v));
  });
  const retry = () => document.querySelectorAll('video.is-blocked').forEach(v => {
    v.classList.remove('is-blocked');
    tryPlay(v);
  });
  ['pointerdown', 'touchstart'].forEach(ev => document.addEventListener(ev, retry, { passive: true }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) vids.forEach(tryPlay); });
})();
