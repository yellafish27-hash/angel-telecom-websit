document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.premium-footer-section h3').forEach(h=>{
    const toggle=()=>{if(window.innerWidth<=600){h.parentElement.classList.toggle('collapsed');}};
    h.addEventListener('click',toggle);
    h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
  });
});


/* Site-wide back-to-top control */
document.addEventListener('DOMContentLoaded',()=>{
  const button=document.createElement('button');
  button.type='button';
  button.className='back-to-top';
  button.setAttribute('aria-label','Back to top');
  button.innerHTML='<span>↑</span><b>Top</b>';
  document.body.appendChild(button);

  const update=()=>{
    button.classList.toggle('is-visible',window.scrollY>500);
  };
  window.addEventListener('scroll',update,{passive:true});
  update();

  button.addEventListener('click',()=>{
    window.scrollTo({top:0,behavior:'smooth'});
  });
});
