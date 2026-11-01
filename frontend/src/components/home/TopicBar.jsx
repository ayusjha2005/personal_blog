import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code, Cpu, Terminal, FolderGit2, Briefcase } from 'lucide-react';

const topics = [
  { slug: 'web-development', name: 'Web Development', icon: Code, color: 'text-rose-500' },
  { slug: 'dsa', name: 'DSA & Algorithms', icon: Cpu, color: 'text-amber-500' },
  { slug: 'linux', name: 'Linux & Tools', icon: Terminal, color: 'text-emerald-500' },
  { slug: 'projects', name: 'Projects & Hackathons', icon: FolderGit2, color: 'text-sky-500' },
  { slug: 'career', name: 'Career & Internships', icon: Briefcase, color: 'text-purple-500' },
];

export default function TopicBar() {
  return (
    <section className="w-full py-4 overflow-x-auto no-scrollbar">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 py-1 overflow-x-auto no-scrollbar">
          {topics.map((t) => {
            const Icon = t.icon;
            return (
              <motion.div key={t.slug} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={`/blog?category=${t.slug}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-surface border border-subtle hover:border-crimson/30 hover:bg-surface-elevated text-secondary hover:text-primary transition-all whitespace-nowrap shadow-sm group"
                >
                  <Icon className={`w-4 h-4 ${t.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs sm:text-sm font-semibold">{t.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
