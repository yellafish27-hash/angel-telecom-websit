document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.premium-footer-section h3').forEach(h=>{
    const toggle=()=>{if(window.innerWidth<=600){h.parentElement.classList.toggle('collapsed');}};
    h.addEventListener('click',toggle);
    h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
  });
});
