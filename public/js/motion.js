(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const groups = [
    ['.hero__grid > div:first-child', 'reveal reveal--left'],
    ['.scanner', 'reveal reveal--right'],
    ['.section__eyebrow, .section__title, .section__lead', 'reveal'],
    ['.step, .feature, .stat-card', 'reveal'],
    ['.app-preview, .cta-final, .photo-frame, .download-card, .panel, .table-wrap', 'reveal reveal--scale'],
    ['.admin-content > h1, .admin-content > .subtitle, .alert', 'reveal'],
  ];

  groups.forEach(([selector, classes]) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.add(...classes.split(' '));
    });
  });

  ['.steps', '.features', '.stat-grid'].forEach((selector) => {
    document.querySelectorAll(selector).forEach((group) => {
      [...group.children].forEach((item, index) => {
        item.style.setProperty('--reveal-delay', `${Math.min(index * 75, 300)}ms`);
      });
    });
  });

  const targets = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

  targets.forEach((element) => observer.observe(element));
})();
