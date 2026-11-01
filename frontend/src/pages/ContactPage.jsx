import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/common/SocialIcons';
import { api } from '../services/api';
import { pageVariants, fadeInUp } from '../animations/variants';

export default function ContactPage() {
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    document.title = "Contact & Connect | Ayush Jha";
    let mounted = true;
    api.getProfile()
      .then((res) => {
        if (mounted) setProfile(res.profile || {});
      })
      .catch((err) => console.error(err));
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in your name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.sendContact(formData);
      setSuccessMsg(res.message || "Thank you! Your message has been sent successfully.");
      setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const social = profile.socialLinks || {};
  const githubUrl = social.github || 'https://github.com/ayusjha2005';
  const linkedinUrl = social.linkedin || 'https://www.linkedin.com/in/kumar-ayush-322294385/';

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-6xl mx-auto px-4 sm:px-6 py-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Visual Card with Details */}
        <motion.div
          variants={fadeInUp}
          className="lg:col-span-5 relative overflow-hidden rounded-3xl min-h-[440px] flex flex-col justify-between p-8 sm:p-10 border border-white/10 shadow-xl group"
        >
          {/* Background image & gradient */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/contact-mountain.jpg"
              alt="Mountain peaks in mist"
              className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/80 to-[#0A0C10]/40" />
          </div>

          {/* Top content */}
          <div className="relative z-10 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
              Let's Connect
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Have a question, collaboration idea, software inquiry, or just want to discuss tech? I'd love to hear from you.
            </p>
          </div>

          {/* Contact Details List */}
          <div className="relative z-10 space-y-4 pt-6 my-6 border-y border-white/10">
            <div className="flex items-center gap-3 text-slate-200 text-xs sm:text-sm">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-crimson" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</div>
                <a href={`mailto:${profile.contactEmail || 'ayushjha@gmail.com'}`} className="hover:text-crimson transition-colors">
                  {profile.contactEmail || 'ayushjha@gmail.com'}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-200 text-xs sm:text-sm">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-crimson" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location</div>
                <span>{profile.location || 'India'}</span>
              </div>
            </div>

            {/* LinkedIn */}
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect with Ayush Jha on LinkedIn (opens in new tab)"
              className="group/link flex items-center gap-3.5 text-slate-200 hover:text-white transition-all p-2 -mx-2 rounded-2xl hover:bg-white/5 active:scale-98"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 group-hover/link:bg-crimson/20 border border-white/10 group-hover/link:border-crimson/50 flex items-center justify-center shrink-0 transition-all duration-300 group-hover/link:scale-110 shadow-sm">
                <LinkedinIcon className="w-4 h-4 text-slate-300 group-hover/link:text-crimson transition-colors" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-400 group-hover/link:text-crimson font-bold uppercase tracking-wider transition-colors">
                  LinkedIn
                </div>
                <div className="text-xs sm:text-sm text-slate-200 group-hover/link:text-white group-hover/link:underline decoration-crimson/60 underline-offset-4 transition-colors font-medium truncate">
                  linkedin.com/in/kumar-ayush-322294385/
                </div>
              </div>
            </a>

            {/* GitHub */}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Ayush Jha on GitHub (opens in new tab)"
              className="group/link flex items-center gap-3.5 text-slate-200 hover:text-white transition-all p-2 -mx-2 rounded-2xl hover:bg-white/5 active:scale-98"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 group-hover/link:bg-crimson/20 border border-white/10 group-hover/link:border-crimson/50 flex items-center justify-center shrink-0 transition-all duration-300 group-hover/link:scale-110 shadow-sm">
                <GithubIcon className="w-4 h-4 text-slate-300 group-hover/link:text-crimson transition-colors" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-400 group-hover/link:text-crimson font-bold uppercase tracking-wider transition-colors">
                  GitHub
                </div>
                <div className="text-xs sm:text-sm text-slate-200 group-hover/link:text-white group-hover/link:underline decoration-crimson/60 underline-offset-4 transition-colors font-medium truncate">
                  github.com/ayusjha2005
                </div>
              </div>
            </a>
          </div>

          {/* Cursive quote */}
          <div className="relative z-10">
            <span className="script-font text-2xl text-crimson/90">
              {profile.contactScriptQuote || "Let's Build Something Amazing."}
            </span>
          </div>
        </motion.div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 rounded-3xl bg-surface border border-subtle shadow-md flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-primary">
                Send a Message
              </h2>
              <p className="text-xs sm:text-sm text-secondary mt-1">
                Fill out the form below and I'll get back to you within 24 hours.
              </p>
            </div>

            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm font-semibold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Spam honeypot hidden from humans */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex="-1"
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactName" className="block text-xs font-bold text-secondary mb-1.5">
                    Your Name *
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Maya Chen"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-surface-elevated border border-subtle focus:border-crimson focus:outline-none text-sm text-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-xs font-bold text-secondary mb-1.5">
                    Email Address *
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    required
                    maxLength={120}
                    placeholder="maya@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-surface-elevated border border-subtle focus:border-crimson focus:outline-none text-sm text-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contactSubject" className="block text-xs font-bold text-secondary mb-1.5">
                  Subject (Optional)
                </label>
                <input
                  id="contactSubject"
                  type="text"
                  maxLength={200}
                  placeholder="e.g. Collaboration on Open Source Project"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-surface-elevated border border-subtle focus:border-crimson focus:outline-none text-sm text-primary transition-colors"
                />
              </div>

              <div>
                <label htmlFor="contactMsg" className="block text-xs font-bold text-secondary mb-1.5">
                  Your Message *
                </label>
                <textarea
                  id="contactMsg"
                  rows={5}
                  required
                  maxLength={5000}
                  placeholder="Tell me about your project, idea, or questions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-surface-elevated border border-subtle focus:border-crimson focus:outline-none text-sm text-primary transition-colors resize-y min-h-[120px]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-crimson hover:bg-crimson-hover disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-crimson/30 hover:scale-102 active:scale-98 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
