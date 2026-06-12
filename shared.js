function setLang(l){
  document.documentElement.setAttribute('data-lang',l);
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.textContent.toLowerCase()===l));
  localStorage.setItem('lang',l);
}
function toggleNav(){document.getElementById('navOv').classList.toggle('open');}
window.addEventListener('scroll',()=>document.getElementById('nav').classList.toggle('scrolled',scrollY>50));
// Restore lang
(function(){var l=localStorage.getItem('lang')||'es';setLang(l);})();
// Donate modal
function openDonate(){document.getElementById('dmodal').classList.add('open');document.body.style.overflow='hidden';}
function closeDonate(){document.getElementById('dmodal').classList.remove('open');document.body.style.overflow='';}
// Reveal
const ro=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('on');}),{threshold:.1});
document.querySelectorAll('.rev').forEach(el=>ro.observe(el));
// Verse slider (if present)
if(document.getElementById('vs')){
  let vI=0;
  const vS=document.querySelectorAll('.vs-slide');
  const vD=document.querySelectorAll('.vdot');
  window.showV=function(i){vS[vI].classList.remove('on');vD[vI].classList.remove('on');vI=(i+vS.length)%vS.length;vS[vI].classList.add('on');vD[vI].classList.add('on');};
  window.vsNav=function(d){showV(vI+d);};
  setInterval(()=>showV(vI+1),5500);
}
// Lightbox
let lbSet=[],lbI=0;
function openLb(set,i){lbSet=set;lbI=i;document.getElementById('lbImg').src=lbSet[lbI];document.getElementById('lb').classList.add('open');document.body.style.overflow='hidden';}
function closeLb(){document.getElementById('lb').classList.remove('open');document.body.style.overflow='';}
function lbNav(d){lbI=(lbI+d+lbSet.length)%lbSet.length;document.getElementById('lbImg').src=lbSet[lbI];}
document.addEventListener('keydown',e=>{
  if(document.getElementById('lb').classList.contains('open')){
    if(e.key==='ArrowRight')lbNav(1);if(e.key==='ArrowLeft')lbNav(-1);if(e.key==='Escape')closeLb();
  }
  if(document.getElementById('dmodal').classList.contains('open')&&e.key==='Escape')closeDonate();
});
