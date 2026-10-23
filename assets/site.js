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


/* Optional Google Analytics 4: only load after a visitor opts in. */
(()=>{
  'use strict';
  const measurementId='G-8E400S9VR8';
  const consentKey='angel_analytics_choice_v1';
  const pendingKey='angel_pending_enquiry_v1';
  let analyticsStarted=false;
  let banner;

  function choice(){
    try{return localStorage.getItem(consentKey);}catch(e){return null;}
  }
  function saveChoice(value){
    try{localStorage.setItem(consentKey,value);}catch(e){/* private browser mode */}
  }
  function recordConfirmedEnquiry(){
    const path=location.pathname.toLowerCase();
    const expected=path.endsWith('/bill-review-thanks.html')?'bill_review_request':
      path.endsWith('/thanks.html')?'contact_enquiry':null;
    if(!expected||typeof window.gtag!=='function')return;
    let pending;
    try{pending=JSON.parse(sessionStorage.getItem(pendingKey)||'null');}catch(e){pending=null;}
    if(!pending||pending.event!==expected||Date.now()-pending.time>30*60*1000)return;
    // No names, addresses, phone numbers, uploaded bills or other personal data sent to GA.
    window.gtag('event',expected,{engagement_time_msec:100});
    try{sessionStorage.removeItem(pendingKey);}catch(e){/* ignore */}
  }
  function updateDiagnostics(message){
    const el=document.getElementById('angel-analytics-diagnostic');
    if(el)el.textContent=message;
  }
  function refreshDiagnostics(){
    const state=choice();
    if(state==='accepted')updateDiagnostics('Analytics permission: Accepted. Checking whether the Google Analytics script loads…');
    else if(state==='rejected')updateDiagnostics('Analytics permission: Rejected. Google Analytics is not loaded.');
    else updateDiagnostics('Analytics permission: Not yet chosen. Google Analytics is not loaded.');
  }
  function startAnalytics(){
    if(analyticsStarted)return;
    analyticsStarted=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('js',new Date());
    window.gtag('config',measurementId);
    const script=document.createElement('script');
    script.async=true;
    script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(measurementId);
    script.addEventListener('load',()=>{updateDiagnostics('The Google Analytics script loaded in this browser. Realtime reporting must still be verified.');});
    script.addEventListener('error',()=>{updateDiagnostics('Your browser did not load the Google Analytics script. A content blocker, network filter or connection problem may be responsible.');});
    document.head.appendChild(script);
    recordConfirmedEnquiry();
  }
  function setChoice(value){
    saveChoice(value);
    if(banner){banner.remove();banner=null;}
    refreshDiagnostics();
    if(value==='accepted'){
      window['ga-disable-'+measurementId]=false;
      startAnalytics();
    }else if(analyticsStarted){
      // Stop collection immediately when a returning visitor withdraws consent.
      window['ga-disable-'+measurementId]=true;
      location.reload();
    }
  }
  function showBanner(){
    if(banner)return;
    banner=document.createElement('section');
    banner.className='angel-cookie-banner';
    banner.setAttribute('role','dialog');
    banner.setAttribute('aria-label','Optional analytics choices');
    banner.innerHTML='<div class="angel-cookie-text"><strong>Help us improve our website</strong><p>With your permission, we use Google Analytics to understand visits and enquiries. You can decline and still use the site normally. <a href="privacy.html#analytics-choices">Privacy and cookies</a></p></div><div class="angel-cookie-actions"><button type="button" data-analytics="reject">Reject optional analytics</button><button type="button" data-analytics="accept">Accept analytics</button></div>';
    banner.querySelector('[data-analytics="reject"]').addEventListener('click',()=>setChoice('rejected'));
    banner.querySelector('[data-analytics="accept"]').addEventListener('click',()=>setChoice('accepted'));
    document.body.appendChild(banner);
  }
  function init(){
    // A confirmation page alone is not proof that a real form was submitted.
    // Only count one if this browser submitted the matching form recently.
    document.querySelectorAll('form[action*="formsubmit.co"]').forEach(form=>{
      const isBillReview=location.pathname.toLowerCase().endsWith('/bill-review.html');
      const event=isBillReview?'bill_review_request':'contact_enquiry';
      form.addEventListener('submit',()=>{
        if(!form.checkValidity())return;
        try{sessionStorage.setItem(pendingKey,JSON.stringify({event,time:Date.now()}));}catch(e){/* ignore */}
      });
    });
    // Count intent separately from confirmed enquiries, and never send form values
    // or external upload URLs (which can contain private sharing tokens).
    document.addEventListener('click',e=>{
      const link=e.target.closest('a[href]');
      if(!link||choice()!=='accepted'||typeof window.gtag!=='function')return;
      let target;
      try{target=new URL(link.href,location.href);}catch(error){return;}
      let event;
      if(target.origin===location.origin&&target.pathname==='/bill-review.html')event='bill_review_click';
      else if(target.hostname==='www.pocketgeektechrepair.co.uk')event='repair_centre_click';
      else if(target.protocol==='tel:')event='phone_contact_click';
      else if(target.protocol==='mailto:')event='email_contact_click';
      else if(target.hostname==='angeltelecom1-my.sharepoint.com')event='bill_upload_click';
      if(event)window.gtag('event',event,{page_path:location.pathname});
    });
    const privacySettings=document.getElementById('angel-analytics-settings');
    if(privacySettings)privacySettings.addEventListener('click',e=>{
      e.preventDefault();
      showBanner();
    });
    refreshDiagnostics();
    if(choice()==='accepted')startAnalytics();
    else if(choice()!=='rejected')showBanner();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
