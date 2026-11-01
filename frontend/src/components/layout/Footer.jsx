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
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://github.com/ayushjha"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-subtle text-secondary hover:text-crimson hover:border-crimson/40 hover:bg-surface-elevated transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/in/ayushjha"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-subtle text-secondary hover:text-crimson hover:border-crimson/40 hover:bg-surface-elevated transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/ayushjha"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-subtle text-secondary hover:text-crimson hover:border-crimson/40 hover:bg-surface-elevated transition-colors"
                aria-label="Twitter / X"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/ayushjha"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-subtle text-secondary hover:text-crimson hover:border-crimson/40 hover:bg-surface-elevated transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="mailto:ayushjha@gmail.com"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-subtle text-secondary hover:text-crimson hover:border-crimson/40 hover:bg-surface-elevated transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
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
