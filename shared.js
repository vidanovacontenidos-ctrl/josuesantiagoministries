/* ══════════════════════════════════════════
   SHARED.JS — Kingdom in Action
   Paleta Roja + Gold + Cream
   ══════════════════════════════════════════ */

/* ── LANGUAGE ── */
function setLang(l){
  document.documentElement.setAttribute('data-lang',l);
  document.querySelectorAll('.lang-btn').forEach(function(b){
    b.classList.toggle('active',b.textContent.trim().toLowerCase()===l);
  });
  try{localStorage.setItem('lang',l);}catch(e){}
}
(function(){try{setLang(localStorage.getItem('lang')||'es');}catch(e){setLang('es');}})();

/* ── NAV ── */
function toggleNav(){document.getElementById('navOv').classList.toggle('open');}
window.addEventListener('scroll',function(){
  var n=document.getElementById('nav');
  if(n)n.classList.toggle('scrolled',scrollY>50);
});

/* ── DONATE MODAL ── */
function openDonate(){document.getElementById('dmodal').classList.add('open');document.body.style.overflow='hidden';}
function closeDonate(){document.getElementById('dmodal').classList.remove('open');document.body.style.overflow='';}

/* ── LIGHTBOX ── */
var lbSet=[],lbI=0;
function openLb(set,i){lbSet=set;lbI=i;document.getElementById('lbImg').src=lbSet[lbI];document.getElementById('lb').classList.add('open');document.body.style.overflow='hidden';}
function closeLb(){document.getElementById('lb').classList.remove('open');document.body.style.overflow='';}
function lbNav(d){lbI=(lbI+d+lbSet.length)%lbSet.length;document.getElementById('lbImg').src=lbSet[lbI];}

/* ── KEYBOARD ── */
document.addEventListener('keydown',function(e){
  var lb=document.getElementById('lb'),dm=document.getElementById('dmodal');
  if(lb&&lb.classList.contains('open')){if(e.key==='ArrowRight')lbNav(1);if(e.key==='ArrowLeft')lbNav(-1);if(e.key==='Escape')closeLb();}
  if(dm&&dm.classList.contains('open')&&e.key==='Escape')closeDonate();
});

/* ── VERSE SLIDER ── */
(function(){
  var el=document.getElementById('vs');if(!el)return;
  var vI=0,vS=el.querySelectorAll('.vs-slide'),vD=el.querySelectorAll('.vdot');
  if(!vS.length)return;
  window.showV=function(i){vS[vI].classList.remove('on');if(vD[vI])vD[vI].classList.remove('on');vI=(i+vS.length)%vS.length;vS[vI].classList.add('on');if(vD[vI])vD[vI].classList.add('on');};
  window.vsNav=function(d){showV(vI+d);};
  setInterval(function(){showV(vI+1);},5500);
})();

/* ── SCROLL REVEAL ── */
var revObs=new IntersectionObserver(function(entries){
  entries.forEach(function(x){if(x.isIntersecting)x.target.classList.add('on');});
},{threshold:0.08});
document.querySelectorAll('.rev').forEach(function(el){revObs.observe(el);});

/* ── GALLERY AUTO-INIT → LIGHTBOX ── */
(function(){
  document.querySelectorAll('.gallery').forEach(function(gal){
    var items=gal.querySelectorAll('.gallery-item'),srcs=[];
    items.forEach(function(item,idx){var img=item.querySelector('img');if(img)srcs.push(img.src);item.addEventListener('click',function(){openLb(srcs,idx);});});
  });
})();

/* ── CAROUSEL E3 → LIGHTBOX ── */
(function(){
  document.querySelectorAll('.carousel-e3').forEach(function(car){
    var items=car.querySelectorAll('.carousel-e3-item'),srcs=[];
    items.forEach(function(item,idx){var img=item.querySelector('img');if(img)srcs.push(img.src);item.addEventListener('click',function(){openLb(srcs,idx);});});
  });
})();

/* ── COUNTER ANIMATION ON SCROLL ── */
function animateCounters(container){
  var els=container.querySelectorAll('[data-anim]');
  els.forEach(function(el){
    var target=parseInt(el.dataset.anim),count=0,steps=55,inc=target/steps;
    var bar=el.closest('.impact-card');
    if(bar){var b=bar.querySelector('.impact-bar');if(b)b.style.width='100%';}
    var timer=setInterval(function(){
      count=Math.min(count+inc,target);
      if(target>=10000)el.textContent=Math.round(count/1000).toLocaleString()+'K+';
      else if(target>=1000)el.textContent=Math.round(count).toLocaleString()+'+';
      else el.textContent=Math.round(count)+'+';
      if(count>=target)clearInterval(timer);
    },30);
  });
}
(function(){
  var impactSections=document.querySelectorAll('.impact-row');
  impactSections.forEach(function(sec){
    var done=false;
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){if(e.isIntersecting&&!done){done=true;animateCounters(sec);}});
    },{threshold:0.2});
    obs.observe(sec);
  });
})();

/* ── CONTACT FORM SUBMIT — Formspree ── */
function doSubmit(btn){
  var form=btn.closest('.cf');
  var nombre=form.querySelector('input[name="nombre"]');
  var email=form.querySelector('input[name="email"]');
  var l=document.documentElement.getAttribute('data-lang');

  if(!nombre||!nombre.value.trim()){nombre.style.borderColor='var(--accent)';nombre.focus();return;}
  if(!email||!email.value.trim()||!email.value.includes('@')){email.style.borderColor='var(--accent)';email.focus();return;}

  var hp=form.querySelector('input[name="_gotcha"]');
  if(hp&&hp.value)return;

  btn.disabled=true;
  btn.innerHTML='<span>'+(l==='es'?'Enviando...':'Sending...')+'</span>';

  var data=new FormData();
  form.querySelectorAll('[name]').forEach(function(el){if(el.name&&el.value)data.append(el.name,el.value);});

  fetch('https://formspree.io/f/mojoywvg',{
    method:'POST',body:data,headers:{'Accept':'application/json'}
  }).then(function(r){
    if(r.ok){
      btn.innerHTML='<span>'+(l==='es'?'¡Mensaje enviado!':'Message sent!')+'</span>';
      btn.style.background='#1a7a1a';
      form.querySelectorAll('.cf-inp,.cf-ta,.cf-sel').forEach(function(el){el.value='';});
    }else{
      btn.innerHTML='<span>'+(l==='es'?'Error, intentá de nuevo':'Error, try again')+'</span>';
      btn.disabled=false;
    }
  }).catch(function(){
    btn.innerHTML='<span>'+(l==='es'?'Error de conexión':'Connection error')+'</span>';
    btn.disabled=false;
  });
}
