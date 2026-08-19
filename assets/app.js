const fallback='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100"><rect width="100%" height="100%" fill="#ded8b7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Georgia" font-size="42" fill="#605a7b">Añadir fotografía</text></svg>`);

const mediaPath=(path)=>{
  if(!path) return fallback;
  const value=String(path).trim();
  if(/^data:|^https?:\/\//i.test(value)) return value;

  // Sveltia puede guardar /portafolio/uploads/x.jpg, /uploads/x.jpg o ./uploads/x.jpg.
  // Extraemos siempre la parte uploads/... y la resolvemos contra la raíz real
  // de este GitHub Pages, evitando rutas relativas a /assets/ u otras páginas.
  const uploadMatch=value.match(/(?:^|\/)uploads\/(.+)$/i);
  if(uploadMatch){
    const siteRoot=new URL('./',document.baseURI);
    return new URL(`uploads/${uploadMatch[1]}`,siteRoot).href;
  }

  return new URL(value.replace(/^\.\//,''),document.baseURI).href;
};

const safeImage=(img)=>{
  if(!img) return;
  img.addEventListener('error',()=>{img.src=fallback},{once:true});
};

document.querySelectorAll('img').forEach(safeImage);

const homeHero=document.querySelector('#homeHero');
const photographer=document.querySelector('#photographer');
if(homeHero||photographer){
  fetch(new URL('content/home.json',new URL('./',document.baseURI)),{cache:'no-store'})
    .then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()})
    .then(data=>{
      if(homeHero&&data.hero){homeHero.src=mediaPath(data.hero);homeHero.alt=data.hero_alt||'Fotografía principal';}
      if(photographer&&data.photographer){photographer.src=mediaPath(data.photographer);photographer.alt=data.photographer_alt||'Fotógrafa';}
    })
    .catch(()=>{});
}

const rail=document.querySelector('#portfolioRail');
if(rail){
  fetch(new URL('content/portfolio.json',new URL('./',document.baseURI)),{cache:'no-store'})
    .then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()})
    .then(data=>{
      let active=[],idx=0;
      const lb=document.querySelector('#lightbox'),img=document.querySelector('#lbImage'),title=document.querySelector('#lbTitle');
      const show=()=>{
        const p=active[idx];
        img.src=mediaPath(p?.image);
        title.textContent=p?.title||'';
      };
      const open=(g)=>{
        active=g.photos||[];
        if(!active.length)active=[{image:g.cover,title:g.title}];
        idx=0;show();lb.classList.add('open');lb.setAttribute('aria-hidden','false');
      };
      (data.groups||[]).filter(g=>g.visible!==false).forEach(g=>{
        const card=document.createElement('article');
        card.className='group-card';
        const cover=document.createElement('img');
        cover.className='group-cover';
        cover.src=mediaPath(g.cover);
        cover.alt=g.title||'';
        safeImage(cover);
        const heading=document.createElement('h3');
        heading.textContent=g.title||'';
        card.append(cover,heading);
        card.onclick=()=>open(g);
        rail.appendChild(card);
      });
      safeImage(img);
      document.querySelector('.lb-close').onclick=()=>lb.classList.remove('open');
      document.querySelector('.lb-prev').onclick=()=>{idx=(idx-1+active.length)%active.length;show()};
      document.querySelector('.lb-next').onclick=()=>{idx=(idx+1)%active.length;show()};
      lb.addEventListener('click',e=>{if(e.target===lb)lb.classList.remove('open')});
      document.addEventListener('keydown',e=>{
        if(!lb.classList.contains('open'))return;
        if(e.key==='Escape')lb.classList.remove('open');
        if(e.key==='ArrowLeft')document.querySelector('.lb-prev').click();
        if(e.key==='ArrowRight')document.querySelector('.lb-next').click();
      });
    })
    .catch(()=>rail.innerHTML='<p>El portfolio está listo para recibir tus fotografías desde el CMS.</p>');
}
