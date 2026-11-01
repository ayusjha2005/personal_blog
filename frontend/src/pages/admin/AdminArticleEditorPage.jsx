import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { marked } from 'marked';
import {
  Save,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { pageVariants } from '../../animations/variants';

export default function AdminArticleEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    slug: '',
    category: 'Web Development',
    tags: '',
    isFeatured: false,
    status: 'draft',
    excerpt: '',
    content: '',
  });

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');
  const [existingCoverUrl, setExistingCoverUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  // Load categories and article if editing
  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.categories) setCategories(res.categories);
    });

    if (isEdit) {
      api.getAdminArticle(id)
        .then((res) => {
          if (res.article) {
            const art = res.article;
            setFormData({
              title: art.title || '',
              subtitle: art.subtitle || '',
              slug: art.slug || '',
              category: art.category || 'Web Development',
              tags: Array.isArray(art.tags) ? art.tags.join(', ') : art.tags || '',
              isFeatured: Boolean(art.isFeatured),
              status: art.status || 'draft',
              excerpt: art.excerpt || '',
              content: art.content || '',
            });
            if (art.coverImage) {
              setExistingCoverUrl(art.coverImage);
              setCoverPreviewUrl(art.coverImage);
            }
          }
        })
        .catch((err) => {
          setErrorMsg(err.message || 'Failed to load article');
        });
    }
  }, [id, isEdit]);

  // Handle title change & auto-generate slug for new articles
  const handleTitleChange = (val) => {
    setFormData((prev) => {
      const updated = { ...prev, title: val };
      if (!isEdit) {
        updated.slug = val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      return updated;
    });
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload JPEG, PNG, or WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds 5 MB limit.');
      return;
    }

    setCoverImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreviewUrl(objectUrl);
    setErrorMsg('');
  };

  const handleRemoveCover = () => {
    setCoverImageFile(null);
    setCoverPreviewUrl('');
    setExistingCoverUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      setErrorMsg('Please fill in title, excerpt, and content.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('subtitle', formData.subtitle.trim());
      data.append('category', formData.category);
      data.append('tags', formData.tags);
      data.append('isFeatured', formData.isFeatured);
      data.append('status', formData.status);
      data.append('excerpt', formData.excerpt.trim());
      data.append('content', formData.content.trim());

      if (coverImageFile) {
        data.append('coverImage', coverImageFile);
      } else if (existingCoverUrl) {
        data.append('coverImage', existingCoverUrl);
      }

      if (isEdit) {
        await api.updateArticle(id, data);
        setSuccessMsg('Article updated successfully!');
      } else {
        const res = await api.createArticle(data);
        setSuccessMsg('Article created successfully!');
        if (res.article?._id) {
          setTimeout(() => navigate(`/admin/articles`), 1000);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save article.');
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
      className="space-y-6"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-subtle">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/articles"
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-subtle text-secondary hover:text-primary hover:bg-surface-elevated transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold font-heading text-primary">
              {isEdit ? 'Edit Article' : 'Create New Article'}
            </h1>
            <p className="text-xs text-muted">
              {isEdit ? 'Update content, tags, or publication status.' : 'Write in Markdown with real-time live preview.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/articles"
            className="px-4 py-2 rounded-xl text-xs font-bold text-secondary hover:text-primary border border-subtle transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="articleEditorForm"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-crimson hover:bg-crimson-hover disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-crimson/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Article'}</span>
          </button>
        </div>
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

      <form id="articleEditorForm" onSubmit={handleSubmit} className="space-y-6">
        {/* Core Metadata Grid */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-subtle shadow-md space-y-5">
          <h2 className="text-base font-bold font-heading text-primary">Metadata &amp; Categorization</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-secondary mb-1.5">
                Article Title *
              </label>
              <input
                type="text"
                required
                maxLength={200}
                placeholder="e.g. Building High-Performance REST APIs with Node.js and MongoDB"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle focus:border-crimson focus:outline-none text-sm font-semibold text-primary transition-colors"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">
                Subtitle (Optional)
              </label>
              <input
                type="text"
                maxLength={300}
                placeholder="Secondary descriptive headline..."
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle focus:border-crimson focus:outline-none text-xs text-primary transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle focus:border-crimson focus:outline-none text-xs font-bold text-primary transition-colors cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                placeholder="Node.js, Express, MongoDB, Architecture"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle focus:border-crimson focus:outline-none text-xs text-primary transition-colors"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-secondary mb-1.5">
                Publication Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle focus:border-crimson focus:outline-none text-xs font-bold text-primary transition-colors cursor-pointer"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Public)</option>
              </select>
            </div>

            {/* Featured toggle */}
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <input
                id="featuredCheck"
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-crimson focus:ring-crimson cursor-pointer"
              />
              <label htmlFor="featuredCheck" className="text-xs font-semibold text-primary cursor-pointer">
                Mark as Featured Article (shown prominently on Home page)
              </label>
            </div>
          </div>
        </div>

        {/* Cover Image Upload Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-subtle shadow-md space-y-4">
          <h2 className="text-base font-bold font-heading text-primary">Cover Image</h2>
          <p className="text-xs text-secondary">
            Upload a high-resolution cover image. Handled automatically via Cloudinary.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          {coverPreviewUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-subtle max-h-72 w-full max-w-lg bg-surface-elevated group">
              <img
                src={coverPreviewUrl}
                alt="Article cover preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileSelect(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-subtle hover:border-crimson rounded-2xl p-8 text-center cursor-pointer hover:bg-surface-elevated/40 transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-crimson/10 text-crimson flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-primary">
                Click to browse or drag and drop an image
              </div>
              <div className="text-[11px] text-muted">PNG, JPG, or WebP up to 5 MB</div>
            </div>
          )}
        </div>

        {/* Excerpt */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-subtle shadow-md space-y-2">
          <label className="block text-xs font-bold text-primary">
            Summary / Excerpt *
          </label>
          <textarea
            required
            maxLength={500}
            rows={2}
            placeholder="Brief 1-3 sentence summary shown in card previews and search results..."
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle focus:border-crimson focus:outline-none text-xs text-primary transition-colors"
          />
        </div>

        {/* Split Markdown Editor & Live Preview */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-subtle shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-primary">
              Content (Markdown supported) *
            </h2>
            <span className="text-xs text-muted flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-crimson" />
              <span>Split Live Preview</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[480px]">
            {/* Editor Textarea */}
            <div className="flex flex-col">
              <textarea
                required
                placeholder="Write your article in Markdown here...

## Section Heading

Paragraph text with **bold** and `code` formatting.

```javascript
const message = 'Hello, Developer!';
console.log(message);
```"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="flex-1 w-full p-4 rounded-2xl bg-surface-elevated border border-subtle focus:border-crimson focus:outline-none font-mono text-xs text-primary leading-relaxed resize-y min-h-[380px]"
              />
            </div>

            {/* Live Rendered Pane */}
            <div className="p-5 rounded-2xl bg-surface-elevated/40 border border-subtle overflow-y-auto max-h-[580px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3 pb-2 border-b border-subtle">
                Real-Time Preview
              </div>
              <div
                className="prose text-xs sm:text-sm"
                dangerouslySetInnerHTML={{
                  __html: marked.parse(formData.content || '*Preview will appear here as you type...*'),
                }}
              />
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
