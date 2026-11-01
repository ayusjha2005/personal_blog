import { ArrowUp, Mail, Heart } from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon, InstagramIcon } from '../common/SocialIcons';
import { Link } from 'react-router-dom';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-subtle bg-surface transition-colors mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-xl text-primary font-heading">
              Ayush Jha
              <span className="w-2 h-2 rounded-full bg-crimson" />
            </Link>
            <p className="text-sm text-secondary max-w-md leading-relaxed">
              Personal developer journal covering full-stack web development, software engineering, databases, Linux, and algorithms. Built with passion, ideas, and code.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/ayusjha2005"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-subtle bg-surface-elevated text-xs font-medium text-secondary hover:text-white hover:border-crimson/50 hover:bg-crimson/10 hover:shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:scale-105 active:scale-95 transition-all duration-300"
                aria-label="Visit Ayush Jha on GitHub (opens in new tab)"
              >
                <GithubIcon className="w-4 h-4 text-slate-300 group-hover:text-crimson transition-colors" />
                <span className="font-sans">GitHub</span>
              </a>

              <a
                href="https://www.linkedin.com/in/kumar-ayush-322294385/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-subtle bg-surface-elevated text-xs font-medium text-secondary hover:text-white hover:border-crimson/50 hover:bg-crimson/10 hover:shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:scale-105 active:scale-95 transition-all duration-300"
                aria-label="Connect with Ayush Jha on LinkedIn (opens in new tab)"
              >
                <LinkedinIcon className="w-4 h-4 text-slate-300 group-hover:text-crimson transition-colors" />
                <span className="font-sans">LinkedIn</span>
              </a>

              <a
                href="https://x.com/ayushjha"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center border border-subtle text-secondary hover:text-crimson hover:border-crimson/40 hover:bg-surface-elevated hover:scale-105 transition-all"
                aria-label="Twitter / X profile"
              >
                <TwitterIcon className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://instagram.com/ayushjha"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center border border-subtle text-secondary hover:text-crimson hover:border-crimson/40 hover:bg-surface-elevated hover:scale-105 transition-all"
                aria-label="Instagram profile"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>

              <a
                href="mailto:ayushjha@gmail.com"
                className="w-8 h-8 rounded-full flex items-center justify-center border border-subtle text-secondary hover:text-crimson hover:border-crimson/40 hover:bg-surface-elevated hover:scale-105 transition-all"
                aria-label="Send email"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm text-secondary">
              <li>
                <Link to="/" className="hover:text-crimson transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-crimson transition-colors">All Articles</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-crimson transition-colors">About Me</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-crimson transition-colors">Get in Touch</Link>
              </li>
            </ul>
          </div>

          {/* Topics */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5 text-sm text-secondary">
              <li>
                <Link to="/blog?category=web-development" className="hover:text-crimson transition-colors">Web Development</Link>
              </li>
              <li>
                <Link to="/blog?category=dsa" className="hover:text-crimson transition-colors">DSA &amp; Algorithms</Link>
              </li>
              <li>
                <Link to="/blog?category=linux" className="hover:text-crimson transition-colors">Linux &amp; Tools</Link>
              </li>
              <li>
                <Link to="/blog?category=projects" className="hover:text-crimson transition-colors">Projects &amp; Hackathons</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 mt-10 border-t border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} Ayush Jha. All rights reserved. Learning in public, building in private.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-crimson fill-crimson" /> in India
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-crimson transition-colors px-2 py-1 rounded border border-subtle hover:border-crimson/30"
              aria-label="Back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
