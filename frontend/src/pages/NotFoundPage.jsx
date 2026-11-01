import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ArrowLeft } from 'lucide-react';
import { pageVariants } from '../animations/variants';

export default function NotFoundPage() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-xl mx-auto px-4 py-24 text-center space-y-6"
    >
      <div className="w-16 h-16 rounded-full bg-crimson/10 text-crimson flex items-center justify-center mx-auto border border-crimson/20">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-crimson uppercase tracking-widest">404 Error</span>
        <h1 className="text-4xl font-extrabold font-heading text-primary">Page Not Found</h1>
        <p className="text-secondary text-sm max-w-sm mx-auto leading-relaxed">
          The page or article you are looking for may have been moved, renamed, or does not exist.
        </p>
      </div>

      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-crimson hover:bg-crimson-hover text-white text-xs font-bold shadow-lg shadow-crimson/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </motion.div>
  );
}
