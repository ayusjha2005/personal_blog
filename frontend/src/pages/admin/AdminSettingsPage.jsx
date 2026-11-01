import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle2, AlertCircle, Globe } from 'lucide-react';
import { api } from '../../services/api';
import { pageVariants } from '../../animations/variants';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    websiteTitle: '',
    websiteDescription: '',
    postsPerPage: 6,
    contactEmail: '',
    footerContent: '',
    allowPublicIndexing: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.getSettings()
      .then((res) => {
        if (res.settings) {
          setSettings(res.settings);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.updateSettings(settings);
      setSuccessMsg('Website settings saved successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save website settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 max-w-3xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-subtle">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
            Website Settings
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Global search engine configuration, pagination limits, and default metadata.
          </p>
        </div>

        <button
          type="submit"
          form="settingsForm"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-crimson hover:bg-crimson-hover disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-crimson/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form id="settingsForm" onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-surface border border-subtle shadow-md space-y-5">
        <div>
          <label className="block text-xs font-bold text-secondary mb-1.5">
            Website Title (SEO &amp; Open Graph)
          </label>
          <input
            type="text"
            required
            value={settings.websiteTitle}
            onChange={(e) => setSettings({ ...settings, websiteTitle: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-secondary mb-1.5">
            Default Meta Description
          </label>
          <textarea
            rows={3}
            value={settings.websiteDescription}
            onChange={(e) => setSettings({ ...settings, websiteDescription: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-secondary mb-1.5">
              Articles Per Page
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={settings.postsPerPage}
              onChange={(e) => setSettings({ ...settings, postsPerPage: parseInt(e.target.value, 10) || 6 })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary mb-1.5">
              Admin Notifications Email
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-secondary mb-1.5">
            Footer Copyright Content
          </label>
          <input
            type="text"
            value={settings.footerContent}
            onChange={(e) => setSettings({ ...settings, footerContent: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-subtle">
          <input
            id="allowIndexingCheck"
            type="checkbox"
            checked={settings.allowPublicIndexing}
            onChange={(e) => setSettings({ ...settings, allowPublicIndexing: e.target.checked })}
            className="w-4 h-4 rounded text-crimson focus:ring-crimson cursor-pointer"
          />
          <label htmlFor="allowIndexingCheck" className="text-xs font-semibold text-primary cursor-pointer flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-crimson" />
            <span>Allow Search Engine Indexing (Googlebot, Bingbot, web crawlers)</span>
          </label>
        </div>
      </form>
    </motion.div>
  );
}
