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
      '<div class="inv-img"><img src="'+cfg.img+'" alt="" loading="lazy" decoding="async">'+
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
  function show(){
    if(open || seen()) return;
    var dm = document.getElementById('dmodal');
    if(dm && dm.classList.contains('open')) return;   /* no pisar el modal de donación */
    var nv = document.getElementById('navOv');
    if(nv && nv.classList.contains('open')) return;   /* ni el menú móvil */
    open = true; lastFocus = document.activeElement;
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
    var f = el.querySelector('.inv-x'); if(f) f.focus();
  }
  function hide(){
    open = false; remember();
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
