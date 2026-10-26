// Article Page Interactivity (Reading Progress, Code Copying, TOC Tracking)
document.addEventListener('DOMContentLoaded', () => {
  // 1. Reading Progress Bar
  const progressBar = document.querySelector('.reading-progress-bar');
  const articleContent = document.querySelector('.prose');

  if (progressBar && articleContent) {
    window.addEventListener('scroll', () => {
      const rect = articleContent.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const contentHeight = articleContent.offsetHeight;
      const contentTop = rect.top + window.scrollY;

      const scrollTop = window.scrollY;
      const start = contentTop - 80;
      const end = contentTop + contentHeight - windowHeight;

      if (scrollTop <= start) {
        progressBar.style.width = '0%';
      } else if (scrollTop >= end) {
        progressBar.style.width = '100%';
      } else {
        const percentage = ((scrollTop - start) / (end - start)) * 100;
        progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
      }
    });
  }

  // 2. Wrap and Decorate Code Blocks with Header and Copy Button
  const codeBlocks = document.querySelectorAll('.prose pre');
  codeBlocks.forEach((pre, index) => {
    // If not already wrapped
    if (!pre.parentElement.classList.contains('code-block-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';

      const codeElement = pre.querySelector('code');
      let lang = 'code';
      if (codeElement && codeElement.className) {
        const match = codeElement.className.match(/language-(\w+)/);
        if (match) lang = match[1];
      }

      const header = document.createElement('div');
      header.className = 'code-block-header';
      header.innerHTML = `
        <span class="code-lang">&lt; ${lang === 'json' ? 'settings.json' : lang}</span>
        <button class="copy-code-btn" type="button" aria-label="Copy code">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span class="copy-text">Copy</span>
        </button>
      `;

      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);

      const copyBtn = header.querySelector('.copy-code-btn');
      copyBtn.addEventListener('click', () => {
        const textToCopy = pre.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
          const copyTextSpan = copyBtn.querySelector('.copy-text');
          copyTextSpan.textContent = 'Copied!';
          copyBtn.style.color = '#10B981';
          setTimeout(() => {
            copyTextSpan.textContent = 'Copy';
            copyBtn.style.color = '';
          }, 2000);
        });
      });
    }
  });

  // 3. Highlight Active Heading in Table of Contents
  const tocLinks = document.querySelectorAll('.toc-link');
  const headings = document.querySelectorAll('.prose h2, .prose h3');

  if (tocLinks.length > 0 && headings.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            tocLinks.forEach((link) => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );

    headings.forEach((h) => observer.observe(h));
  }
});
