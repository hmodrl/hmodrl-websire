(function(){
  var tabs=document.querySelectorAll('.arc-tab[data-index]');
  var panels=document.querySelectorAll('.arc-panel');
  var glow=document.getElementById('arcGlow');
  var titleEl=document.getElementById('arcHeroTitle');
  var subEl=document.getElementById('arcHeroSub');
  var pageEl=document.getElementById('arcCurrentPage');
  var nav=document.getElementById('arcNav');
  var totalTabs=tabs.length;

  function activateTab(i){
    tabs.forEach(function(t){t.classList.remove('active');});
    panels.forEach(function(p){p.classList.remove('active');});
    tabs[i].classList.add('active');
    panels[i].classList.add('active');

    titleEl.textContent=tabs[i].dataset.title;
    subEl.textContent=tabs[i].dataset.sub;
    pageEl.textContent=String(i+1).padStart(2,'0');

    moveGlow(tabs[i]);
  }

  function moveGlow(tab){
    var navRect=nav.getBoundingClientRect();
    var tabRect=tab.getBoundingClientRect();
    var x=tabRect.left-navRect.left+(tabRect.width/2)-28;
    glow.style.left=x+'px';
    glow.style.opacity='1';
  }

  tabs.forEach(function(tab,idx){
    tab.addEventListener('click',function(e){
      if(tab.id==='arcBasketTab'||tab.id==='arcUserTab')return;
      e.preventDefault();
      activateTab(idx);
    });
  });

  setTimeout(function(){
    var active=document.querySelector('.arc-tab.active');
    if(active) moveGlow(active);
  },100);

  // Glow drag
  var isDragging=false;
  nav.addEventListener('mousedown',function(e){isDragging=true;dragGlow(e);});
  nav.addEventListener('mousemove',function(e){if(isDragging)dragGlow(e);});
  nav.addEventListener('mouseup',function(){isDragging=false;});
  nav.addEventListener('mouseleave',function(){isDragging=false;});
  nav.addEventListener('touchstart',function(e){dragGlow(e.touches[0]);},{passive:true});
  nav.addEventListener('touchmove',function(e){dragGlow(e.touches[0]);},{passive:true});

  function dragGlow(e){
    var navRect=nav.getBoundingClientRect();
    var x=e.clientX-navRect.left-28;
    x=Math.max(0,Math.min(x,navRect.width-56));
    glow.style.left=x+'px';
    glow.style.opacity='1';
    glow.style.transition='left 0.1s ease, opacity 0.3s ease';

    var closest=null;var closestDist=Infinity;
    tabs.forEach(function(tab,i){
      var tabRect=tab.getBoundingClientRect();
      var tabCenter=tabRect.left-navRect.left+tabRect.width/2;
      var dist=Math.abs((x+28)-tabCenter);
      if(dist<closestDist){closestDist=dist;closest=i;}
    });
    if(closest!==null&&closestDist<40){
      activateTab(closest);
    }
  }

  // ── User login state ──
  function checkUser(){
    try{
      var user=JSON.parse(localStorage.getItem('arcUser')||'null');
      var label=document.getElementById('arcUserLabel');
      var icon=document.querySelector('.arc-user-icon');
      var userTab=document.getElementById('arcUserTab');
      if(user&&user.email){
        label.textContent=user.email.split('@')[0];
        userTab.href='#';
        userTab.onclick=function(e){
          e.preventDefault();
          if(confirm('Log out?')){
            localStorage.removeItem('arcUser');
            location.reload();
          }
        };
      }else{
        label.textContent='Log In';
        userTab.href='login.html';
        userTab.onclick=null;
      }
    }catch(e){}
  }
  checkUser();

  // ── Cart badge ──
  function updateCartBadge(){
    try{
      var cart=JSON.parse(localStorage.getItem('arcCart')||'[]');
      var badge=document.getElementById('arcCartBadge');
      if(cart.length>0){
        badge.textContent=cart.length;
        badge.style.display='flex';
      }else{
        badge.style.display='none';
      }
    }catch(e){}
  }
  updateCartBadge();
  window.addEventListener('storage',updateCartBadge);
  setInterval(updateCartBadge,1000);
})();