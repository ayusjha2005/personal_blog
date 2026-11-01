import { useEffect, useState } from 'react';
import { AlignLeft } from 'lucide-react';

export default function TableOfContents({ items = [] }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!items || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0% -60% 0%',
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <div className="p-6 rounded-3xl bg-surface border border-subtle shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
        <AlignLeft className="w-3.5 h-3.5 text-crimson" />
        <span>Table of Contents</span>
      </div>

      <nav className="space-y-1.5 text-xs sm:text-sm">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById(item.id);
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                  setActiveId(item.id);
                }
              }}
              className={`block py-1 px-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-crimson/10 text-crimson font-bold border-l-2 border-crimson translate-x-1'
                  : 'text-secondary hover:text-primary hover:bg-surface-elevated'
              } ${item.level === 3 ? 'pl-5 text-xs' : ''}`}
            >
              {item.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
