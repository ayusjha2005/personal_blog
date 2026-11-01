import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const projects = [
    {
      id: 'aarogyam',
      title: 'Aarogyam',
      desc: 'AI-powered patient case-taking platform with ABDM integration.',
      image: '/images/project-aarogyam.jpg',
      tags: ['React', 'Node.js', 'PostgreSQL'],
      link: 'https://github.com/ayusjha2005',
    },
    {
      id: 'road-doctor',
      title: 'Road Doctor',
      desc: 'IoT-based system to detect potholes and monitor road health.',
      image: '/images/blog-devops.jpg',
      tags: ['ESP32', 'C++', 'GPS'],
      link: 'https://github.com/ayusjha2005',
    },
    {
      id: 'personal-blog',
      title: 'Personal Tech Blog',
      desc: 'A developer blog to write, share and document my learnings.',
      image: '/images/hero-crimson-planet.jpg',
      tags: ['Express', 'MongoDB', 'React'],
      link: '/',
    },
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  return (
    <section id="projects" className="relative w-full py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Navigation Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-0.5 bg-crimson shadow-[0_0_6px_#E11D48]" />
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                03 / PROJECTS
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight">
              Things I've <span className="text-crimson">Built</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-lg leading-relaxed">
              Real projects that turned ideas into working solutions.
            </p>
          </div>

          {/* Left / Right Carousel Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous project"
              className="w-10 h-10 rounded-full bg-[#0E1116] border border-white/10 hover:border-crimson hover:text-crimson text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next project"
              className="w-10 h-10 rounded-full bg-[#0E1116] border border-white/10 hover:border-crimson hover:text-crimson text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3-Column Project Grid (Exact Match to Reference Image) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj, idx) => (
            <motion.div
              key={proj.id}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#0E1116] border border-white/10 hover:border-crimson/50 hover:shadow-[0_0_30px_rgba(225,29,72,0.25)] transition-all duration-300 p-4 sm:p-5"
            >
              <div>
                {/* Preview Image with Hover Zoom & Diagonal Link */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-4 bg-black/40">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116]/80 via-transparent to-transparent opacity-60" />

                  {/* Diagonal Arrow Icon */}
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${proj.title}`}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#07080B]/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-crimson group-hover:border-crimson transition-colors shadow-lg"
                  >
                    <ArrowUpRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold font-heading text-white group-hover:text-crimson transition-colors mb-2">
                  {proj.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                  {proj.desc}
                </p>
              </div>

              {/* Technology Tags Row */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
                {proj.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-white/5 border border-white/10 text-slate-300 group-hover:border-crimson/30 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination Dots Indicator */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {projects.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentIndex === i
                  ? 'bg-crimson w-6 shadow-[0_0_8px_#E11D48]'
                  : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
