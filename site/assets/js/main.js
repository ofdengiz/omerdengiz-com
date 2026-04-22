/* ==========================================================================
   omerdengiz.com — site interactivity
   - animated gradient canvas background
   - nav scroll + mobile toggle
   - hero tagline rotator
   - reveal-on-scroll (IntersectionObserver)
   - animated stat counters
   - projects filter
   ========================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Year in footer ------------------------------------------------------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Nav behaviour -------------------------------------------------------
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Hero tagline rotator ------------------------------------------------
  const rotatorItems = document.querySelectorAll('.rotator-item');
  if (rotatorItems.length) {
    let idx = 0;
    rotatorItems[0].classList.add('active');
    if (!prefersReducedMotion) {
      setInterval(() => {
        rotatorItems[idx].classList.remove('active');
        idx = (idx + 1) % rotatorItems.length;
        rotatorItems[idx].classList.add('active');
      }, 2600);
    }
  }

  // ---- Reveal on scroll ----------------------------------------------------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  // ---- Animated stat counters ---------------------------------------------
  const stats = document.querySelectorAll('.stat-num');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toString() + (t === 1 ? '+' : '');
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (stats.length && 'IntersectionObserver' in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCount(e.target); so.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    stats.forEach(s => so.observe(s));
  }

  // ---- Projects filter -----------------------------------------------------
  const chips = document.querySelectorAll('.chip');
  const projects = document.querySelectorAll('.project');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.dataset.filter;
      projects.forEach(p => {
        const cats = (p.dataset.cat || '').split(/\s+/);
        p.classList.toggle('hidden', !(f === 'all' || cats.includes(f)));
      });
    });
  });

  // ---- Canvas: drifting gradient orbs + particle mesh ---------------------
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const orbs = [
    { x: 0.20, y: 0.25, r: 420, c: [76, 201, 240],  vx:  0.00020, vy:  0.00015 },
    { x: 0.80, y: 0.35, r: 480, c: [123, 44, 191],  vx: -0.00018, vy:  0.00022 },
    { x: 0.55, y: 0.80, r: 380, c: [247, 37, 133],  vx:  0.00016, vy: -0.00018 },
  ];

  // Particle constellation
  const particleCount = Math.min(70, Math.floor((w * h) / 22000));
  const particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    r: Math.random() * 1.4 + 0.4,
  }));

  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  let t = 0;
  const render = () => {
    t += 1;
    ctx.clearRect(0, 0, w, h);

    // Orbs
    ctx.globalCompositeOperation = 'lighter';
    for (const o of orbs) {
      o.x += Math.sin(t * o.vx) * 0.0008;
      o.y += Math.cos(t * o.vy) * 0.0008;
      const cx = o.x * w;
      const cy = o.y * h;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.r);
      grad.addColorStop(0, `rgba(${o.c[0]}, ${o.c[1]}, ${o.c[2]}, 0.18)`);
      grad.addColorStop(1, `rgba(${o.c[0]}, ${o.c[1]}, ${o.c[2]}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, o.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // Particles + mesh
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 18000) {
        const f = (1 - d2 / 18000) * 0.04;
        p.vx += (dx / Math.sqrt(d2 + 1)) * f;
        p.vy += (dy / Math.sqrt(d2 + 1)) * f;
      }
      p.vx = Math.max(-0.6, Math.min(0.6, p.vx));
      p.vy = Math.max(-0.6, Math.min(0.6, p.vy));

      ctx.fillStyle = 'rgba(164, 173, 207, 0.55)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const ax = p.x - q.x, ay = p.y - q.y;
        const ad2 = ax * ax + ay * ay;
        if (ad2 < 14000) {
          const alpha = (1 - ad2 / 14000) * 0.18;
          ctx.strokeStyle = `rgba(76, 201, 240, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
})();
