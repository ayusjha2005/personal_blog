import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Camera, Trophy, BookOpen, Compass, Sparkles } from 'lucide-react';

export default function PersonalBentoGrid() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Parallax offsets for asymmetric depth
  const yParallaxLeft = useTransform(scrollYProgress, [0, 1], [-20, 30]);
  const yParallaxRight = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const stories = [
    {
      id: 'photo',
      badge: '01 / MOMENTS IN LIGHT',
      title: 'Photography & Perspectives',
      desc: 'Chasing golden hour light, mountain textures, and the geometry of architectural spaces.',
      image: '/images/contact-mountain.jpg',
      icon: Camera,
      tag: 'Visual Exploration',
      colSpan: 'lg:col-span-7',
      aspect: 'aspect-[16/10] sm:aspect-[16/9]',
      revealDirection: 'from-left',
    },
    {
      id: 'sports',
      badge: '02 / ENERGY & FOCUS',
      title: 'Cricket & Football',
      desc: 'Competitive rhythm, field strategy, endurance, and the clarity that comes from active sport.',
      image: '/images/hero-mountain.jpg',
      icon: Trophy,
      tag: 'Discipline & Grit',
      colSpan: 'lg:col-span-5',
      aspect: 'aspect-[4/3] sm:aspect-[1/1]',
      revealDirection: 'from-right',
    },
    {
      id: 'reading',
      badge: '03 / DEEP DIVES',
      title: 'Reading & Learning',
      desc: 'Systems architecture, computer history, philosophy, and the ideas behind great software.',
      image: '/images/article-productivity.jpg',
      icon: BookOpen,
      tag: 'Curiosity Engine',
      colSpan: 'lg:col-span-5',
      aspect: 'aspect-[4/3] sm:aspect-[1/1]',
      revealDirection: 'from-left',
    },
    {
      id: 'exploration',
      badge: '04 / DIGITAL FRONTIERS',
      title: 'Deep Tech & Cosmos',
      desc: 'Fascinated by astrophysics, Linux kernels, neural networks, and the boundless limits of computation.',
      image: '/images/hero-crimson-planet.jpg',
      icon: Compass,
      tag: 'Infinite Horizons',
      colSpan: 'lg:col-span-7',
      aspect: 'aspect-[16/10] sm:aspect-[16/9]',
      revealDirection: 'from-right',
    },
  ];

  return (
    <section ref={containerRef} id="beyond-coding" className="relative w-full py-24 overflow-hidden">
      {/* Background Ambient Crimson Nebula & Particles */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-crimson/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-rose-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-0.5 bg-crimson shadow-[0_0_8px_#E11D48]" />
            <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              04 / BEYOND CODING
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight">
            Beyond <span className="text-crimson drop-shadow-[0_0_25px_rgba(225,29,72,0.6)]">Coding.</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
            The passions, sports, books, and creative rituals that keep me balanced, curious, and grounded outside the terminal.
          </p>
        </motion.div>

        {/* Asymmetric Staggered Storytelling Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {stories.map((story, index) => {
            const Icon = story.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={story.id}
                style={{ y: isEven ? yParallaxLeft : yParallaxRight }}
                initial={{
                  opacity: 0,
                  x: story.revealDirection === 'from-left' ? -30 : 30,
                  clipPath: 'inset(10% 0 10% 0 round 24px)',
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  clipPath: 'inset(0% 0 0% 0 round 24px)',
                }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`relative ${story.colSpan} group overflow-hidden rounded-3xl bg-[#0E1116] border border-white/10 hover:border-crimson/60 shadow-2xl transition-all duration-500`}
              >
                {/* Image Container with Dynamic Parallax & Zoom */}
                <div className={`relative w-full ${story.aspect} overflow-hidden`}>
                  <img
                    src={story.image}
                    alt={story.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out filter brightness-90 group-hover:brightness-100"
                  />

                  {/* Multi-layer Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-[#07080B]/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#07080B]/40 via-transparent to-transparent" />

                  {/* Top Badge Overlay */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#07080B]/80 backdrop-blur-md border border-white/10 text-[11px] font-mono font-semibold text-slate-300">
                      {story.badge}
                    </span>
                  </div>

                  {/* Floating Micro-spark on Hover */}
                  {hoveredIdx === index && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-crimson/20 border border-crimson/50 flex items-center justify-center text-crimson shadow-[0_0_12px_#E11D48]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </motion.div>
                  )}

                  {/* Bottom Text Content & Icon */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10 space-y-2">
                    <div className="flex items-center gap-2 text-crimson">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-300">
                        {story.tag}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold font-heading text-white group-hover:text-crimson transition-colors">
                      {story.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed opacity-85 group-hover:opacity-100 transition-opacity">
                      {story.desc}
                    </p>
                  </div>

                  {/* Glowing Rim Border on Hover */}
                  <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-crimson/40 transition-colors pointer-events-none shadow-[inset_0_0_20px_rgba(225,29,72,0.2)]" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Transition Connector Particles Flowing Toward Still Learning (Requirement 3) */}
        <div className="relative mt-20 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-px h-16 bg-gradient-to-b from-crimson to-transparent shadow-[0_0_10px_#E11D48]" />
          <div className="w-3 h-3 rounded-full bg-crimson shadow-[0_0_12px_#E11D48] animate-ping" />
        </div>
      </div>
    </section>
  );
}
