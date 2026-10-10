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

  function aFormspree(){
    fetch('https://formspree.io/f/mojoywvg', {
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body: JSON.stringify({_subject:'Nueva Donación / New Donation', nombre:n, apellido:a, email:e, origen: location.pathname})
    }).then(function(r){ finish(r.ok); }).catch(function(){ finish(false); });
  }
  fetch('/api/form', {
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body: JSON.stringify({_form:'donacion', _email:e, _origen:location.pathname,
      'Nombre':n, 'Apellido':a, 'Correo electrónico':e})
  }).then(function(r){ if(r.ok){ finish(true); } else { aFormspree(); } })
    .catch(function(){ aFormspree(); });
}

/* ============ MENU A PANTALLA COMPLETA ============ */
function kmOpen(){var m=document.getElementById('km');if(!m)return;
  m.classList.add('on');m.setAttribute('aria-hidden','false');document.body.classList.add('km-open');}
function kmClose(){var m=document.getElementById('km');if(!m)return;
  m.classList.remove('on');m.setAttribute('aria-hidden','true');document.body.classList.remove('km-open');}
addEventListener('keydown',function(e){if(e.key==='Escape')kmClose();});

/* ============ NEWSLETTER ============ */
function knlSend(e){
  e.preventDefault();
  var f=e.target, inp=f.querySelector('input'), msg=document.getElementById('knlMsg');
  var es=document.documentElement.getAttribute('data-lang')!=='en';
  var mail=(inp.value||'').trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)){
    if(msg)msg.textContent=es?'Revisa el correo e inténtalo de nuevo.':'Please check the email and try again.';
    return false;
  }
  if(msg)msg.textContent=es?'Enviando…':'Sending…';
  var listo=false;
  function fin(ok){
    if(listo)return; listo=true;
    if(msg)msg.textContent = ok
      ? (es?'¡Listo! Te sumamos a la lista.':'Done! You are on the list.')
      : (es?'No pudimos registrarte ahora. Escríbenos por correo.':'We could not sign you up right now. Please email us.');
    if(ok)inp.value='';
  }
  setTimeout(function(){fin(true);},2500);
  function aFormspree(){
    fetch('https://formspree.io/f/mojoywvg',{method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({_subject:'Newsletter KIAF',email:mail,origen:location.pathname})
    }).then(function(r){fin(r.ok);}).catch(function(){fin(false);});
  }
  fetch('/api/form',{method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({_form:'newsletter',_email:mail,_origen:location.pathname,
      'Correo electrónico':mail})
  }).then(function(r){ if(r.ok){fin(true);} else {aFormspree();} })
    .catch(function(){aFormspree();});
  return false;
}

/* =================================================================
   FORMULARIOS NATIVOS KIAF  ·  kfmSend()
   -----------------------------------------------------------------
   Valida en el navegador, marca los campos que faltan y envía a
   Formspree. Igual que la donación, nunca deja al visitante
   esperando: a los 2,5 s se confirma aunque la red no responda.
   ================================================================= */
(function(){
  var ENDPOINT = 'https://formspree.io/f/mojoywvg';

  function es(){ return document.documentElement.getAttribute('data-lang') !== 'en'; }

  function etiqueta(campo){
    var l = campo.querySelector('.kfm-l');
    if(!l) return '';
    var sp = l.querySelector(es() ? '[data-es]' : '[data-en]');
    var t = (sp ? sp.textContent : l.textContent) || '';
    return t.replace(/\*/g,'').trim();
  }

  /* --- opciones: pinta la tarjeta elegida (respaldo de :has) --- */
  function pintarOpciones(form){
    form.querySelectorAll('.kfm-op>input').forEach(function(inp){
      var op = inp.closest('.kfm-op');
      if(!op) return;
      if(inp.type === 'radio' && inp.name){
        form.querySelectorAll('.kfm-op>input[name="'+inp.name+'"]').forEach(function(o){
          var c = o.closest('.kfm-op'); if(c) c.classList.toggle('on', o.checked);
        });
      } else {
        op.classList.toggle('on', inp.checked);
      }
    });
  }

  /* --- campos que aparecen según la respuesta anterior --- */
  function aplicarCondiciones(form){
    form.querySelectorAll('[data-kfm-cond]').forEach(function(bloque){
      var regla = bloque.getAttribute('data-kfm-cond').split('=');
      var nombre = regla[0], valor = (regla[1] || '').trim();
      var activo = false;
      form.querySelectorAll('[name="'+nombre+'"]').forEach(function(c){
        if(c.type === 'radio' || c.type === 'checkbox'){
          if(c.checked && (!valor || c.value === valor)) activo = true;
        } else if(c.value && (!valor || c.value === valor)) activo = true;
      });
      bloque.classList.toggle('on', activo);
      bloque.querySelectorAll('input,select,textarea').forEach(function(c){ c.disabled = !activo; });
    });
  }

  function limpiar(form){
    form.querySelectorAll('.kfm-f.bad').forEach(function(f){ f.classList.remove('bad'); });
  }

  function marcar(campo, texto){
    campo.classList.add('bad');
    var e = campo.querySelector('.kfm-f-err');
    if(e) e.textContent = texto;
  }

  /* --- validación --- */
  function validar(form){
    limpiar(form);
    var falta = [], primero = null, idi = es();
    var txtFalta = idi ? 'Este dato es necesario.' : 'This field is required.';
    var txtMail  = idi ? 'Revisa la dirección de correo.' : 'Please check the email address.';

    form.querySelectorAll('.kfm-f').forEach(function(campo){
      if(campo.classList.contains('kfm-cond') && !campo.classList.contains('on')) return;
      var req = campo.querySelectorAll('[required]');
      if(!req.length) return;
      req.forEach(function(c){
        if(c.disabled) return;
        var vacio;
        if(c.type === 'checkbox' || c.type === 'radio'){
          vacio = !form.querySelector('[name="'+c.name+'"]:checked');
        } else {
          vacio = !(c.value || '').trim();
        }
        if(vacio){
          marcar(campo, txtFalta);
          falta.push(etiqueta(campo));
          if(!primero) primero = campo;
        } else if(c.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value.trim())){
          marcar(campo, txtMail);
          falta.push(etiqueta(campo));
          if(!primero) primero = campo;
        }
      });
    });

    /* grupos de casillas con al menos una obligatoria */
    form.querySelectorAll('[data-kfm-min]').forEach(function(g){
      var min = parseInt(g.getAttribute('data-kfm-min'), 10) || 1;
      if(g.querySelectorAll('input:checked').length < min){
        var campo = g.closest('.kfm-f') || g;
        marcar(campo, idi ? 'Elige al menos una opción.' : 'Please choose at least one option.');
        falta.push(etiqueta(campo));
        if(!primero) primero = campo;
      }
    });

    return { ok: !falta.length, primero: primero, falta: falta };
  }

  /* --- recoge todo lo escrito, con las etiquetas visibles --- */
  function recoger(form){
    var datos = {};
    form.querySelectorAll('.kfm-f').forEach(function(campo){
      if(campo.classList.contains('kfm-cond') && !campo.classList.contains('on')) return;
      var nombre = etiqueta(campo) || 'Campo';
      var marcadas = [];
      campo.querySelectorAll('input,select,textarea').forEach(function(c){
        if(c.disabled || c.classList.contains('kfm-hp-in')) return;
        if(c.type === 'checkbox' || c.type === 'radio'){
          if(c.checked) marcadas.push(c.getAttribute('data-label') || c.value);
        } else {
          var v = (c.value || '').trim();
          if(v) marcadas.push(v);
        }
      });
      if(marcadas.length) datos[nombre] = marcadas.join(' · ');
    });
    return datos;
  }

  window.kfmSend = function(ev){
    ev.preventDefault();
    var form = ev.target;
    var msg  = form.querySelector('.kfm-msg');
    var btn  = form.querySelector('.kfm-send');
    var ok   = document.getElementById(form.getAttribute('data-kfm-ok') || '');
    var idi  = es();

    /* trampa para robots: si viene llena, fingimos éxito y no enviamos */
    var hp = form.querySelector('.kfm-hp-in');
    if(hp && (hp.value || '').trim()){
      if(ok){ form.style.display = 'none'; ok.classList.add('on'); }
      return false;
    }

    var v = validar(form);
    if(!v.ok){
      if(msg){
        msg.className = 'kfm-msg err';
        msg.textContent = idi
          ? 'Faltan algunos datos: ' + v.falta.slice(0,3).join(', ') + (v.falta.length > 3 ? '…' : '')
          : 'Some fields are missing: ' + v.falta.slice(0,3).join(', ') + (v.falta.length > 3 ? '…' : '');
      }
      if(v.primero) v.primero.scrollIntoView({ behavior:'smooth', block:'center' });
      return false;
    }

    if(msg){ msg.className = 'kfm-msg'; msg.textContent = idi ? 'Enviando…' : 'Sending…'; }
    if(btn) btn.disabled = true;

    var cuerpo = recoger(form);

    /* Si el envio falla no inventamos un exito: lo que escribio la persona es
       demasiado valioso para perderlo. Le avisamos y le damos sus respuestas
       en texto para que pueda mandarlas por correo sin volver a escribirlas. */
    function textoPlano(){
      var l = [];
      for(var k in cuerpo){
        if(k.charAt(0) === '_' || k === 'email') continue;
        l.push(k + ': ' + cuerpo[k]);
      }
      return l.join('\n');
    }

    function rescate(){
      var zona = form.querySelector('.kfm-rescate');
      if(!zona) return;
      zona.classList.add('on');
      var cop = zona.querySelector('[data-kfm-copiar]');
      if(cop && !cop.dataset.listo){
        cop.dataset.listo = '1';
        cop.addEventListener('click', function(){
          var t = textoPlano();
          function hecho(){
            cop.textContent = es() ? 'Copiado' : 'Copied';
            setTimeout(function(){
              cop.textContent = es() ? 'Copiar mis respuestas' : 'Copy my answers';
            }, 2200);
          }
          if(navigator.clipboard && navigator.clipboard.writeText){
            navigator.clipboard.writeText(t).then(hecho, function(){ respaldoCopia(t, hecho); });
          } else { respaldoCopia(t, hecho); }
        });
      }
    }
    function respaldoCopia(t, hecho){
      var a = document.createElement('textarea');
      a.value = t; a.style.position = 'fixed'; a.style.opacity = '0';
      document.body.appendChild(a); a.select();
      try{ document.execCommand('copy'); hecho(); }catch(e){}
      document.body.removeChild(a);
    }

    var listo = false;
    function fin(bien){
      if(listo) return; listo = true;
      if(bien){
        if(ok){
          form.style.display = 'none';
          ok.classList.add('on');
          ok.scrollIntoView({ behavior:'smooth', block:'center' });
        } else if(msg){
          msg.className = 'kfm-msg ok';
          msg.textContent = idi ? '¡Recibido! Te respondemos pronto.' : 'Received! We will reply soon.';
        }
      } else {
        if(btn) btn.disabled = false;
        if(msg){
          msg.className = 'kfm-msg err';
          msg.textContent = idi
            ? 'No pudimos enviarlo ahora. No pierdas lo que escribiste: copia tus respuestas y envíalas a kingdominactionministry@gmail.com, o vuelve a intentarlo.'
            : 'We could not send it right now. Do not lose what you wrote: copy your answers and send them to kingdominactionministry@gmail.com, or try again.';
        }
        rescate();
      }
    }

    /* si el servidor no contesta en 12 s lo damos por caido */
    setTimeout(function(){ fin(false); }, 12000);

    cuerpo._subject = form.getAttribute('data-kfm-subject') || 'Formulario KIAF';
    cuerpo.Formulario = form.getAttribute('data-kfm-name') || '';
    cuerpo.Idioma = idi ? 'Español' : 'English';
    cuerpo.Origen = location.pathname;
    var correo = form.querySelector('input[type=email]');
    if(correo && correo.value) cuerpo.email = correo.value.trim();

    /* Copia para el backend propio. Las claves con "_" no se guardan como
       respuestas: solo sirven para enrutar y etiquetar el registro. */
    var propio = {};
    for(var k in cuerpo) propio[k] = cuerpo[k];
    delete propio._subject;
    delete propio.email;
    propio._form   = form.getAttribute('data-kfm-tipo') || '';
    propio._email  = cuerpo.email || '';
    propio._idioma = idi ? 'es' : 'en';
    propio._origen = location.pathname;

    enviar(propio, cuerpo, fin);
    return false;
  };

  /* ---------------------------------------------------------------
     Primero el backend propio del sitio (/api/form, en la misma
     Cloudflare). Si todavía no está conectado o falla, cae a Formspree,
     para poder hacer el cambio sin ventana de corte.
     --------------------------------------------------------------- */
  function enviar(propio, cuerpo, fin){
    function aFormspree(){
      fetch(ENDPOINT, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
        body: JSON.stringify(cuerpo)
      }).then(function(r){ fin(r.ok); }).catch(function(){ fin(false); });
    }
    if(!propio._form){ aFormspree(); return; }   /* sin tipo: directo al respaldo */
    fetch('/api/form', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
      body: JSON.stringify(propio)
    }).then(function(r){
      if(r.ok){ fin(true); return; }
      aFormspree();                               /* 404/503: backend aún no montado */
    }).catch(function(){ aFormspree(); });
  }

  /* --- arranque --- */
  function iniciar(){
    document.querySelectorAll('form[data-kfm]').forEach(function(form){
      pintarOpciones(form);
      aplicarCondiciones(form);
      form.addEventListener('change', function(){
        pintarOpciones(form);
        aplicarCondiciones(form);
      });
      form.addEventListener('input', function(e){
        var campo = e.target.closest('.kfm-f');
        if(campo) campo.classList.remove('bad');
      });
      /* el teclado también debe poder marcar la tarjeta */
      form.querySelectorAll('.kfm-op').forEach(function(op){
        op.addEventListener('keydown', function(e){
          if(e.key === ' ' || e.key === 'Enter'){
            var inp = op.querySelector('input');
            if(inp && document.activeElement === op){ e.preventDefault(); inp.click(); }
          }
        });
      });
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();

/* =================================================================
   MÉTRICAS KIAF
   -----------------------------------------------------------------
   Dos piezas, las dos sin cookies y sin datos personales:

   1) Cloudflare Web Analytics — tráfico (visitas, países, páginas,
      de dónde vienen). Pega tu token abajo y se enciende.
   2) Contadores propios en tu base — las acciones que muestran
      mejoras: cuántos abrieron el cuadro de donar, cuántos llegaron
      a PayPal, cuántos empezaron un formulario, cuántos bajaron un
      folleto. Eso es lo que Cloudflare no puede decirte.
   ================================================================= */
(function(){
  /* ---- 1. Cloudflare Web Analytics ----
     Reemplaza TOKEN_AQUI por el token que te da Cloudflare en
     Web Analytics → Add a site. Mientras diga TOKEN_AQUI, no carga nada. */
  var CF_TOKEN = 'TOKEN_AQUI';
  if(CF_TOKEN && CF_TOKEN !== 'TOKEN_AQUI'){
    var s = document.createElement('script');
    s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_TOKEN }));
    document.head.appendChild(s);
  }

  /* ---- 2. contadores propios ---- */
  /* Cloudflare Pages sirve /cuba.html como /cuba, así que normalizamos para
     que una misma página no cuente dos veces con dos nombres distintos. */
  var pag = (location.pathname.split('/').pop() || '').replace(/\.html$/i, '') || 'inicio';

  function marcar(evento, detalle){
    try{
      var cuerpo = JSON.stringify({ e: evento, d: detalle || pag });
      /* sendBeacon sobrevive al cambio de página (importante para PayPal) */
      if(navigator.sendBeacon){
        navigator.sendBeacon('/api/ev', new Blob([cuerpo], {type:'application/json'}));
      } else {
        fetch('/api/ev', {method:'POST', headers:{'Content-Type':'application/json'},
          body: cuerpo, keepalive: true}).catch(function(){});
      }
    }catch(e){}
  }
  window.kiafMarcar = marcar;

  /* visita */
  marcar('visita');

  /* Todo por delegación: así sigue funcionando aunque una página
     redefina openDonate() en un script propio. */
  document.addEventListener('click', function(ev){
    var t = ev.target;
    if(!t || !t.closest) return;

    /* abrir el cuadro de donar */
    if(t.closest('[onclick*="openDonate"]')) marcar('donar_abierto');

    /* el botón del cuadro que lleva a PayPal (salto por JS, no es enlace) */
    if(t.closest('.dpay-btn')) marcar('paypal');

    /* enlaces: PayPal directo y folletos */
    var a = t.closest('a');
    if(a){
      var h = a.getAttribute('href') || '';
      if(h.indexOf('paypal.com') > -1) marcar('paypal');
      else if(/\.pdf($|\?)/i.test(h)) marcar('pdf', h.split('/').pop().split('?')[0]);
    }
  }, true);

  /* primer tecleo en un formulario = intención real */
  var arrancado = {};
  document.addEventListener('input', function(ev){
    var f = ev.target.closest && ev.target.closest('form[data-kfm]');
    if(!f) return;
    var t = f.getAttribute('data-kfm-tipo') || 'form';
    if(arrancado[t]) return;
    arrancado[t] = 1;
    marcar('form_inicio', t);
  }, true);
})();
