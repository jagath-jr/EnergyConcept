(function(){
  const state = { tab:'global', data: CMS.getData() };
  const loginView = document.getElementById('loginView');
  const panelView = document.getElementById('panelView');
  const editor = document.getElementById('editor');
  const oldState = document.getElementById('oldState');

  function esc(v){return String(v ?? '').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));}
  function textInput(key,label,val=''){return `<label>${label}<input data-key="${key}" value="${esc(val)}"></label>`;}
  function areaInput(key,label,val=''){return `<label>${label}<textarea data-key="${key}">${esc(val)}</textarea></label>`;}

  function render(){
    state.data = CMS.getData();
    oldState.textContent = 'Previous saved snapshot (current section):\n' + JSON.stringify(state.data[state.tab] || {}, null, 2);
    if(state.tab==='global'){
      editor.innerHTML = [
        textInput('global.phone','Phone',state.data.global.phone),
        textInput('global.phone2','Secondary Phone',state.data.global.phone2),
        textInput('global.email','Email',state.data.global.email),
        areaInput('global.address','Address',state.data.global.address),
        textInput('global.social.facebook','Facebook',state.data.global.social.facebook),
        textInput('global.social.instagram','Instagram',state.data.global.social.instagram),
        textInput('global.social.twitter','Twitter/X',state.data.global.social.twitter)
      ].join('');
    }
    if(state.tab==='home'){
      editor.innerHTML = [
        areaInput('home.heroTitle','Hero Headline (HTML allowed)',state.data.home.heroTitle),
        areaInput('home.heroSubtext','Hero Subtext',state.data.home.heroSubtext),
        textInput('home.heroButtonText','Hero Button Text',state.data.home.heroButtonText),
        textInput('home.heroButtonLink','Hero Button Link',state.data.home.heroButtonLink),
        textInput('home.contactPanel.phone','Home Contact Phone',state.data.home.contactPanel.phone),
        textInput('home.contactPanel.email','Home Contact Email',state.data.home.contactPanel.email),
        areaInput('home.contactPanel.address','Home Contact Address',state.data.home.contactPanel.address),
        areaInput('homeServices','Our Services (JSON array: title,homePageDescription,icon,link)',JSON.stringify(state.data.homeServices||[],null,2))
      ].join('');
    }
    if(state.tab==='services') editor.innerHTML = areaInput('services','Service Categories + Sub-Services (JSON from services.json)',JSON.stringify(state.data.services||[],null,2));
    if(state.tab==='about') editor.innerHTML = areaInput('certs','Certifications (JSON array: image,name,description,alt)',JSON.stringify(state.data.certs||[],null,2));
    if(state.tab==='gallery') editor.innerHTML = areaInput('gallery','Gallery (JSON array: url,title,alt,category)',JSON.stringify(state.data.gallery||[],null,2));
    if(state.tab==='projects') editor.innerHTML = areaInput('projects','Projects (JSON array)',JSON.stringify(state.data.projects||[],null,2));
    if(state.tab==='careers') editor.innerHTML = areaInput('jobs','Jobs (JSON array)',JSON.stringify(state.data.jobs||[],null,2));
    if(state.tab==='contact') editor.innerHTML = [
      textInput('contactPage.phone','Phone',state.data.contactPage.phone),
      textInput('contactPage.email','Email',state.data.contactPage.email),
      areaInput('contactPage.address','Address',state.data.contactPage.address),
      areaInput('contactPage.mapEmbed','Map Embed URL',state.data.contactPage.mapEmbed)
    ].join('');
  }

  function setByPath(obj, path, value){ const parts=path.split('.'); let cur=obj; parts.slice(0,-1).forEach(p=>cur=cur[p]??(cur[p]={})); cur[parts.at(-1)] = value; }

  document.getElementById('loginBtn').onclick = () => {
    const data = CMS.getData();
    if(document.getElementById('username').value===data.auth.username && document.getElementById('password').value===data.auth.password){
      loginView.classList.add('hidden'); panelView.classList.remove('hidden'); render();
    } else document.getElementById('loginError').textContent = 'Invalid credentials';
  };
  document.querySelectorAll('.nav').forEach(btn=>btn.onclick=()=>{state.tab=btn.dataset.tab; render();});
  document.getElementById('logoutBtn').onclick = () => location.reload();
  document.getElementById('undoBtn').onclick = () => { CMS.undo(); render(); document.getElementById('saveMsg').textContent='Undo completed'; };
  document.getElementById('saveBtn').onclick = () => {
    const next = CMS.getData();
    editor.querySelectorAll('[data-key]').forEach(el=>{
      const key=el.dataset.key; let val=el.value;
      if(['homeServices','services','certs','gallery','projects','jobs'].includes(key)){ try{ val=JSON.parse(val||'[]'); }catch{ return; } }
      setByPath(next,key,val);
    });
    CMS.setData(next);
    document.getElementById('saveMsg').textContent='Saved. Changes are now live on website pages.';
    render();
  };
})();
