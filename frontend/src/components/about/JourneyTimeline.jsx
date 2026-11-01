import { motion } from 'framer-motion';
import { Sprout, Code2, Layers, Server, Rocket } from 'lucide-react';

export default function JourneyTimeline() {
  const milestones = [
    {
      icon: Sprout,
      title: 'The Beginning',
      desc: 'Curiosity for technology, gadgets and how things work.',
    },
    {
      icon: Code2,
      title: 'Learning to Code',
      desc: 'Started with C/C++, explored DSA, and built a strong foundation.',
    },
    {
      icon: Layers,
      title: 'Building Projects',
      desc: 'Turned ideas into real projects — Aarogyam, Road Doctor, and this blog.',
    },
    {
      icon: Server,
      title: 'Exploring Systems',
      desc: 'Diving deeper into backend, databases, Linux and cloud.',
    },
    {
      icon: Rocket,
      title: "What's Next?",
      desc: 'Aim to work on scalable systems, AI and high-impact products.',
    },
  ];

  return (
    <section id="journey" className="relative w-full py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Timeline Milestones */}
          <div className="lg:col-span-7 space-y-10">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-0.5 bg-crimson shadow-[0_0_6px_#E11D48]" />
                <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  01 / JOURNEY
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight">
                My <span className="text-crimson">Journey</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-lg leading-relaxed">
                A timeline of how I got here, what I've learned and where I'm going next.
              </p>
            </div>

            {/* Vertical Timeline Track & Milestones */}
            <div className="relative pl-8 sm:pl-10 space-y-8 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-crimson before:via-rose-600/50 before:to-transparent">
              {milestones.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="relative group"
                  >
                    {/* Glowing Bullet Icon on the vertical line */}
                    <div className="absolute -left-8 sm:-left-10 top-0.5 w-7 h-7 rounded-full bg-[#0F1218] border border-crimson/60 flex items-center justify-center text-crimson group-hover:scale-115 group-hover:shadow-[0_0_12px_#E11D48] transition-all">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    {/* Milestone Card Content */}
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-crimson transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Cozy Sunset Mountain Window Desk Scene (Reference Image) */}
          <div className="lg:col-span-5 relative flex justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className="relative w-full max-w-lg aspect-[16/11] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(225,29,72,0.15)] group"
            >
              <img
                src="/images/about-journey-desk.jpg"
                alt="Developer workspace at dusk overlooking mountains"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07080B]/60 via-transparent to-transparent" />

              {/* Glowing Corner Accents */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-crimson/20 border border-crimson/40 backdrop-blur-md flex items-center justify-center text-white text-xs font-mono font-bold shadow-md">
                &lt;/&gt;
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
