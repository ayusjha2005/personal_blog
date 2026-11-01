import { useState } from 'react';
import { motion } from 'framer-motion';
import OrbitalParticleSystem from '../common/OrbitalParticleSystem';

export default function TechUniverse() {
  const [activeTech, setActiveTech] = useState(null);

  const techNodes = [
    {
      id: 'cpp',
      name: 'C / C++',
      category: 'Systems & DSA',
      desc: 'Core language for problem solving, memory management, and competitive DSA.',
      color: 'bg-blue-600',
      pos: 'top-2 sm:top-4 left-1/2 -translate-x-1/2',
    },
    {
      id: 'js',
      name: 'JavaScript',
      category: 'Web Core',
      desc: 'ES6+, async programming, DOM, event loops, and modern browser standards.',
      color: 'bg-amber-400 text-black',
      pos: 'top-10 sm:top-14 right-4 sm:right-16',
    },
    {
      id: 'react',
      name: 'React',
      category: 'Frontend Architecture',
      desc: 'Hooks, Vite, state machines, Framer Motion, and component-driven UI systems.',
      color: 'bg-cyan-500',
      pos: 'top-1/2 -translate-y-1/2 -right-2 sm:right-6',
    },
    {
      id: 'node',
      name: 'Node.js',
      category: 'Runtime',
      desc: 'Server-side runtime, event-driven architecture, streams, and npm ecosystem.',
      color: 'bg-emerald-600',
      pos: 'bottom-14 sm:bottom-18 right-6 sm:right-20',
    },
    {
      id: 'express',
      name: 'Express',
      category: 'Backend Framework',
      desc: 'REST APIs, middleware pipelines, sessions, error handling, and routing.',
      color: 'bg-slate-300 text-black',
      pos: 'bottom-2 sm:bottom-4 right-1/4',
    },
    {
      id: 'postgres',
      name: 'PostgreSQL',
      category: 'Relational DB',
      desc: 'Relational schemas, SQL queries, indexing, joins, and data normalization.',
      color: 'bg-sky-600',
      pos: 'bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2',
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      category: 'NoSQL Database',
      desc: 'Document modeling, Mongoose ODM, aggregation pipelines, and Atlas clusters.',
      color: 'bg-emerald-500',
      pos: 'bottom-12 sm:bottom-16 left-6 sm:left-20',
    },
    {
      id: 'linux',
      name: 'Linux',
      category: 'OS & CLI',
      desc: 'Bash scripting, file permissions, cron jobs, process management, and servers.',
      color: 'bg-amber-500 text-black',
      pos: 'top-1/2 -translate-y-1/2 -left-2 sm:left-6',
    },
    {
      id: 'git',
      name: 'Git & GitHub',
      category: 'Version Control',
      desc: 'Branching, PRs, CI/CD actions, merge strategies, and team collaboration.',
      color: 'bg-purple-600',
      pos: 'top-10 sm:top-14 left-4 sm:left-16',
    },
  ];

  return (
    <section id="skills" className="relative w-full py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-0.5 bg-crimson shadow-[0_0_6px_#E11D48]" />
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              02 / SKILLS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight">
            My Tech <span className="text-crimson">Universe</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-lg leading-relaxed">
            Technologies I work with, explore and continuously build upon.
          </p>
        </div>

        {/* Desktop & Tablet: Central Interactive Constellation Canvas */}
        <div className="hidden sm:flex relative w-full max-w-4xl mx-auto min-h-[460px] sm:min-h-[540px] items-center justify-center p-4">
          {/* Concentric Elliptical Orbital Particle Systems */}
          <OrbitalParticleSystem radiusX={180} radiusY={90} tiltDeg={-12} particleCount={7} />
          <OrbitalParticleSystem radiusX={240} radiusY={120} tiltDeg={18} particleCount={5} color="255, 75, 115" />
          <OrbitalParticleSystem radiusX={310} radiusY={140} tiltDeg={-5} particleCount={6} color="225, 29, 72" />

          {/* Central Glowing Crimson Planet (TECH UNIVERSE) */}
          <div className="relative z-10 w-36 h-36 sm:w-48 sm:h-48 rounded-full flex flex-col items-center justify-center text-center p-4 select-none shadow-[0_0_60px_rgba(225,29,72,0.6)] border-2 border-crimson/80 bg-[#0E1116] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-crimson via-rose-950 to-black opacity-90" />
            <div className="absolute -inset-2 rounded-full border border-crimson/50 animate-ping opacity-25" />

            <div className="relative z-10 space-y-0.5">
              <span className="block font-heading font-extrabold text-sm sm:text-base text-white tracking-widest uppercase">
                TECH
              </span>
              <span className="block font-heading font-extrabold text-sm sm:text-base text-crimson tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                UNIVERSE
              </span>
            </div>
          </div>

          {/* Floating Orbiting Technology Nodes */}
          {techNodes.map((tech) => {
            const isActive = activeTech?.id === tech.id;
            return (
              <motion.button
                key={tech.id}
                type="button"
                onMouseEnter={() => setActiveTech(tech)}
                onMouseLeave={() => setActiveTech(null)}
                onClick={() => setActiveTech(isActive ? null : tech)}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                className={`absolute ${tech.pos} z-20 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#0F1218]/90 border backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all duration-300 shadow-xl min-h-[44px] ${
                  isActive
                    ? 'border-crimson shadow-[0_0_20px_rgba(225,29,72,0.6)] bg-crimson/15'
                    : 'border-white/10 hover:border-crimson/40'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${tech.color}`} />
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  {tech.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Mobile-Friendly Grid Layout (< 640px) */}
        <div className="sm:hidden space-y-4">
          <div className="text-center py-4">
            <span className="inline-block px-4 py-1 rounded-full bg-crimson/15 border border-crimson/40 text-xs font-mono font-bold text-crimson">
              CENTRAL TECH CORE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {techNodes.map((tech) => {
              const isActive = activeTech?.id === tech.id;
              return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setActiveTech(isActive ? null : tech)}
                  className={`p-3.5 rounded-2xl bg-[#0E1116] border text-left transition-all min-h-[52px] ${
                    isActive
                      ? 'border-crimson bg-crimson/15 shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${tech.color}`} />
                    <span className="text-sm font-bold text-white">{tech.name}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">{tech.category}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Node Tooltip / Detail Panel */}
        <div className="max-w-md mx-auto min-h-[64px] flex items-center justify-center text-center mt-6">
          {activeTech ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 px-6 rounded-2xl bg-[#0E1116] border border-crimson/40 shadow-xl text-xs sm:text-sm"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="font-bold text-white text-base">{activeTech.name}</span>
                <span className="text-crimson font-mono text-xs">[{activeTech.category}]</span>
              </div>
              <p className="text-slate-300 mt-1.5 leading-relaxed">{activeTech.desc}</p>
            </motion.div>
          ) : (
            <p className="text-xs text-slate-500 font-mono">
              Hover or tap on any node in the constellation to explore technology details
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
