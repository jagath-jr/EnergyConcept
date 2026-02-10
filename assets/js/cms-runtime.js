(function () {
  const CMS_KEY = 'ec_cms_content_v1';
  const defaults = {
    global: {
      phone: '+971 2 628 9550',
      email: 'energyconceptsae@gmail.com',
      address: 'P.O. Box 45837 Abu Dhabi, UAE',
      social: { facebook: '#', instagram: '#', twitter: '#' }
    },
    home: {
      hero: { title: 'Powering Industries with Reliable Energy Solutions', subtitle: 'Engineering, installation, testing, and maintenance services for Power, Energy, Oil & Gas, and Industrial sectors across the UAE.', ctaText: 'Request A Quote', ctaLink: 'contacts.html' },
      featuredServices: [],
      contactPanel: { phone: '+971 2 628 9550', email: 'energyconceptsae@gmail.com', address: 'P.O. Box 45837 Abu Dhabi, UAE' }
    },
    about: { certifications: [] },
    services: { categories: [] },
    gallery: { images: [] },
    projects: { items: [] },
    careers: { jobs: [] },
    contact: { phone: '+971 2 628 9550', email: 'energyconceptsae@gmail.com', address: 'P.O. Box 45837 Abu Dhabi, UAE', mapEmbed: '' }
  };

  function deepMerge(base, override) {
    if (Array.isArray(base)) return Array.isArray(override) ? override : base;
    if (typeof base !== 'object' || !base) return override ?? base;
    const out = { ...base };
    Object.keys(override || {}).forEach((k) => { out[k] = deepMerge(base[k], override[k]); });
    return out;
  }
  function getCmsData() {
    try {
      const raw = localStorage.getItem(CMS_KEY);
      if (!raw) return defaults;
      return deepMerge(defaults, JSON.parse(raw));
    } catch (e) { return defaults; }
  }
  function setText(selector, value) { const el = document.querySelector(selector); if (el && value) el.textContent = value; }
  function setAttr(selector, attr, value) { const el = document.querySelector(selector); if (el && value) el.setAttribute(attr, value); }

  function applyGlobal(data) {
    document.querySelectorAll('a[href^="tel:"]').forEach(a => { a.href = `tel:${data.global.phone.replace(/\s+/g, '')}`; a.textContent = data.global.phone; });
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => { a.href = `mailto:${data.global.email}`; a.textContent = data.global.email; });
    document.querySelectorAll('.pm-info-group address, .cp-card__text, .ec-footer__contact-list span').forEach(a => { a.innerHTML = data.global.address.replace(',', ',<br>'); });
    const socialLinks = document.querySelectorAll('.ec-footer__social-link');
    if (socialLinks[0]) socialLinks[0].href = data.global.social.facebook;
    if (socialLinks[1]) socialLinks[1].href = data.global.social.instagram;
    if (socialLinks[2]) socialLinks[2].href = data.global.social.twitter;
  }

  function applyHome(data) {
    setText('.hero-mod__title', data.home.hero.title);
    setText('.hero-mod__description', data.home.hero.subtitle);
    setText('.hero-mod__cta-btn', data.home.hero.ctaText);
    setAttr('.hero-mod__cta-btn', 'href', data.home.hero.ctaLink);

    const grid = document.getElementById('services-grid');
    if (grid && data.home.featuredServices.length) {
      const intro = grid.querySelector('.serv-mod__intro-block');
      grid.innerHTML = intro ? intro.outerHTML : '';
      data.home.featuredServices.forEach((s) => {
        const card = document.createElement('article');
        card.className = 'serv-mod__card gs-serv-card';
        card.innerHTML = `<div class="serv-mod__icon">${s.icon || '⚡'}</div><h3 class="serv-mod__title">${s.title}</h3><p class="serv-mod__desc">${s.description}</p>`;
        grid.appendChild(card);
      });
    }
  }

  function applyAbout(data) {
    const wrap = document.querySelector('.cert-container');
    if (wrap && data.about.certifications.length) {
      wrap.innerHTML = `<header class="cert-header"><h1 class="cert-title">Our Certifications</h1></header><div class="cms-cert-grid">${data.about.certifications.map(c => `<article class="cert-thumbnail-wrapper"><div class="cert-interactive-card"><img src="${c.image}" alt="${c.name}" class="cert-img-thumb"><div class="cert-hover-overlay"><span>${c.name}</span></div></div><p>${c.description || ''}</p></article>`).join('')}</div>`;
    }
  }

  window.ECCMS = { CMS_KEY, defaults, getCmsData };
  document.addEventListener('DOMContentLoaded', () => {
    const data = getCmsData();
    applyGlobal(data);
    applyHome(data);
    applyAbout(data);

    if (window.location.pathname.endsWith('contacts.html')) {
      if (data.contact.mapEmbed) setAttr('.cp-map-wrapper iframe', 'src', data.contact.mapEmbed);
    }
  });
})();
