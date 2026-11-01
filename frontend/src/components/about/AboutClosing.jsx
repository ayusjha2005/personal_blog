import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function AboutClosing() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  });

  const yPlanet = useTransform(scrollYProgress, [0, 1], [40, -20]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.7, 1]);

  // Ambient mouse light tracker
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Gathering & Dispersing Particles Canvas (Animation step 3 & 8)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = canvas.offsetWidth || 800);
    let height = (canvas.height = canvas.offsetHeight || 600);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * 0.02 + 0.01,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        p.alpha += Math.sin(Date.now() * p.pulse) * 0.01;
        const safeAlpha = Math.max(0.1, Math.min(0.8, p.alpha));

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(225, 29, 72, ${safeAlpha})`;
        ctx.shadowColor = 'rgba(225, 29, 72, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full pt-20 pb-36 overflow-hidden bg-[#07080B]"
    >
      {/* Dynamic Cursor Ambient Radial Glow on Desktop */}
      <div
        className="pointer-events-none absolute -inset-px opacity-35 transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(225, 29, 72, 0.15), transparent 70%)`,
        }}
      />

      {/* Floating Canvas Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70"
      />

      {/* Background Celestial Crimson Planet Atmosphere */}
      <motion.div
        style={{ opacity: bgOpacity, y: yPlanet }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-crimson/15 via-rose-950/20 to-transparent blur-[130px] pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Traveler on Mountain Peak looking at Crimson Planet (Matching Reference Image) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="relative w-full max-w-md aspect-[16/12] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(225,29,72,0.3)] group">
              <img
                src="/images/hero-crimson-planet.jpg"
                alt="Developer standing on mountain summit gazing at crimson planet"
                className="w-full h-full object-cover object-left-bottom group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07080B]/80 via-[#07080B]/20 to-transparent" />

              {/* Pulsing Summit Compass Icon */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#07080B]/80 border border-crimson/50 backdrop-blur-md flex items-center justify-center text-crimson shadow-[0_0_15px_#E11D48]">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          </motion.div>

          {/* Right Column: Cinematic Animated Typography Sequence */}
          <div className="lg:col-span-7 space-y-7">
            {/* Tag Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2"
            >
              <span className="w-6 h-0.5 bg-crimson shadow-[0_0_8px_#E11D48]" />
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                THE ROAD AHEAD
              </span>
            </motion.div>

            {/* Staged Kinetic Typography (Sequence steps 4, 5, 6, 7) */}
            <div className="space-y-2">
              {/* Line 1: STILL LEARNING. (Smooth Mask Reveal) */}
              <div className="overflow-hidden">
                <motion.h2
                  initial={{ y: '100%', opacity: 0 }}
                  whileInView={{ y: '0%', opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-none"
                >
                  Still Learning.
                </motion.h2>
              </div>

              {/* Line 2: STILL BUILDING. (Staggered Entrance) */}
              <div className="overflow-hidden">
                <motion.h2
                  initial={{ y: '100%', opacity: 0 }}
                  whileInView={{ y: '0%', opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-slate-200 tracking-tight leading-none"
                >
                  Still Building.
                </motion.h2>
              </div>

              {/* Line 3: JUST GETTING STARTED. (Dramatically larger with Crimson Glow & Sweep) */}
              <div className="overflow-hidden pt-2">
                <motion.h2
                  initial={{ y: '100%', opacity: 0 }}
                  whileInView={{ y: '0%', opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="relative inline-block text-4xl sm:text-5xl lg:text-7xl font-extrabold font-heading text-crimson drop-shadow-[0_0_35px_rgba(225,29,72,0.7)] tracking-tight leading-tight"
                >
                  Just Getting Started.
                  {/* Animated Light Sweep Underline (Step 7) */}
                  <motion.span
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.6, ease: 'easeOut' }}
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-crimson via-rose-400 to-transparent shadow-[0_0_15px_#E11D48] origin-left rounded-full"
                  />
                </motion.h2>
              </div>
            </div>

            {/* Sub-statement text */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl"
            >
              Always open to collaborating on high-impact projects, exploring ambitious engineering ideas, or just talking tech.
            </motion.p>

            {/* Scale and Fade CTA Button (Step 9) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="pt-4"
            >
              <Link
                to="/contact"
                className="group relative inline-flex items-center gap-3 px-9 py-4 rounded-full bg-crimson text-white text-base font-bold shadow-[0_0_30px_rgba(225,29,72,0.5)] hover:shadow-[0_0_45px_rgba(225,29,72,0.85)] hover:scale-104 active:scale-96 transition-all duration-300 cursor-pointer min-h-[48px]"
              >
                <span>Let's Connect</span>
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
