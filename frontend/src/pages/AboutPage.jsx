import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { pageVariants } from '../animations/variants';

import CursorParticleTrail from '../components/common/CursorParticleTrail';
import AboutHero from '../components/about/AboutHero';
import JourneyTimeline from '../components/about/JourneyTimeline';
import TechUniverse from '../components/about/TechUniverse';
import ProjectShowcase from '../components/about/ProjectShowcase';
import PersonalBentoGrid from '../components/about/PersonalBentoGrid';
import AboutClosing from '../components/about/AboutClosing';

export default function AboutPage() {
  const [profile, setProfile] = useState({});

  useEffect(() => {
    document.title = 'About Me | Ayush Jha';
    let mounted = true;
    api.getProfile()
      .then((res) => {
        if (mounted) setProfile(res.profile || {});
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
      });
    return () => {
      mounted = false;
      document.title = 'Ayush Jha | Ideas. Code. Progress.';
    };
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative w-full overflow-hidden bg-[#07080B] text-white"
    >
      {/* Desktop Cursor Particle Trails */}
      <CursorParticleTrail />

      {/* SECTION 01: HERO — BEYOND THE CODE */}
      <AboutHero profile={profile} />

      {/* Luminous Section Divider */}
      <div className="relative w-full py-4 overflow-hidden pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-crimson to-transparent opacity-60 shadow-[0_0_15px_#E11D48]" />
          <div className="absolute w-24 h-6 bg-crimson/20 rounded-full blur-xl" />
        </div>
      </div>

      {/* SECTION 02: MY JOURNEY (Interactive Timeline + Sunset Desk) */}
      <JourneyTimeline />

      {/* Luminous Section Divider */}
      <div className="relative w-full py-4 overflow-hidden pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />
        </div>
      </div>

      {/* SECTION 03: MY TECH UNIVERSE (Constellation + Orbiting Nodes) */}
      <TechUniverse />

      {/* Luminous Section Divider */}
      <div className="relative w-full py-4 overflow-hidden pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-crimson to-transparent opacity-60 shadow-[0_0_15px_#E11D48]" />
        </div>
      </div>

      {/* SECTION 04: THINGS I'VE BUILT (3D Project Showcase) */}
      <ProjectShowcase />

      {/* Luminous Section Divider */}
      <div className="relative w-full py-4 overflow-hidden pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />
        </div>
      </div>

      {/* SECTION 05: BEYOND CODING (Personal Bento Grid) */}
      <PersonalBentoGrid />

      {/* SECTION 06: CLOSING — STILL LEARNING. STILL BUILDING. */}
      <AboutClosing />
    </motion.div>
  );
}
