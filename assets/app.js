const fallback='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100"><rect width="100%" height="100%" fill="#ded8b7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Georgia" font-size="42" fill="#605a7b">Añadir fotografía</text></svg>`);

const siteRoot=new URL('./',document.baseURI);
const mediaPath=(path)=>{if(!path)return fallback;const value=String(path).trim();if(/^data:|^https?:\/\//i.test(value))return value;const uploadMatch=value.match(/(?:^|\/)uploads\/(.+)$/i);if(uploadMatch)return new URL(`uploads/${uploadMatch[1]}`,siteRoot).href;return new URL(value.replace(/^\.\//,''),document.baseURI).href;};
const safeImage=(img)=>{if(!img)return;img.addEventListener('error',()=>{img.src=fallback},{once:true});};
document.querySelectorAll('img').forEach(safeImage);
const getPath=(obj,path)=>path.split('.').reduce((acc,key)=>acc?.[key],obj);
const esc=(value)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fontStacks={'Georgia':"Georgia, 'Times New Roman', serif",'Cormorant Garamond':"'Cormorant Garamond', Georgia, serif",'Playfair Display':"'Playfair Display', Georgia, serif",'Libre Baskerville':"'Libre Baskerville', Georgia, serif",'Arial':"Arial, Helvetica, sans-serif",'Inter':"Inter, Arial, sans-serif",'Montserrat':"Montserrat, Arial, sans-serif",'Lato':"Lato, Arial, sans-serif"};

const instagramSvg=`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>`;
const mailSvg=`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`;
const renderFooter=(site)=>{
  const footer=document.querySelector('footer');if(!footer)return;
  const f=site.footer||{};
  const instagram=String(f.instagram_url||'').trim();
  const email=String(f.email_address||'').trim();
  const instagramLink=instagram?`<a class="footer-social" href="${esc(instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${instagramSvg}</a>`:`<span class="footer-social is-disabled" aria-label="Instagram sin configurar">${instagramSvg}</span>`;
  const emailLink=email?`<a class="footer-social" href="mailto:${esc(email)}" aria-label="Correo electrónico">${mailSvg}</a>`:`<span class="footer-social is-disabled" aria-label="Correo sin configurar">${mailSvg}</span>`;
  const contactHref=email?`mailto:${esc(email)}`:'./contacto.html';
  footer.innerHTML=`<div class="footer-grid">
    <div class="footer-quote"><span class="quote-mark">“</span><p>${esc(f.quote||'La luz no solo revela, también guarda memoria.')}</p></div>
    <div class="footer-project"><p class="footer-kicker">${esc(f.project_title||'¿TIENES UN PROYECTO?')}</p><p>${esc(f.project_text||'Hablemos sobre tu idea y cómo puedo ayudarte a contarla en imágenes.')}</p></div>
    <div class="footer-action"><a class="footer-button" href="${contactHref}"><span>${esc(f.button_text||'ESCRÍBEME')}</span><span aria-hidden="true">→</span></a></div>
    <div class="footer-contact"><div class="footer-socials">${instagramLink}<span class="footer-separator"></span>${emailLink}</div><p class="footer-copyright">${esc(f.copyright||'© Michelle Cepeda. Todos los derechos reservados.')}</p></div>
  </div>`;
};

fetch(new URL('content/site.json',siteRoot),{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}).then(site=>{
  if(site.fonts?.heading)document.documentElement.style.setProperty('--font-heading',fontStacks[site.fonts.heading]||fontStacks.Georgia);
  if(site.fonts?.body)document.documentElement.style.setProperty('--font-body',fontStacks[site.fonts.body]||fontStacks.Arial);
  document.querySelectorAll('[data-content]').forEach(el=>{const value=getPath(site,el.dataset.content);if(value===undefined||value===null)return;if(el.dataset.multiline==='true')el.innerHTML=String(value).split('\n').map(v=>v.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))).join('<br>');else el.textContent=value;});
  document.querySelectorAll('[data-placeholder]').forEach(el=>{const value=getPath(site,el.dataset.placeholder);if(value!==undefined&&value!==null)el.placeholder=value;});
  renderFooter(site);
}).catch(()=>{});

const homeHero=document.querySelector('#homeHero');const photographer=document.querySelector('#photographer');
if(homeHero||photographer){fetch(new URL('content/home.json',siteRoot),{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}).then(data=>{if(homeHero&&data.hero){homeHero.src=mediaPath(data.hero);homeHero.alt=data.hero_alt||'Fotografía principal';}if(photographer&&data.photographer){photographer.src=mediaPath(data.photographer);photographer.alt=data.photographer_alt||'Fotógrafa';}}).catch(()=>{});}

const coverPosition=(title)=>{const t=String(title||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');if(t.includes('eventos en vivo'))return'left center';if(t.includes('historias'))return'center center';if(t.includes('viajes'))return'center center';if(t.includes('retratos'))return'center top';return'center center';};
const rail=document.querySelector('#portfolioRail');
if(rail){fetch(new URL('content/portfolio.json',siteRoot),{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}).then(data=>{let active=[],idx=0;const lb=document.querySelector('#lightbox'),img=document.querySelector('#lbImage'),title=document.querySelector('#lbTitle');const show=()=>{const p=active[idx];img.src=mediaPath(p?.image);title.textContent=p?.title||'';};const open=(g)=>{active=g.photos||[];if(!active.length)active=[{image:g.cover,title:g.title}];idx=0;show();lb.classList.add('open');lb.setAttribute('aria-hidden','false');};(data.groups||[]).filter(g=>g.visible!==false).forEach(g=>{const card=document.createElement('article');card.className='group-card';const frame=document.createElement('div');frame.className='group-frame';const cover=document.createElement('img');cover.className='group-cover';cover.src=mediaPath(g.cover);cover.alt=g.title||'';cover.style.objectPosition=coverPosition(g.title);safeImage(cover);frame.appendChild(cover);const heading=document.createElement('h3');heading.textContent=g.title||'';card.append(frame,heading);card.onclick=()=>open(g);rail.appendChild(card);});safeImage(img);document.querySelector('.lb-close').onclick=()=>lb.classList.remove('open');document.querySelector('.lb-prev').onclick=()=>{idx=(idx-1+active.length)%active.length;show()};document.querySelector('.lb-next').onclick=()=>{idx=(idx+1)%active.length;show()};lb.addEventListener('click',e=>{if(e.target===lb)lb.classList.remove('open')});document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')lb.classList.remove('open');if(e.key==='ArrowLeft')document.querySelector('.lb-prev').click();if(e.key==='ArrowRight')document.querySelector('.lb-next').click();});}).catch(()=>rail.innerHTML='<p>El portafolio está listo para recibir tus fotografías desde el CMS.</p>');}
