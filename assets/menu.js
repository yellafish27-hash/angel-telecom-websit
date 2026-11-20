/* Shared mobile menu for the site header. */
(function(){
  var btn=document.querySelector('.rh-menu-btn'),panel=document.getElementById('rh-mobile-nav');
  if(!btn||!panel)return;
  function setMenu(open){btn.setAttribute('aria-expanded',String(open));panel.hidden=!open;}
  btn.addEventListener('click',function(){setMenu(btn.getAttribute('aria-expanded')!=='true');});
  panel.addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&btn.getAttribute('aria-expanded')==='true'){setMenu(false);btn.focus();}});
})();
