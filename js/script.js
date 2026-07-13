// scroll progress bar
const progress = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = scrolled + '%';
});

// active nav tab on scroll
const sections = document.querySelectorAll('section[id]');
const tabs = document.querySelectorAll('.tab');
const tabObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      tabs.forEach(t => t.classList.remove('active'));
      const match = document.querySelector('.tab[href="#' + e.target.id + '"]');
      if (match) match.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => tabObserver.observe(s));

// project card reveal on scroll
const cards = document.querySelectorAll('.project-card');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
cards.forEach(el => io.observe(el));

// magnetic buttons (skipped under reduced motion)
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  ['magnet1', 'magnet2'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.15;
      const y = (e.clientY - r.top - r.height / 2) * 0.25;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
  });
}

// Engineering Notebook
function renderNotebook() {
  if (typeof NOTEBOOK_DATA === 'undefined') return;

  const decisionCount = NOTEBOOK_DATA.filter(e => e.type === 'decision').length;
  const bugCount = NOTEBOOK_DATA.filter(e => e.type === 'bug').length;
  const countDecEl = document.getElementById('nb-count-decision');
  const countBugEl = document.getElementById('nb-count-bug');
  if (countDecEl) countDecEl.textContent = decisionCount;
  if (countBugEl) countBugEl.textContent = bugCount;

  const container = document.getElementById('nb-entries');
  if (!container) return;

  function buildEntries(filter) {
    container.innerHTML = '';
    NOTEBOOK_DATA.filter(e => e.type === filter).forEach(entry => {
      container.appendChild(createCard(entry));
    });
  }

  function createCard(entry) {
    const article = document.createElement('article');
    article.className = 'nb-entry';

    const decisionLabel = entry.type === 'bug' ? 'Fix' : 'Decision';
    let fields = '';

    if (entry.investigation) {
      const items = entry.investigation.map(s => `<li>${s}</li>`).join('');
      fields += `<div><div class="nb-field-label">Investigation</div><ul class="nb-investigation">${items}</ul></div>`;
    }
    if (entry.context) {
      fields += `<div><div class="nb-field-label">Context</div><p class="nb-field-text">${entry.context}</p></div>`;
    }
    if (entry.decision) {
      fields += `<div><div class="nb-field-label">${decisionLabel}</div><p class="nb-field-text">${entry.decision}</p></div>`;
    }
    if (entry.rejected) {
      fields += `<div><div class="nb-field-label">Rejected</div><p class="nb-field-text">${entry.rejected}</p></div>`;
    }
    if (entry.consequence) {
      fields += `<div><div class="nb-field-label">Consequence</div><p class="nb-field-text">${entry.consequence}</p></div>`;
    }
    if (entry.principle) {
      fields += `<div class="nb-principle"><div class="nb-field-label">Principle</div><p class="nb-field-text">${entry.principle}</p></div>`;
    }

    const tagsHTML = entry.tags.map(t => `<span class="nb-tag">${t}</span>`).join('');

    article.innerHTML = `
      <div class="nb-head" role="button" tabindex="0" aria-expanded="false">
        <div>
          <div class="nb-meta">
            <span class="nb-id">${entry.id}</span>
            <span class="nb-project">${entry.project}</span>
            <span class="nb-status">${entry.status}</span>
          </div>
          <div class="nb-tags-row">${tagsHTML}</div>
          <div class="nb-title">${entry.title}</div>
          <div class="nb-takeaway">${entry.takeaway}</div>
        </div>
        <span class="nb-chevron">&#x203A;</span>
      </div>
      <div class="nb-body" aria-hidden="true">
        <div class="nb-body-inner">
          <div class="nb-body-content">${fields}</div>
        </div>
      </div>
    `;

    const head = article.querySelector('.nb-head');
    const body = article.querySelector('.nb-body');

    function toggle() {
      const isOpen = article.classList.toggle('open');
      head.setAttribute('aria-expanded', String(isOpen));
      body.setAttribute('aria-hidden', String(!isOpen));
    }

    head.addEventListener('click', toggle);
    head.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    return article;
  }

  buildEntries('decision');

  document.querySelectorAll('.nb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nb-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      buildEntries(tab.dataset.filter);
    });
  });
}

renderNotebook();

// Carousel
function initCarousel(carouselId) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const imgs = carousel.querySelectorAll('.carousel-img');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const currentEl = carousel.querySelector('#carousel-current');
  const totalEl = carousel.querySelector('#carousel-total');

  let index = 0;
  const total = imgs.length;

  if (totalEl) totalEl.textContent = total;

  function goTo(n) {
    index = (n + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
    if (currentEl) currentEl.textContent = index + 1;
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));

  // keyboard support
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') goTo(index - 1);
    if (e.key === 'ArrowRight') goTo(index + 1);
  });

  // swipe support
  let touchStartX = 0;
  carousel.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 40) diff > 0 ? goTo(index + 1) : goTo(index - 1);
  }, { passive: true });
}

initCarousel('barncart-carousel');