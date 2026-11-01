import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function StepNavigator() {
  const [activeStep, setActiveStep] = useState('01');
  const location = useLocation();
  const navigate = useNavigate();

  const steps = [
    { id: '01', label: 'Home', path: '/', sectionId: 'hero' },
    { id: '02', label: 'Blogs', path: '/blog', sectionId: 'recent-blogs' },
    { id: '03', label: 'About', path: '/about', sectionId: 'about' },
    { id: '04', label: 'Stats', path: '/#stats', sectionId: 'stats' },
    { id: '05', label: 'Contact', path: '/contact', sectionId: 'contact' },
  ];

  useEffect(() => {
    // If not on homepage, set step based on route
    if (location.pathname === '/blog' || location.pathname.startsWith('/blog/')) {
      setActiveStep('02');
      return;
    }
    if (location.pathname === '/about') {
      setActiveStep('03');
      return;
    }
    if (location.pathname === '/contact') {
      setActiveStep('05');
      return;
    }

    // On homepage, track scroll position to update active step
    const handleScroll = () => {
      if (location.pathname !== '/') return;
      const scrollY = window.scrollY;
      const height = window.innerHeight;

      if (scrollY < height * 0.7) {
        setActiveStep('01');
      } else if (scrollY < height * 1.8) {
        setActiveStep('02');
      } else if (scrollY < height * 2.8) {
        setActiveStep('04');
      } else {
        setActiveStep('05');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleStepClick = (step) => {
    setActiveStep(step.id);
    if (location.pathname === '/' && step.sectionId) {
      const el = document.getElementById(step.sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(step.path);
  };

  return (
    <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col items-start gap-7 pointer-events-auto">
      {/* Vertical Track Line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10 -z-10" />

      {steps.map((step) => {
        const isActive = activeStep === step.id;
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => handleStepClick(step)}
            className="group flex items-center gap-3 cursor-pointer text-left focus:outline-none"
          >
            {/* Step Bullet / Glowing Ring */}
            <div className="relative flex items-center justify-center w-4 h-4">
              {isActive ? (
                <>
                  <motion.div
                    layoutId="activeStepHalo"
                    className="absolute inset-0 rounded-full border border-crimson shadow-[0_0_10px_#E11D48]"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                  <div className="w-1.5 h-1.5 rounded-full bg-crimson" />
                </>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-slate-300 transition-colors" />
              )}
            </div>

            {/* Label Row: Number + Name */}
            <div className="flex items-center gap-1.5 font-mono text-xs transition-all duration-200">
              <span
                className={`${
                  isActive
                    ? 'text-crimson font-bold'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                {step.id}
              </span>
              <span
                className={`font-sans ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                {step.label}
              </span>
            </div>
          </button>
        );
      })}
    </aside>
  );
}
