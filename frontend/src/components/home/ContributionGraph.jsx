import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, GitCommit, Calendar, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export default function ContributionGraph() {
  const [data, setData] = useState({ activity: [], totalContributions: 0 });
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getActivity()
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load activity heatmap:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Compute color based on count
  const getColor = (count) => {
    if (count === 0) return 'bg-[#181D26] border border-white/5';
    if (count === 1) return 'bg-rose-950/80 border border-rose-900/60';
    if (count <= 3) return 'bg-rose-800/80 border border-rose-700/60';
    if (count <= 5) return 'bg-crimson border border-rose-500/60 shadow-sm shadow-crimson/30';
    return 'bg-rose-400 border border-rose-300 shadow-sm shadow-rose-400/40';
  };

  const activity = data.activity || [];
  const weeks = [];
  for (let i = 0; i < activity.length; i += 7) {
    weeks.push(activity.slice(i, i + 7));
  }

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-crimson" />
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Developer Activity
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <Flame className="w-4 h-4 text-amber-500" />
            Continuous Learning Heatmap
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1116] border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-3xl font-extrabold font-heading text-white flex items-center gap-2">
              {loading ? '...' : data.totalContributions.toLocaleString()}
              <span className="text-sm font-normal text-slate-400">contributions in the last year</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tracking code commits, open source experiments, and technical articles published.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 self-start sm:self-auto font-mono">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-[#181D26] border border-white/5" />
            <div className="w-3 h-3 rounded-sm bg-rose-950/80" />
            <div className="w-3 h-3 rounded-sm bg-rose-800/80" />
            <div className="w-3 h-3 rounded-sm bg-crimson" />
            <div className="w-3 h-3 rounded-sm bg-rose-400" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2 no-scrollbar">
          <div className="flex gap-1.5 min-w-[720px] justify-between">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day) => (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-3.5 h-3.5 rounded-sm transition-transform hover:scale-130 cursor-pointer ${getColor(
                      day.count
                    )}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip Bar */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-crimson" />
            <span>
              {hoveredDay ? (
                <>
                  <strong className="text-white">{hoveredDay.count} contribution{hoveredDay.count === 1 ? '' : 's'}</strong> on{' '}
                  {new Date(hoveredDay.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </>
              ) : (
                'Hover over any square to view daily developer activity'
              )}
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-crimson font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Learning in public
          </span>
        </div>
      </div>
    </section>
  );
}
