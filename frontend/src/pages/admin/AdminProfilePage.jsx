import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { pageVariants } from '../../animations/variants';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    heroHeadline: '',
    bio: '',
    extendedBio: '',
    tagline: '',
    heroScriptQuote: '',
    aboutScriptQuote: '',
    contactScriptQuote: '',
    degree: '',
    location: '',
    statusText: '',
    contactEmail: '',
    footerText: '',
    seoTitle: '',
    seoDescription: '',
    socialLinks: { github: '', linkedin: '', twitter: '', instagram: '', email: '' },
    profileImage: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    api.getAdminProfile()
      .then((res) => {
        if (res.profile) {
          setProfile({
            ...res.profile,
            socialLinks: res.profile.socialLinks || {},
          });
          if (res.profile.profileImage) {
            setAvatarPreview(res.profile.profileImage);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleAvatarSelect = (file) => {
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const data = new FormData();
      Object.keys(profile).forEach((k) => {
        if (k === 'socialLinks') {
          Object.keys(profile.socialLinks).forEach((sk) => {
            data.append(sk, profile.socialLinks[sk] || '');
          });
        } else if (k !== 'profileImage' && profile[k]) {
          data.append(k, profile[k]);
        }
      });

      if (avatarFile) {
        data.append('profileImage', avatarFile);
      }

      const res = await api.updateProfile(data);
      if (res.success) {
        setSuccessMsg('Profile settings updated successfully!');
        if (res.profile?.profileImage) {
          setAvatarPreview(res.profile.profileImage);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile settings.');
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
      className="space-y-6 max-w-4xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-subtle">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
            Site &amp; Author Profile
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Customize author identity, personal bio, signature cursive quotes, and social links.
          </p>
        </div>

        <button
          type="submit"
          form="profileForm"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-crimson hover:bg-crimson-hover disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-crimson/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : 'Save Profile'}</span>
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

      <form id="profileForm" onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image & Basic Info */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-subtle shadow-md space-y-6">
          <h2 className="text-base font-bold font-heading text-primary">Author Photo &amp; Name</h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-subtle bg-surface-elevated shrink-0 shadow-md">
              <img
                src={avatarPreview || '/images/profile.jpg'}
                alt="Profile avatar preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleAvatarSelect(e.target.files[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-subtle text-xs font-bold text-primary transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Photo</span>
              </button>
              <div className="text-[11px] text-muted">
                JPG, PNG, or WebP. Automatically processed and stored on Cloudinary.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-subtle">
            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">Hero Headline</label>
              <input
                type="text"
                value={profile.heroHeadline}
                onChange={(e) => setProfile({ ...profile, heroHeadline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bio & Details */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-subtle shadow-md space-y-4">
          <h2 className="text-base font-bold font-heading text-primary">Biographical Details</h2>

          <div>
            <label className="block text-xs font-bold text-secondary mb-1.5">Primary Bio (Intro on Homepage)</label>
            <textarea
              rows={2}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary mb-1.5">Extended Bio (About Page)</label>
            <textarea
              rows={3}
              value={profile.extendedBio}
              onChange={(e) => setProfile({ ...profile, extendedBio: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">Degree / Education</label>
              <input
                type="text"
                value={profile.degree}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">Mindset / Status</label>
              <input
                type="text"
                value={profile.statusText}
                onChange={(e) => setProfile({ ...profile, statusText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Signature Cursive Quotes */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-subtle shadow-md space-y-4">
          <h2 className="text-base font-bold font-heading text-primary">Signature Cursive Quotes</h2>
          <p className="text-xs text-secondary">Rendered in the distinctive Caveat cursive script on editorial cards.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">Hero Card Quote</label>
              <input
                type="text"
                value={profile.heroScriptQuote}
                onChange={(e) => setProfile({ ...profile, heroScriptQuote: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none script-font text-base"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">About Card Quote</label>
              <input
                type="text"
                value={profile.aboutScriptQuote}
                onChange={(e) => setProfile({ ...profile, aboutScriptQuote: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none script-font text-base"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">Contact Card Quote</label>
              <input
                type="text"
                value={profile.contactScriptQuote}
                onChange={(e) => setProfile({ ...profile, contactScriptQuote: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none script-font text-base"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-subtle shadow-md space-y-4">
          <h2 className="text-base font-bold font-heading text-primary">Social Channels &amp; Email</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">GitHub URL</label>
              <input
                type="url"
                value={profile.socialLinks?.github || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, github: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">LinkedIn URL</label>
              <input
                type="url"
                value={profile.socialLinks?.linkedin || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, linkedin: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">Twitter / X URL</label>
              <input
                type="url"
                value={profile.socialLinks?.twitter || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, twitter: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">Instagram URL</label>
              <input
                type="url"
                value={profile.socialLinks?.instagram || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, instagram: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-secondary mb-1.5">Contact Inquiry Email</label>
              <input
                type="email"
                value={profile.contactEmail}
                onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle text-xs text-primary focus:border-crimson focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
