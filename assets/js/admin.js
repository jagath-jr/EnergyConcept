(function () {
  const USER = 'admin';
  const PASS = 'admin123';

  const loginCard = document.getElementById('loginCard');
  const app = document.getElementById('app');
  const navTabs = document.getElementById('navTabs');
  const editor = document.getElementById('editor');
  const tabTitle = document.getElementById('tabTitle');
  const oldView = document.getElementById('oldView');

  let tab = 'global';
  let data = ECCMS.getCmsData();
  let undoStack = [];
  oldView.textContent = JSON.stringify(data, null, 2);

  const TABS = {
    global: 'Common Details',
    home: 'Home Page',
    about: 'About / Certifications',
    services: 'Services',
    gallery: 'Gallery',
    projects: 'Projects',
    careers: 'Careers',
    contact: 'Contact Page'
  };

  const byId = (id) => document.getElementById(id);
  const clone = (obj) => JSON.parse(JSON.stringify(obj));

  byId('loginBtn').addEventListener('click', () => {
    if (byId('user').value === USER && byId('pass').value === PASS) {
      loginCard.classList.add('hidden');
      app.classList.remove('hidden');
      navTabs.classList.remove('hidden');
      render();
      return;
    }
    alert('Invalid credentials');
  });

  navTabs.querySelectorAll('button[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      tab = btn.dataset.tab;
      render();
    });
  });

  byId('saveBtn').addEventListener('click', () => {
    localStorage.setItem(ECCMS.CMS_KEY, JSON.stringify(data));
    oldView.textContent = JSON.stringify(data, null, 2);
    alert('Changes saved successfully.');
  });

  byId('undoBtn').addEventListener('click', () => {
    if (!undoStack.length) {
      alert('Nothing to undo');
      return;
    }
    data = undoStack.pop();
    render();
  });

  function remember() { undoStack.push(clone(data)); }

  function render() {
    tabTitle.textContent = TABS[tab] || 'Editor';
    navTabs.querySelectorAll('button[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));

    if (tab === 'global') {
      editor.innerHTML = `
        <h3>Common Contact Details (used site-wide)</h3>
        <p class="help">Update phone, email, address and footer social links here once. These values are shared across pages.</p>
        <div class="grid-2">
          <div><label>Phone Number</label><input id="g_phone" value="${escapeHtml(data.global.phone)}"></div>
          <div><label>Email Address</label><input id="g_email" value="${escapeHtml(data.global.email)}"></div>
        </div>
        <label>Physical Address</label>
        <textarea id="g_address">${escapeHtml(data.global.address)}</textarea>
        <div class="grid-2">
          <div><label>Facebook URL</label><input id="g_fb" value="${escapeHtml(data.global.social.facebook)}"></div>
          <div><label>Instagram URL</label><input id="g_ig" value="${escapeHtml(data.global.social.instagram)}"></div>
        </div>
        <label>Twitter/X URL</label><input id="g_tw" value="${escapeHtml(data.global.social.twitter)}">
        <button id="apply_global" class="success">Apply Common Details</button>
      `;
      byId('apply_global').onclick = () => {
        remember();
        data.global.phone = byId('g_phone').value.trim();
        data.global.email = byId('g_email').value.trim();
        data.global.address = byId('g_address').value.trim();
        data.global.social.facebook = byId('g_fb').value.trim();
        data.global.social.instagram = byId('g_ig').value.trim();
        data.global.social.twitter = byId('g_tw').value.trim();
        alert('Common details updated in editor. Click Save Changes.');
      };
      return;
    }

    if (tab === 'home') {
      editor.innerHTML = `
        <h3>Hero Section</h3>
        <div class="grid-2">
          <div><label>Headline</label><input id="h_title" value="${escapeHtml(data.home.hero.title)}"></div>
          <div><label>Button Text</label><input id="h_btn" value="${escapeHtml(data.home.hero.ctaText)}"></div>
        </div>
        <label>Subtext</label><textarea id="h_sub">${escapeHtml(data.home.hero.subtitle)}</textarea>
        <label>Button Link</label><input id="h_link" value="${escapeHtml(data.home.hero.ctaLink)}">
        <button id="apply_home" class="success">Apply Home Hero</button>
        <hr>
        <h3>Featured Services</h3>
        <p class="help">Add, remove and reorder featured services.</p>
        <div id="home_services"></div>
        <button id="add_home_service">+ Add Service</button>
      `;

      byId('apply_home').onclick = () => {
        remember();
        data.home.hero.title = byId('h_title').value.trim();
        data.home.hero.subtitle = byId('h_sub').value.trim();
        data.home.hero.ctaText = byId('h_btn').value.trim();
        data.home.hero.ctaLink = byId('h_link').value.trim();
        alert('Home hero updated in editor. Click Save Changes.');
      };

      renderListEditor('home_services', data.home.featuredServices, [
        { key: 'title', label: 'Service Title' },
        { key: 'description', label: 'Short Description' },
        { key: 'icon', label: 'Icon (emoji or text)' }
      ]);
      byId('add_home_service').onclick = () => {
        remember();
        data.home.featuredServices.push({ title: 'New Service', description: '', icon: '⚡' });
        render();
      };
      return;
    }

    if (tab === 'about') {
      editor.innerHTML = `<h3>Certifications</h3><p class='help'>Manage certification image, name and description.</p><div id='about_certs'></div><button id='add_cert'>+ Add Certification</button>`;
      renderListEditor('about_certs', data.about.certifications, [
        { key: 'name', label: 'Certification Name' },
        { key: 'description', label: 'Description' },
        { key: 'image', label: 'Image URL' }
      ]);
      byId('add_cert').onclick = () => { remember(); data.about.certifications.push({ name: 'New Certificate', description: '', image: '' }); render(); };
      return;
    }

    if (tab === 'gallery') {
      editor.innerHTML = `<h3>Gallery Images</h3><p class='help'>Manage images, title, alt text and category.</p><div id='gallery_items'></div><button id='add_gallery'>+ Add Image</button>`;
      renderListEditor('gallery_items', data.gallery.images, [
        { key: 'url', label: 'Image URL' },
        { key: 'title', label: 'Title' },
        { key: 'alt', label: 'Alt Text' },
        { key: 'category', label: 'Category / Album' }
      ]);
      byId('add_gallery').onclick = () => { remember(); data.gallery.images.push({ url: '', title: '', alt: '', category: '' }); render(); };
      return;
    }

    if (tab === 'projects') {
      editor.innerHTML = `<h3>Projects</h3><p class='help'>Manage project title, category, client, description, image, date and live URL.</p><div id='projects_items'></div><button id='add_project'>+ Add Project</button>`;
      renderListEditor('projects_items', data.projects.items, [
        { key: 'title', label: 'Project Title' },
        { key: 'category', label: 'Category' },
        { key: 'client', label: 'Client Name' },
        { key: 'description', label: 'Description' },
        { key: 'imageLarge', label: 'Featured Image URL' },
        { key: 'projectDate', label: 'Project Date' },
        { key: 'liveUrl', label: 'Live URL (Optional)' }
      ]);
      byId('add_project').onclick = () => { remember(); data.projects.items.push({ title: 'New Project', category: '', client: '', description: '', imageLarge: '', projectDate: '', liveUrl: '' }); render(); };
      return;
    }

    if (tab === 'careers') {
      editor.innerHTML = `<h3>Job Listings</h3><p class='help'>Manage title, department, location, type, deadline and apply link/email.</p><div id='careers_items'></div><button id='add_job'>+ Add Job</button>`;
      renderListEditor('careers_items', data.careers.jobs, [
        { key: 'title', label: 'Job Title' },
        { key: 'department', label: 'Department' },
        { key: 'location', label: 'Location' },
        { key: 'type', label: 'Job Type (Full-time/Contract)' },
        { key: 'applicationDeadline', label: 'Application Deadline' },
        { key: 'applyLink', label: 'Apply Link / Email' }
      ]);
      byId('add_job').onclick = () => { remember(); data.careers.jobs.push({ title: 'New Role', department: '', location: '', type: 'Full-time', applicationDeadline: '', applyLink: '' }); render(); };
      return;
    }

    if (tab === 'services') {
      editor.innerHTML = `<h3>Services</h3><p class='help'>Manage service categories and details in JSON for advanced structures.</p><label>Categories JSON</label><textarea id='services_json' style='min-height:280px'>${escapeHtml(JSON.stringify(data.services.categories, null, 2))}</textarea><button id='apply_services' class='success'>Apply Services JSON</button>`;
      byId('apply_services').onclick = () => {
        try {
          remember();
          data.services.categories = JSON.parse(byId('services_json').value || '[]');
          alert('Services data updated. Click Save Changes.');
        } catch (e) {
          alert('Invalid JSON: ' + e.message);
        }
      };
      return;
    }

    if (tab === 'contact') {
      editor.innerHTML = `
        <h3>Contact Page</h3>
        <p class='help'>You can keep this same as Common Details or set page-specific values.</p>
        <div class='grid-2'>
          <div><label>Phone Number</label><input id='ct_phone' value='${escapeHtml(data.contact.phone)}'></div>
          <div><label>Email Address</label><input id='ct_email' value='${escapeHtml(data.contact.email)}'></div>
        </div>
        <label>Address</label><textarea id='ct_address'>${escapeHtml(data.contact.address)}</textarea>
        <label>Map Embed URL</label><textarea id='ct_map'>${escapeHtml(data.contact.mapEmbed || '')}</textarea>
        <button id='sync_common' class='secondary'>Use Common Details</button>
        <button id='apply_contact' class='success'>Apply Contact Page</button>
      `;
      byId('sync_common').onclick = () => {
        byId('ct_phone').value = data.global.phone;
        byId('ct_email').value = data.global.email;
        byId('ct_address').value = data.global.address;
      };
      byId('apply_contact').onclick = () => {
        remember();
        data.contact.phone = byId('ct_phone').value.trim();
        data.contact.email = byId('ct_email').value.trim();
        data.contact.address = byId('ct_address').value.trim();
        data.contact.mapEmbed = byId('ct_map').value.trim();
        alert('Contact page data updated. Click Save Changes.');
      };
    }
  }

  function renderListEditor(containerId, list, fields) {
    const host = byId(containerId);
    if (!host) return;
    host.className = 'item-list';
    host.innerHTML = '';

    list.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'item';
      card.innerHTML = `
        <div class='item-head'>
          <strong>Item ${idx + 1}</strong>
          <div class='item-actions'>
            <button data-action='up'>↑</button>
            <button data-action='down'>↓</button>
            <button data-action='delete' class='danger'>Delete</button>
          </div>
        </div>
        ${fields.map(f => `<label>${f.label}</label><input data-key='${f.key}' value='${escapeHtml(item[f.key] || '')}'>`).join('')}
      `;

      card.querySelectorAll('input[data-key]').forEach((inp) => {
        inp.addEventListener('input', () => {
          item[inp.dataset.key] = inp.value;
        });
      });

      card.querySelector('[data-action="up"]').onclick = () => {
        if (idx === 0) return;
        remember();
        [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
        render();
      };
      card.querySelector('[data-action="down"]').onclick = () => {
        if (idx === list.length - 1) return;
        remember();
        [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]];
        render();
      };
      card.querySelector('[data-action="delete"]').onclick = () => {
        remember();
        list.splice(idx, 1);
        render();
      };

      host.appendChild(card);
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
})();
