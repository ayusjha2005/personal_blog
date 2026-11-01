import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, GraduationCap, Target, Brain, Code2, Database } from 'lucide-react';
import { GithubIcon } from '../common/SocialIcons';
import OrbitalParticleSystem from '../common/OrbitalParticleSystem';

export default function AboutHero({ profile = {} }) {
  return (
    <section className="relative w-full pt-6 pb-20 overflow-hidden">
      {/* Secondary glowing crimson planet in top right corner (Matching Reference Image) */}
      <div className="absolute top-0 right-0 w-72 h-72 md:w-96 md:h-96 pointer-events-none select-none opacity-80 z-0">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-crimson/30 via-rose-950/40 to-transparent blur-3xl absolute inset-0" />
        <img
          src="/images/hero-crimson-planet.jpg"
          alt="Glowing celestial planet"
          className="w-full h-full object-cover rounded-full mix-blend-screen opacity-70 filter contrast-125"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Portrait in Celestial Circular Portal with Orbital Rings & Floating Badges */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 flex items-center justify-center">
              {/* Concentric Orbital Particle Systems */}
              <OrbitalParticleSystem radiusX={155} radiusY={75} tiltDeg={-25} particleCount={6} />
              <OrbitalParticleSystem radiusX={175} radiusY={65} tiltDeg={15} particleCount={4} color="255, 90, 130" />

              {/* Glowing Outer Rings */}
              <div className="absolute inset-0 rounded-full border border-crimson/30 shadow-[0_0_35px_rgba(225,29,72,0.3)] animate-pulse" />
              <div className="absolute -inset-4 rounded-full border border-dashed border-white/10" />

              {/* Crimson Planet Glow behind Portrait */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-crimson/40 via-[#FF1E56]/20 to-transparent blur-xl" />

              {/* Portrait Frame */}
              <div className="relative z-10 w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-crimson/60 shadow-[0_0_40px_rgba(225,29,72,0.4)]">
                <img
                  src={profile.profileImage || '/images/profile.jpg'}
                  alt="Ayush Jha"
                  className="w-full h-full object-cover object-top scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/profile.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080B]/80 via-transparent to-transparent" />
              </div>

              {/* Floating 3D Crimson Badges (Exact Match to Reference Image) */}
              {/* Badge 1: Top-Left </> */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 left-0 w-11 h-11 rounded-2xl bg-[#0F1218]/90 border border-crimson/50 backdrop-blur-md flex items-center justify-center text-crimson shadow-[0_0_15px_rgba(225,29,72,0.35)] z-20"
              >
                <Code2 className="w-5 h-5" />
              </motion.div>

              {/* Badge 2: Bottom-Left GitHub */}
              <motion.a
                href="https://github.com/ayusjha2005"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Ayush Jha on GitHub (opens in new tab)"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-6 left-2 w-11 h-11 rounded-2xl bg-[#0F1218]/90 border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:text-crimson hover:border-crimson/50 hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] shadow-lg z-20 transition-colors"
              >
                <GithubIcon className="w-5 h-5" />
              </motion.a>

              {/* Badge 3: Mid-Right Sigma / Math */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-24 -right-2 w-11 h-11 rounded-2xl bg-[#0F1218]/90 border border-crimson/50 backdrop-blur-md flex items-center justify-center text-crimson font-serif font-bold text-lg shadow-[0_0_15px_rgba(225,29,72,0.35)] z-20"
              >
                &Sigma;
              </motion.div>

              {/* Badge 4: Bottom-Right Database */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute bottom-8 right-2 w-11 h-11 rounded-2xl bg-[#0F1218]/90 border border-white/20 backdrop-blur-md flex items-center justify-center text-rose-300 shadow-lg z-20"
              >
                <Database className="w-5 h-5" />
              </motion.div>
            </div>
          </div>

          {/* Right Column: Editorial Typography, Intro, 3 Glass Panels, and CTAs */}
          <div className="lg:col-span-7 space-y-7">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2">
              <span className="w-5 h-0.5 bg-crimson shadow-[0_0_6px_#E11D48]" />
              <span className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
                ABOUT ME
              </span>
            </div>

            {/* Main Heading: Beyond the Code. */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-[1.1]">
              Beyond the <span className="text-crimson drop-shadow-[0_0_25px_rgba(225,29,72,0.6)]">Code.</span>
            </h1>

            {/* Intro Description */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              Hey, I'm <strong className="text-white font-semibold">Ayush Jha</strong> &mdash; a developer, learner and builder who loves turning ideas into real-world solutions.
            </p>

            {/* 3 Frosted Glass Info Panels (Matching Reference Image) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Panel 1: Education */}
              <div className="p-4 rounded-2xl bg-[#0E1116]/80 border border-white/10 backdrop-blur-md hover:border-crimson/40 transition-colors shadow-lg">
                <div className="flex items-center gap-2 mb-2 text-crimson">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">
                    EDUCATION
                  </span>
                </div>
                <div className="text-sm font-bold text-white leading-tight">B.Tech CSE (CSBS)</div>
                <div className="text-xs text-slate-400 mt-0.5">VIT-AP</div>
              </div>

              {/* Panel 2: Current Focus */}
              <div className="p-4 rounded-2xl bg-[#0E1116]/80 border border-white/10 backdrop-blur-md hover:border-crimson/40 transition-colors shadow-lg">
                <div className="flex items-center gap-2 mb-2 text-crimson">
                  <Target className="w-4 h-4" />
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">
                    CURRENT FOCUS
                  </span>
                </div>
                <div className="text-sm font-bold text-white leading-tight">Backend, Systems</div>
                <div className="text-xs text-slate-400 mt-0.5">Design &amp; AI</div>
              </div>

              {/* Panel 3: Mindset */}
              <div className="p-4 rounded-2xl bg-[#0E1116]/80 border border-white/10 backdrop-blur-md hover:border-crimson/40 transition-colors shadow-lg">
                <div className="flex items-center gap-2 mb-2 text-crimson">
                  <Brain className="w-4 h-4" />
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">
                    MINDSET
                  </span>
                </div>
                <div className="text-sm font-bold text-white leading-tight">Always Learning</div>
                <div className="text-xs text-slate-400 mt-0.5">Always Building</div>
              </div>
            </div>

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-crimson text-white text-sm font-bold shadow-[0_0_25px_rgba(225,29,72,0.4)] hover:shadow-[0_0_35px_rgba(225,29,72,0.7)] hover:scale-102 active:scale-98 transition-all"
              >
                <span>View My Projects</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-semibold backdrop-blur-md border border-white/10 hover:border-white/20 transition-all hover:scale-102 active:scale-98"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
