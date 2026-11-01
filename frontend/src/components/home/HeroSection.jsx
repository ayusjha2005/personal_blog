import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Code2, Users, GitCommit } from 'lucide-react';

export default function HeroSection({ profile = {}, featuredArticle = null, articleCount = 42 }) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Parallax on scroll
  const { scrollY } = useScroll();
  const yPlanet = useTransform(scrollY, [0, 600], [0, 80]);
  const yContent = useTransform(scrollY, [0, 600], [0, -40]);

  // Mouse movement parallax for desktop
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x: x * 20, y: y * 20 });
  };

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-[92vh] flex items-center overflow-hidden bg-[#07080B] pt-8 pb-16"
    >
      {/* Background Celestial Artwork Layer (Reference Image: Crimson Planet, Mountain Cliff, Developer & Satellites) */}
      <motion.div
        style={{ y: yPlanet }}
        className="absolute inset-0 z-0 pointer-events-none select-none"
      >
        <img
          src="/images/hero-crimson-planet.jpg"
          alt="Cosmic crimson planet and developer"
          className="w-full h-full object-cover object-right-top md:object-center opacity-85 transition-transform duration-700"
          fetchpriority="high"
        />

        {/* Cinematic Vignettes and Gradient Blends */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080B] via-[#07080B]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-transparent to-[#07080B]/70" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#07080B] to-transparent" />
      </motion.div>

      {/* Floating 3D Crimson Orbital Particles & Digital Laser Waves */}
      <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
        {/* Subtle horizontal laser wave at base */}
        <div className="absolute bottom-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-crimson to-transparent opacity-40 shadow-[0_0_20px_#E11D48]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div style={{ y: yContent }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline, Bio, Buttons, and Stats */}
          <div className="lg:col-span-7 xl:col-span-6 space-y-7 pt-4">
            {/* Tagline Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5"
            >
              <span className="w-6 h-0.5 bg-crimson shadow-[0_0_8px_#E11D48]" />
              <span className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
                PERSONAL TECH BLOG
              </span>
              <span className="w-2 h-0.5 bg-crimson/50" />
            </motion.div>

            {/* Giant Editorial Headline (Exact Match to Reference Image) */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl xl:text-7xl font-extrabold text-white font-heading tracking-tight leading-[1.08]"
            >
              Ideas. Code.
              <br />
              Systems.{' '}
              <span className="text-crimson drop-shadow-[0_0_25px_rgba(225,29,72,0.65)]">
                Learning.
              </span>
            </motion.h1>

            {/* Subtitle Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl"
            >
              A space where I document what I build, learn, and explore — from web development and
              system design to AI, dev tools, and everything in between.
            </motion.p>

            {/* Call To Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                to="/blog"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-crimson text-white text-sm font-bold shadow-[0_0_25px_rgba(225,29,72,0.4)] hover:shadow-[0_0_35px_rgba(225,29,72,0.7)] hover:scale-102 active:scale-98 transition-all duration-200"
              >
                <span>Explore Blogs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-semibold backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-102 active:scale-98"
              >
                About Me
              </Link>
            </motion.div>

            {/* Stat Counters Strip (Honest, Real Developer Metrics) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-crimson" />
                <div>
                  <div className="text-lg font-bold text-white font-mono">{articleCount || 6}</div>
                  <div className="text-xs text-slate-400">Articles</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Code2 className="w-4 h-4 text-crimson" />
                <div>
                  <div className="text-sm font-bold text-white font-heading">Full-Stack</div>
                  <div className="text-xs text-slate-400">&amp; Systems</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-crimson" />
                <div>
                  <div className="text-sm font-bold text-white font-heading">CSE @ VIT-AP</div>
                  <div className="text-xs text-slate-400">Student</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <GitCommit className="w-4 h-4 text-crimson" />
                <div>
                  <div className="text-lg font-bold text-white font-mono">350+</div>
                  <div className="text-xs text-slate-400">Contributions</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Floating Interactive Glass Code Editor & 3D Badges */}
          <div className="lg:col-span-5 xl:col-span-6 relative flex flex-col items-center justify-center min-h-[380px]">
            {/* Floating Glass Code Card (Exact Match to Reference Image) */}
            <motion.div
              animate={{
                x: mouseOffset.x * -0.8,
                y: [0, -10, 0],
              }}
              transition={{
                y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                x: { type: 'spring', damping: 20, stiffness: 100 },
              }}
              className="relative w-full max-w-md bg-[#0F1218]/80 backdrop-blur-xl border border-crimson/40 rounded-2xl p-5 shadow-[0_0_35px_rgba(225,29,72,0.25)] hover:border-crimson transition-colors group"
            >
              {/* macOS Traffic Lights Header */}
              <div className="flex items-center gap-2 pb-4 mb-3 border-b border-white/5">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
                <span className="ml-2 text-xs font-mono text-slate-400">developer.js</span>
              </div>

              {/* Code Content */}
              <pre className="font-mono text-xs sm:text-sm leading-relaxed text-slate-200">
                <code>
                  <span className="text-slate-500 mr-3">1</span>
                  <span className="text-crimson">const</span> <span className="text-amber-300">ayush</span> = {'{\n'}
                  <span className="text-slate-500 mr-3">2</span>  role: <span className="text-emerald-300">"CSE Student"</span>,{'\n'}
                  <span className="text-slate-500 mr-3">3</span>  passion: [<span className="text-emerald-300">"Code"</span>, <span className="text-emerald-300">"Build"</span>, <span className="text-emerald-300">"Learn"</span>],{'\n'}
                  <span className="text-slate-500 mr-3">4</span>  focus: <span className="text-emerald-300">"Backend &amp; Systems"</span>{'\n'}
                  <span className="text-slate-500 mr-3">5</span>{'};'}
                </code>
              </pre>

              {/* Glowing Corner Accents */}
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-crimson rounded-tr" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-crimson rounded-bl" />
            </motion.div>

            {/* Floating 3D Crimson Code Badges `< />` */}
            <motion.div
              animate={{
                x: mouseOffset.x * 0.9,
                y: [0, 12, 0],
              }}
              transition={{
                y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
                x: { type: 'spring', damping: 20, stiffness: 120 },
              }}
              className="absolute -bottom-4 right-10 sm:right-20 px-4 py-2 rounded-xl bg-crimson/20 border border-crimson/50 backdrop-blur-md text-crimson font-mono font-bold text-sm shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center gap-2 select-none"
            >
              <span>&lt;/&gt;</span>
              <span className="text-xs text-white">Full-Stack Dev</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Down Mouse Indicator */}
        <div className="pt-12 flex justify-center">
          <motion.a
            href="#recent-blogs"
            aria-label="Scroll to articles"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-slate-500 hover:text-crimson transition-colors"
          >
            <div className="w-5 h-8 rounded-full border-2 border-slate-500 flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1 h-2 rounded-full bg-crimson shadow-[0_0_8px_#E11D48]"
              />
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
