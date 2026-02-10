(function () {
  const STORAGE_KEY = 'ecms_content_v1';
  const HISTORY_KEY = 'ecms_history_v1';

  const defaults = {
    auth: { username: 'admin', password: 'Admin@123' },
    global: {
      phone: '+971 2 628 9550',
      phone2: '+971 2 628 9554',
      email: 'energyconceptsae@gmail.com',
      address: 'P.O. Box 45837, Abu Dhabi, UAE',
      social: { facebook: '#', instagram: '#', twitter: '#' }
    },
    home: {
      heroTitle: 'Powering Industries with <br>Reliable Energy Solutions',
      heroSubtext: 'Engineering, installation, testing, and maintenance services for Power, Energy, Oil & Gas, and Industrial sectors across the UAE.',
      heroButtonText: 'Request A Quote',
      heroButtonLink: 'contacts.html',
      contactPanel: {
        phone: '+971 2 628 9550',
        email: 'energyconceptsae@gmail.com',
        address: 'P.O. Box 45837 Abu Dhabi, UAE'
      }
    },
    contactPage: {
      phone: '+971 2 628 9550',
      email: 'energyconceptsae@gmail.com',
      address: 'P.O. Box 45837 Abu Dhabi, UAE',
      mapEmbed: ''
    },
    certs: [
      { image: 'assets/images/certificate/certificate.jpg', name: 'Abu Dhabi Economic License', description: 'Recognized certification.', alt: 'Certificate' }
    ],
    gallery: [
      { url: 'assets/images/gallery-img/gallery-img1.webp', title: 'Gallery Image 1', alt: 'Gallery Image 1', category: 'General' },
      { url: 'assets/images/gallery-img/gallery-img2.webp', title: 'Gallery Image 2', alt: 'Gallery Image 2', category: 'General' }
    ]
  };

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  function getData() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        ...clone(defaults),
        ...saved,
        global: { ...defaults.global, ...(saved.global || {}), social: { ...defaults.global.social, ...((saved.global || {}).social || {}) } },
        home: {
          ...defaults.home,
          ...(saved.home || {}),
          contactPanel: { ...defaults.home.contactPanel, ...((saved.home || {}).contactPanel || {}) }
        },
        contactPage: { ...defaults.contactPage, ...(saved.contactPage || {}) }
      };
    } catch {
      return clone(defaults);
    }
  }

  function pushHistory(prev) {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.push({ ts: new Date().toISOString(), data: prev });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-30)));
  }

  function setData(next) {
    const prev = getData();
    pushHistory(prev);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function undo() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (!history.length) return false;
    const last = history.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(last.data));
    return true;
  }

  function interceptFetch() {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : String(input.url || '');
      const data = getData();
      const map = {
        'assets/data/services-data.json': data.homeServices,
        'assets/data/services.json': data.services,
        'assets/data/ongoing-project-data.json': data.projects,
        'assets/data/job-vacancies.json': data.jobs
      };
      const match = Object.keys(map).find(k => url.includes(k));
      if (match && Array.isArray(map[match])) {
        return new Response(JSON.stringify(map[match]), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return originalFetch(input, init);
    };
  }

  function applyPageContent() {
    const data = getData();
    const $ = (s) => document.querySelector(s);

    const heroTitle = $('.hero-mod__title');
    if (heroTitle) heroTitle.innerHTML = data.home.heroTitle;
    const heroDesc = $('.hero-mod__description');
    if (heroDesc) heroDesc.textContent = data.home.heroSubtext;
    const heroBtn = $('.hero-mod__cta-btn');
    if (heroBtn) { heroBtn.textContent = data.home.heroButtonText; heroBtn.href = data.home.heroButtonLink; }

    const pmAddress = document.querySelector('.pm-info-group address.pm-info-text');
    if (pmAddress) pmAddress.innerHTML = data.home.contactPanel.address.replace(/,\s*/g, '<br>');
    const pmContact = document.querySelector('.pm-info-group .pm-info-text');
    if (pmContact) pmContact.innerHTML = `<a href="tel:${data.home.contactPanel.phone.replace(/\s+/g, '')}">${data.home.contactPanel.phone}</a><br><a href="mailto:${data.home.contactPanel.email}">${data.home.contactPanel.email}</a>`;

    const cpPhone = document.querySelector('.cp-card:nth-child(1) .cp-card__link');
    if (cpPhone) { cpPhone.textContent = data.contactPage.phone; cpPhone.href = `tel:${data.contactPage.phone.replace(/\s+/g, '')}`; }
    const cpMail = document.querySelector('.cp-card:nth-child(2) .cp-card__link');
    if (cpMail) { cpMail.textContent = data.contactPage.email; cpMail.href = `mailto:${data.contactPage.email}`; }
    const cpAddr = document.querySelector('.cp-card:nth-child(3) .cp-card__text');
    if (cpAddr) cpAddr.innerHTML = data.contactPage.address.replace(/,\s*/g, '<br>');
    const map = document.querySelector('.cp-map-wrapper iframe');
    if (map && data.contactPage.mapEmbed) map.src = data.contactPage.mapEmbed;

    const certContainer = document.querySelector('.cert-thumbnail-wrapper');
    if (certContainer && Array.isArray(data.certs) && data.certs.length) {
      certContainer.innerHTML = data.certs.map((cert, i) => `<div class="cert-interactive-card cms-cert" data-cert-index="${i}"><img src="${cert.image}" alt="${cert.alt || cert.name}" class="cert-img-thumb" loading="lazy"><div class="cert-hover-overlay"><span class="cert-icon-zoom">🔍 ${cert.name}</span></div></div><p class="cert-caption-text">${cert.description || ''}</p>`).join('');
      const modal = document.querySelector('#cert-modal');
      const modalImg = modal ? modal.querySelector('.cert-img-full') : null;
      certContainer.querySelectorAll('.cms-cert').forEach((el) => el.addEventListener('click', () => {
        const cert = data.certs[Number(el.dataset.certIndex)];
        if (modal && modalImg) { modalImg.src = cert.image; modal.classList.add('active'); }
      }));
    }
  }

  function applyFooter(root) {
    const data = getData();
    const footer = root || document;
    const phone1 = footer.querySelector('.ec-footer__contact-list li:nth-child(1) a');
    const phone2 = footer.querySelector('.ec-footer__contact-list li:nth-child(2) a');
    const mail = footer.querySelector('.ec-footer__contact-list li:nth-child(3) a');
    const addr = footer.querySelector('.ec-footer__contact-list li:nth-child(4) span');
    const socials = footer.querySelectorAll('.ec-footer__social-link');
    if (phone1) { phone1.textContent = data.global.phone; phone1.href = `tel:${data.global.phone.replace(/\s+/g, '')}`; }
    if (phone2) { phone2.textContent = data.global.phone2; phone2.href = `tel:${data.global.phone2.replace(/\s+/g, '')}`; }
    if (mail) { mail.textContent = data.global.email; mail.href = `mailto:${data.global.email}`; }
    if (addr) addr.innerHTML = data.global.address.replace(/,\s*/g, '<br>');
    if (socials[0]) socials[0].href = data.global.social.facebook;
    if (socials[1]) socials[1].href = data.global.social.instagram;
    if (socials[2]) socials[2].href = data.global.social.twitter;
  }

  window.CMS = { STORAGE_KEY, HISTORY_KEY, defaults, getData, setData, undo, applyPageContent, applyFooter, interceptFetch };
  interceptFetch();
  document.addEventListener('DOMContentLoaded', applyPageContent);
})();
