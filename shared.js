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

/* ============ INVITACIÓN CONTEXTUAL ============
   Cada página define window.KIAF_INVITE antes de cargar este script.
   Se muestra al 55% de scroll o a los 35s, lo que ocurra primero.
   Al cerrarse no vuelve a aparecer durante 7 días. */
(function(){
  var cfg = window.KIAF_INVITE;
  if(!cfg) return;
  var KEY = 'kiaf_inv_' + (cfg.id || 'x');
  /* localStorage puede fallar en modo privado: nunca romper la página por eso */
  function seen(){
    try{
      var v = localStorage.getItem(KEY);
      return v && (Date.now() - (+v) < 7*24*60*60*1000);
    }catch(e){ return false; }
  }
  function remember(){ try{ localStorage.setItem(KEY, Date.now()); }catch(e){} }
  if(seen()) return;

  /* El componente trae sus propios estilos: si shared.css no cargó o
     quedó una versión vieja en caché, el pop-up igual se ve bien. */
  if(!document.getElementById('kiaf-inv-css')){
    var st=document.createElement('style'); st.id='kiaf-inv-css';
    st.textContent=
    ".inv-bg{position:fixed;inset:0;z-index:180;background:rgba(8,9,11,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;visibility:hidden;transition:opacity .5s cubic-bezier(.22,.61,.36,1),visibility .5s}"+
    ".inv-bg.open{opacity:1;visibility:visible}"+
    ".inv{position:relative;width:min(880px,100%);max-height:88vh;overflow:hidden;border-radius:6px;background:#F8F4ED;display:grid;grid-template-columns:.85fr 1fr;box-shadow:0 40px 100px -30px rgba(0,0,0,.8);transform:translateY(26px) scale(.97);opacity:0;transition:transform .6s cubic-bezier(.22,.61,.36,1),opacity .6s}"+
    ".inv-bg.open .inv{transform:none;opacity:1}"+
    ".inv-img{position:relative;overflow:hidden;background:#1E2328;min-height:340px}"+
    ".inv-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.06);transition:opacity 1.5s ease,transform 9s ease-out}"+
    ".inv-img img.on{opacity:1}"+
    ".inv-bg.open .inv-img img.on{transform:scale(1)}"+
    ".inv-img:after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(13,15,17,.55),transparent 55%)}"+
    ".inv-badge{position:absolute;left:0;bottom:0;z-index:2;padding:20px 22px;font-size:9px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:#fff}"+
    ".inv-body{padding:clamp(30px,4vw,46px) clamp(24px,3.4vw,44px);display:flex;flex-direction:column;justify-content:center;overflow-y:auto}"+
    ".inv-ey{display:flex;align-items:center;gap:11px;font-size:9.5px;font-weight:700;letter-spacing:.34em;text-transform:uppercase;color:#CC2222;margin-bottom:14px}"+
    ".inv-ey:before{content:'';width:28px;height:1px;background:currentColor}"+
    ".inv-t{font-family:'Barlow Condensed',sans-serif;font-size:clamp(1.6rem,3.2vw,2.3rem);font-weight:800;text-transform:uppercase;line-height:1.06;color:#2C2A25}"+
    ".inv-p{font-size:15px;line-height:1.8;color:#6B6560;margin-top:14px;max-width:44ch}"+
    ".inv-acts{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}"+
    ".inv-btn{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;padding:15px 28px;border-radius:3px;background:#CC2222;color:#fff;border:1px solid #CC2222;cursor:pointer;text-decoration:none;transition:background .35s,color .35s,transform .35s}"+
    ".inv-btn:hover{background:#8B1A1A;border-color:#8B1A1A;transform:translateY(-2px)}"+
    ".inv-btn--ghost{background:transparent;color:#2C2A25;border-color:#E2DCD3}"+
    ".inv-btn--ghost:hover{background:#2C2A25;color:#F8F4ED;border-color:#2C2A25}"+
    ".inv-x{position:absolute;top:12px;right:12px;z-index:5;width:44px;height:44px;border:none;cursor:pointer;background:rgba(248,244,237,.92);color:#2C2A25;border-radius:50%;font-size:17px;line-height:1;display:flex;align-items:center;justify-content:center;transition:background .3s,transform .3s}"+
    ".inv-x:hover{background:#fff;transform:rotate(90deg)}"+
    ".inv-later{margin-top:16px;background:none;border:none;cursor:pointer;padding:6px 0;text-align:left;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#6B6560;text-decoration:underline;text-underline-offset:4px}"+
    ".inv-later:hover{color:#CC2222}"+
    "@media(max-width:760px){.inv{grid-template-columns:1fr;max-height:92vh}.inv-img{min-height:0;height:32vh}}"+
    "@media(prefers-reduced-motion:reduce){.inv,.inv-img img{transition:none!important;transform:none!important}}";
    document.head.appendChild(st);
  }

  var el = document.createElement('div');
  el.className = 'inv-bg';
  el.setAttribute('role','dialog');
  el.setAttribute('aria-modal','true');
  el.setAttribute('aria-label', cfg.titleEs || 'Invitación');
  var acts = (cfg.actions||[]).map(function(a){
    var cls = 'inv-btn' + (a.ghost ? ' inv-btn--ghost' : '');
    if(a.action === 'donate')
      return '<button class="'+cls+'" data-act="donate" data-es>'+a.es+'</button>'+
             '<button class="'+cls+'" data-act="donate" data-en>'+a.en+'</button>';
    return '<a class="'+cls+'" href="'+a.href+'"'+(a.blank?' target="_blank" rel="noopener"':'')+' data-es>'+a.es+'</a>'+
           '<a class="'+cls+'" href="'+a.href+'"'+(a.blank?' target="_blank" rel="noopener"':'')+' data-en>'+a.en+'</a>';
  }).join('');

  el.innerHTML =
    '<div class="inv">'+
      '<button class="inv-x" aria-label="Cerrar">&#10005;</button>'+
      '<div class="inv-img">'+
        (cfg.imgs && cfg.imgs.length
          ? cfg.imgs.map(function(s,i){ return '<img class="inv-ph'+(i?'':' on')+'" src="'+s+'" alt="" loading="lazy" decoding="async">'; }).join('')
          : '<img class="inv-ph on" src="'+cfg.img+'" alt="" loading="lazy" decoding="async">')+
        '<div class="inv-badge" data-es>'+cfg.badgeEs+'</div>'+
        '<div class="inv-badge" data-en>'+cfg.badgeEn+'</div></div>'+
      '<div class="inv-body">'+
        '<div class="inv-ey" data-es>'+cfg.eyEs+'</div><div class="inv-ey" data-en>'+cfg.eyEn+'</div>'+
        '<div class="inv-t" data-es>'+cfg.titleEs+'</div><div class="inv-t" data-en>'+cfg.titleEn+'</div>'+
        '<p class="inv-p" data-es>'+cfg.textEs+'</p><p class="inv-p" data-en>'+cfg.textEn+'</p>'+
        '<div class="inv-acts">'+acts+'</div>'+
        '<button class="inv-later" data-es>Ahora no</button>'+
        '<button class="inv-later" data-en>Not now</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(el);

  var open = false, lastFocus = null;
  /* si hay varias fotos, se alternan con un fundido lento */
  var phs = [].slice.call(el.querySelectorAll('.inv-ph')), phI = 0, phT = null;
  function startSlides(){
    if(phs.length < 2) return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopSlides();
    phT = setInterval(function(){
      phs[phI].classList.remove('on');
      phI = (phI + 1) % phs.length;
      phs[phI].classList.add('on');
    }, 5200);
  }
  function stopSlides(){ if(phT){ clearInterval(phT); phT = null; } }
  function show(){
    if(open || seen()) return;
    var dm = document.getElementById('dmodal');
    if(dm && dm.classList.contains('open')) return;   /* no pisar el modal de donación */
    var nv = document.getElementById('navOv');
    if(nv && nv.classList.contains('open')) return;   /* ni el menú móvil */
    open = true; lastFocus = document.activeElement;
    el.classList.add('open');
    startSlides();
    document.body.style.overflow = 'hidden';
    var f = el.querySelector('.inv-x'); if(f) f.focus();
  }
  function hide(){
    open = false; remember(); stopSlides();
    el.classList.remove('open');
    document.body.style.overflow = '';
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  el.querySelector('.inv-x').addEventListener('click', hide);
  [].forEach.call(el.querySelectorAll('.inv-later'), function(b){ b.addEventListener('click', hide); });
  el.addEventListener('click', function(e){ if(e.target === el) hide(); });
  document.addEventListener('keydown', function(e){ if(open && e.key === 'Escape') hide(); });
  [].forEach.call(el.querySelectorAll('[data-act="donate"]'), function(b){
    b.addEventListener('click', function(){ hide(); if(window.openDonate) openDonate(); });
  });
  [].forEach.call(el.querySelectorAll('.inv-acts a'), function(a){ a.addEventListener('click', remember); });

  var timer = setTimeout(show, 35000);
  function onScroll(){
    var H = document.documentElement.scrollHeight - innerHeight;
    if(H > 0 && pageYOffset / H > 0.55){
      clearTimeout(timer);
      removeEventListener('scroll', onScroll);
      setTimeout(show, 700);
    }
  }
  addEventListener('scroll', onScroll, {passive:true});
})();

/* ============ DONACIÓN → PAYPAL ============
   Registra los datos del donante y SIEMPRE abre PayPal.
   Si el envío del formulario falla, PayPal se abre igual:
   nunca se bloquea una donación por un problema de red. */
var KIAF_PAYPAL = 'https://www.paypal.com/donate/?hosted_button_id=JABA38NT3X6KW';

function submitDonation(){
  var n = (document.getElementById('dnNombre')||{}).value || '';
  var a = (document.getElementById('dnApellido')||{}).value || '';
  var e = (document.getElementById('dnEmail')||{}).value || '';
  var msg = document.getElementById('dnMsg');
  var btn = document.querySelector('.dpay-btn');
  var es = document.documentElement.getAttribute('data-lang') !== 'en';

  function go(){
    var w = window.open(KIAF_PAYPAL, '_blank', 'noopener');
    if(!w) location.href = KIAF_PAYPAL;   /* si el navegador bloquea la pestaña */
  }
  function say(t, cls){ if(msg){ msg.textContent=t; msg.className='dpay-msg '+(cls||''); } }

  n=n.trim(); a=a.trim(); e=e.trim();
  /* sin datos: igual se dona */
  if(!n && !a && !e){ go(); return; }
  if(e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){
    say(es?'Revisa el email e inténtalo de nuevo.':'Please check the email and try again.','err');
    return;
  }
  if(btn) btn.disabled = true;
  say(es?'Abriendo PayPal…':'Opening PayPal…');

  var done=false;
  function finish(ok){
    if(done) return; done=true;
    if(btn) btn.disabled=false;
    say(ok ? (es?'¡Gracias! Se abrió PayPal en otra pestaña.':'Thank you! PayPal opened in another tab.')
           : (es?'Se abrió PayPal. No pudimos guardar tus datos, pero tu donación sigue adelante.'
                : 'PayPal opened. We could not save your details, but your donation continues.'),
        ok?'ok':'err');
    go();
  }
  /* si Formspree tarda, no hacemos esperar al donante */
  setTimeout(function(){ finish(true); }, 2500);

  fetch('https://formspree.io/f/mojoywvg', {
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body: JSON.stringify({_subject:'Nueva Donación / New Donation', nombre:n, apellido:a, email:e, origen: location.pathname})
  }).then(function(r){ finish(r.ok); }).catch(function(){ finish(false); });
}
