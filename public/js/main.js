// Main Client-Side Interactivity
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNavDrawer = document.querySelector('.mobile-nav-drawer');

  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileNavDrawer.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking any nav link
    mobileNavDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNavDrawer.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!mobileNavDrawer.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileNavDrawer.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNavDrawer.classList.contains('open')) {
        mobileNavDrawer.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 2. Bookmarking with LocalStorage
  const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
  let savedBookmarks = JSON.parse(localStorage.getItem('ayush_blog_bookmarks') || '[]');

  function updateBookmarkStates() {
    bookmarkButtons.forEach((btn) => {
      const slug = btn.getAttribute('data-slug');
      const isSaved = savedBookmarks.includes(slug);
      const icon = btn.querySelector('.bookmark-icon');
      if (isSaved) {
        btn.classList.add('bookmarked');
        if (icon) icon.setAttribute('fill', 'currentColor');
      } else {
        btn.classList.remove('bookmarked');
        if (icon) icon.setAttribute('fill', 'none');
      }
    });
  }

  updateBookmarkStates();

  bookmarkButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const slug = btn.getAttribute('data-slug');
      if (!slug) return;

      if (savedBookmarks.includes(slug)) {
        savedBookmarks = savedBookmarks.filter((item) => item !== slug);
        showToast('Article removed from bookmarks');
      } else {
        savedBookmarks.push(slug);
        showToast('Article saved to bookmarks');
      }

      localStorage.setItem('ayush_blog_bookmarks', JSON.stringify(savedBookmarks));
      updateBookmarkStates();
    });
  });

  // 3. Share Button Handler
  const shareButtons = document.querySelectorAll('.share-btn');
  shareButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const title = document.title;
      const url = window.location.href;

      if (navigator.share) {
        try {
          await navigator.share({ title, url });
        } catch (err) {
          if (err.name !== 'AbortError') {
            copyLinkToClipboard(url);
          }
        }
      } else {
        copyLinkToClipboard(url);
      }
    });
  });

  function copyLinkToClipboard(url) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('Article link copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy link.');
    });
  }

  // Toast Notification System
  function showToast(message) {
    let toast = document.getElementById('site-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'site-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background-color: var(--accent-primary);
        color: var(--text-inverse);
        padding: 0.75rem 1.25rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        font-size: 0.875rem;
        font-weight: 600;
        z-index: 9999;
        transition: opacity 0.3s ease, transform 0.3s ease;
        opacity: 0;
        transform: translateY(10px);
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 2500);
  }

  // 4. Follow Modal Trigger
  const followBtns = document.querySelectorAll('.follow-btn');
  followBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Subscribed to Ayush Jha updates!');
    });
  });
});
