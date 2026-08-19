const fallback='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100"><rect width="100%" height="100%" fill="#ded8b7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Georgia" font-size="42" fill="#605a7b">Añadir fotografía</text></svg>`);

document.querySelectorAll('img').forEach(i=>i.addEventListener('error',()=>{i.src=fallback},{once:true}));

const homeHero=document.querySelector('#homeHero');
const photographer=document.querySelector('#photographer');
if(homeHero||photographer){
  fetch('./content/home.json')
    .then(r=>r.json())
    .then(data=>{
      if(homeHero&&data.hero){homeHero.src=data.hero;homeHero.alt=data.hero_alt||'Fotografía principal';}
      if(photographer&&data.photographer){photographer.src=data.photographer;photographer.alt=data.photographer_alt||'Fotógrafa';}
    })
    .catch(()=>{});
}

const rail=document.querySelector('#portfolioRail');
if(rail){fetch('./content/portfolio.json').then(r=>r.json()).then(data=>{let active=[],idx=0;const lb=document.querySelector('#lightbox'),img=document.querySelector('#lbImage'),title=document.querySelector('#lbTitle');const show=()=>{const p=active[idx];img.src=p?.image||fallback;title.textContent=p?.title||''};const open=(g)=>{active=g.photos||[];if(!active.length)active=[{image:g.cover,title:g.title}];idx=0;show();lb.classList.add('open');lb.setAttribute('aria-hidden','false')};data.groups.filter(g=>g.visible!==false).forEach(g=>{const card=document.createElement('article');card.className='group-card';card.innerHTML=`<img class="group-cover" src="${g.cover||fallback}" alt="${g.title}"><h3>${g.title}</h3>`;card.onclick=()=>open(g);rail.appendChild(card)});document.querySelector('.lb-close').onclick=()=>lb.classList.remove('open');document.querySelector('.lb-prev').onclick=()=>{idx=(idx-1+active.length)%active.length;show()};document.querySelector('.lb-next').onclick=()=>{idx=(idx+1)%active.length;show()};lb.addEventListener('click',e=>{if(e.target===lb)lb.classList.remove('open')});document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')lb.classList.remove('open');if(e.key==='ArrowLeft')document.querySelector('.lb-prev').click();if(e.key==='ArrowRight')document.querySelector('.lb-next').click()})}).catch(()=>rail.innerHTML='<p>El portfolio está listo para recibir tus fotografías desde el CMS.</p>')}
