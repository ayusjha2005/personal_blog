import { useEffect, useRef } from 'react';

export default function OrbitalParticleSystem({
  radiusX = 140,
  radiusY = 55,
  tiltDeg = -20,
  particleCount = 5,
  color = '225, 29, 72',
  className = '',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    const width = (canvas.width = canvas.offsetWidth * 2 || 400);
    const height = (canvas.height = canvas.offsetHeight * 2 || 400);
    const centerX = width / 2;
    const centerY = height / 2;
    const tiltRad = (tiltDeg * Math.PI) / 180;

    // Particles moving along ellipse
    const particles = Array.from({ length: particleCount }, (_, i) => ({
      theta: (i * (Math.PI * 2)) / particleCount,
      speed: (Math.random() * 0.008 + 0.006) * (i % 2 === 0 ? 1 : -1),
      size: Math.random() * 2 + 2,
      trail: [],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint orbital ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(tiltRad);
      ctx.beginPath();
      ctx.ellipse(0, 0, radiusX * 2, radiusY * 2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${color}, 0.25)`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.restore();

      // Update and draw particles with glowing comet trails
      particles.forEach((p) => {
        p.theta += p.speed;

        // Ellipse coordinate before rotation
        const unrotatedX = radiusX * 2 * Math.cos(p.theta);
        const unrotatedY = radiusY * 2 * Math.sin(p.theta);

        // Apply tilt rotation
        const x = centerX + unrotatedX * Math.cos(tiltRad) - unrotatedY * Math.sin(tiltRad);
        const y = centerY + unrotatedX * Math.sin(tiltRad) + unrotatedY * Math.cos(tiltRad);

        // Save position in trail
        p.trail.unshift({ x, y });
        if (p.trail.length > 8) p.trail.pop();

        // Draw trail
        for (let j = 0; j < p.trail.length; j++) {
          const tp = p.trail[j];
          const tAlpha = (1 - j / p.trail.length) * 0.45;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, p.size * (1 - j / p.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${tAlpha})`;
          ctx.fill();
        }

        // Draw particle head
        const depthAlpha = Math.sin(p.theta) > 0 ? 1 : 0.6; // Simulates passing front vs back
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, p.size * (Math.sin(p.theta) > 0 ? 1.2 : 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${depthAlpha})`;
        ctx.shadowColor = `rgba(${color}, 0.9)`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [radiusX, radiusY, tiltDeg, particleCount, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
