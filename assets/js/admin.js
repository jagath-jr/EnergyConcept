(function(){
const USER='admin', PASS='admin123';
const loginCard=document.getElementById('loginCard'), app=document.getElementById('app');
const editor=document.getElementById('editor'), tabTitle=document.getElementById('tabTitle'), oldView=document.getElementById('oldView');
let data=ECCMS.getCmsData(), tab='global', undoStack=[];
const oldSnapshot=JSON.stringify(data,null,2); oldView.textContent=oldSnapshot;

document.getElementById('loginBtn').onclick=()=>{if(user.value===USER&&pass.value===PASS){loginCard.classList.add('hidden');app.classList.remove('hidden');render();}else alert('Invalid credentials');};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render();});
document.getElementById('saveBtn').onclick=()=>{collect();localStorage.setItem(ECCMS.CMS_KEY,JSON.stringify(data));alert('Saved. Refresh website pages to see changes.');};
document.getElementById('undoBtn').onclick=()=>{if(!undoStack.length)return alert('Nothing to undo');data=undoStack.pop();render();};

function remember(){undoStack.push(JSON.parse(JSON.stringify(data)));}
function render(){tabTitle.textContent=tab[0].toUpperCase()+tab.slice(1)+' Editor';
if(tab==='global') editor.innerHTML=`<label>Phone</label><input id='g_phone' value='${data.global.phone}'><label>Email</label><input id='g_email' value='${data.global.email}'><label>Address</label><textarea id='g_address'>${data.global.address}</textarea><label>Facebook</label><input id='g_fb' value='${data.global.social.facebook}'><label>Instagram</label><input id='g_ig' value='${data.global.social.instagram}'><label>Twitter/X</label><input id='g_tw' value='${data.global.social.twitter}'>`;
if(tab==='home') editor.innerHTML=`<label>Hero headline</label><input id='h_title' value='${data.home.hero.title}'><label>Hero subtext</label><textarea id='h_sub'>${data.home.hero.subtitle}</textarea><label>Button text</label><input id='h_btn' value='${data.home.hero.ctaText}'><label>Button link</label><input id='h_link' value='${data.home.hero.ctaLink}'><label>Featured services JSON</label><textarea id='h_services' rows='7'>${JSON.stringify(data.home.featuredServices,null,2)}</textarea>`;
if(tab==='about') editor.innerHTML=`<label>Certifications JSON (image,name,description)</label><textarea id='a_certs' rows='12'>${JSON.stringify(data.about.certifications,null,2)}</textarea>`;
if(tab==='services') editor.innerHTML=`<label>Service categories JSON</label><textarea id='s_cat' rows='14'>${JSON.stringify(data.services.categories,null,2)}</textarea>`;
if(tab==='gallery') editor.innerHTML=`<label>Gallery images JSON (url,title,alt,category)</label><textarea id='ga' rows='14'>${JSON.stringify(data.gallery.images,null,2)}</textarea>`;
if(tab==='projects') editor.innerHTML=`<label>Projects JSON</label><textarea id='p' rows='14'>${JSON.stringify(data.projects.items,null,2)}</textarea>`;
if(tab==='careers') editor.innerHTML=`<label>Jobs JSON</label><textarea id='c' rows='14'>${JSON.stringify(data.careers.jobs,null,2)}</textarea>`;
if(tab==='contact') editor.innerHTML=`<label>Phone</label><input id='ct_phone' value='${data.contact.phone}'><label>Email</label><input id='ct_email' value='${data.contact.email}'><label>Address</label><textarea id='ct_address'>${data.contact.address}</textarea><label>Map embed URL</label><textarea id='ct_map'>${data.contact.mapEmbed}</textarea>`;
}
function collect(){remember();
try {
if(tab==='global'){data.global.phone=g_phone.value;data.global.email=g_email.value;data.global.address=g_address.value;data.global.social={facebook:g_fb.value,instagram:g_ig.value,twitter:g_tw.value};}
if(tab==='home'){data.home.hero={title:h_title.value,subtitle:h_sub.value,ctaText:h_btn.value,ctaLink:h_link.value};data.home.featuredServices=JSON.parse(h_services.value||'[]');}
if(tab==='about') data.about.certifications=JSON.parse(a_certs.value||'[]');
if(tab==='services') data.services.categories=JSON.parse(s_cat.value||'[]');
if(tab==='gallery') data.gallery.images=JSON.parse(ga.value||'[]');
if(tab==='projects') data.projects.items=JSON.parse(p.value||'[]');
if(tab==='careers') data.careers.jobs=JSON.parse(c.value||'[]');
if(tab==='contact'){data.contact.phone=ct_phone.value;data.contact.email=ct_email.value;data.contact.address=ct_address.value;data.contact.mapEmbed=ct_map.value;}
} catch(e){alert('Invalid JSON: '+e.message); throw e;}
}
})();
