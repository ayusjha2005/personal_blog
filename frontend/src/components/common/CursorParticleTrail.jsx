import { useEffect, useRef } from 'react';

export default function CursorParticleTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Disable on touch devices or reduced-motion preference
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const maxParticles = 90;
    let lastMousePos = { x: -100, y: -100 };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const addParticles = (x, y, count = 2, speedMultiplier = 1) => {
      for (let i = 0; i < count; i++) {
        if (particles.length >= maxParticles) {
          particles.shift();
        }
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 1.5 + 0.4) * speedMultiplier;
        particles.push({
          x: x + (Math.random() - 0.5) * 4,
          y: y + (Math.random() - 0.5) * 4,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.2 + 1.2,
          alpha: 0.9,
          decay: Math.random() * 0.025 + 0.018,
          color: Math.random() > 0.3 ? '225, 29, 72' : '255, 60, 100', // Crimson / bright rose
        });
      }
    };

    const handleMouseMove = (e) => {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      lastMousePos = { x: e.clientX, y: e.clientY };

      // Fast movement spawns more particles for longer trails
      const count = dist > 40 ? 4 : dist > 15 ? 2 : 1;
      const speedMult = Math.min(2.2, Math.max(0.8, dist / 25));
      addParticles(e.clientX, e.clientY, count, speedMult);
    };

    const handleClick = (e) => {
      // Interactive particle burst on click
      addParticles(e.clientX, e.clientY, 14, 2.5);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.size *= 0.965;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.size <= 0.4) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.shadowColor = 'rgba(225, 29, 72, 0.7)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9995]"
      style={{ willChange: 'transform' }}
    />
  );
}
