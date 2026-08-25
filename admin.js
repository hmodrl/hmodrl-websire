  <script>
  (function(){
    var EMP_KEY='aerialarc_employees';
    var ORD_KEY='aerialarc_orders';
    var SESS_KEY='aerialarc_admin_session';

    // Default admin
    var OWNER_EMAIL='mohammedfortrade777@gmail.com';
    function isOwner(){return localStorage.getItem(SESS_KEY)===OWNER_EMAIL;}
    function getEmployees(){
      var defaults=[{email:'mohammedfortrade777@gmail.com',pass:'00112233Ff#',first:'Mohammed',last:'Hassan'}];
      var raw=localStorage.getItem(EMP_KEY);
      if(!raw){
        localStorage.setItem(EMP_KEY,JSON.stringify(defaults));
        return defaults;
      }
      var list=JSON.parse(raw);
      var hasOwner=list.some(function(e){return e.email.toLowerCase()===OWNER_EMAIL.toLowerCase();});
      if(!hasOwner){
        list.push(defaults[0]);
        localStorage.setItem(EMP_KEY,JSON.stringify(list));
      }
      return list;
    }

    function saveEmployees(list){localStorage.setItem(EMP_KEY,JSON.stringify(list));}
    function getOrders(){try{return JSON.parse(localStorage.getItem(ORD_KEY)||'[]');}catch(e){return[];}}
    function saveOrders(list){localStorage.setItem(ORD_KEY,JSON.stringify(list));}

    // Theme
    var body=document.body;
    var lightBtn=document.getElementById('lightModeBtn');
    var darkBtn=document.getElementById('darkModeBtn');
    var logo=document.querySelector('.logo-img');
    function setTheme(dark){
      if(dark){body.classList.add('dark-mode');if(logo)logo.src='aerialarc.png';}
      else{body.classList.remove('dark-mode');if(logo)logo.src='aerialarc2.png';}
    }
    lightBtn.addEventListener('click',function(){setTheme(false);localStorage.setItem('aerialarc_theme','light');});
    darkBtn.addEventListener('click',function(){setTheme(true);localStorage.setItem('aerialarc_theme','dark');});
    var saved=localStorage.getItem('aerialarc_theme');
    setTheme(saved!=='light');

    // Login
    var loginOverlay=document.getElementById('loginOverlay');
    var dashboard=document.getElementById('dashboard');
    var loginError=document.getElementById('loginError');
    var logoutBtn=document.getElementById('logoutBtn');
    var loggedUser=localStorage.getItem(SESS_KEY);

    function showDashboard(name){
      loginOverlay.classList.add('hidden');
      dashboard.style.display='block';
      logoutBtn.style.display='inline-flex';
      if(name){
        var nameEl=document.getElementById('adminName');
        if(nameEl)nameEl.textContent=name;
      }
    }
    function showLogin(){loginOverlay.classList.remove('hidden');dashboard.style.display='none';logoutBtn.style.display='none';var n=document.getElementById('adminName');if(n)n.textContent='';}

    if(loggedUser){
      var emps=getEmployees();
      var me=emps.find(function(e){return e.email.toLowerCase()===loggedUser.toLowerCase();});
      showDashboard(me?(me.first+' '+me.last):'');
    }

    document.getElementById('loginBtn').addEventListener('click',function(){
      var email=document.getElementById('loginEmail').value.trim().toLowerCase();
      var pass=document.getElementById('loginPass').value;
      var emps=getEmployees();
      var found=emps.find(function(e){return e.email.toLowerCase()===email&&e.pass===pass;});
      if(found){
        localStorage.setItem(SESS_KEY,email);
        loginError.classList.remove('show');
        showDashboard((found.first||'')+' '+(found.last||''));
        renderAll();
      }else{
        loginError.classList.add('show');
      }
    });

    document.getElementById('loginPass').addEventListener('keydown',function(e){
      if(e.key==='Enter')document.getElementById('loginBtn').click();
    });

    logoutBtn.addEventListener('click',function(){
      localStorage.removeItem(SESS_KEY);
      showLogin();
    });

    // Tabs
    document.querySelectorAll('.tab').forEach(function(tab){
      tab.addEventListener('click',function(){
        document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
        document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('active');});
        tab.classList.add('active');
        document.getElementById('panel-'+tab.dataset.tab).classList.add('active');
      });
    });

    // Orders
    function updateOrderStatus(orderId,newStatus){
      var orders=getOrders();
      orders.forEach(function(o){if(o.id===orderId)o.status=newStatus;});
      saveOrders(orders);
      renderAll();
    }

    function renderOrders(filter){
      var orders=getOrders();
      var list=document.getElementById('orderList');
      if(!orders.length){list.innerHTML='<div class="empty"><h3>No orders yet</h3><p>Orders will appear here when customers complete checkout.</p></div>';return;}
      if(filter){
        var f=filter.toLowerCase();
        orders=orders.filter(function(o){
          return (o.id||'').toLowerCase().includes(f)||(o.customer||'').toLowerCase().includes(f)||(o.items||'').toLowerCase().includes(f)||(o.meta||'').toLowerCase().includes(f);
        });
      }
      orders.sort(function(a,b){return (b.timestamp||0)-(a.timestamp||0);});
      var owner=isOwner();
      var html='';
      orders.forEach(function(o){
        var t=o.timestamp?new Date(o.timestamp):new Date();
        var timeStr=t.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})+' '+t.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
        var status=o.status||'pending';
        html+='<div class="order-card">';
        html+='<div class="order-info">';
        html+='<div class="order-name">'+(o.id||'N/A')+'</div>';
        html+='<div class="order-meta">'+(o.customer||'Guest')+' &bull; '+(o.items||'Unknown item')+'</div>';
        if(o.meta)html+='<div class="order-meta" style="margin-top:2px;">'+o.meta+'</div>';
        html+='</div>';
        html+='<div class="order-right">';
        html+='<div class="order-price">$'+Number(o.total||0).toFixed(2)+'</div>';
        html+='<div class="order-time">'+timeStr+'</div>';
        html+='<div class="order-status '+status+'">'+status.charAt(0).toUpperCase()+status.slice(1)+'</div>';
        html+='<div class="order-actions" style="margin-top:8px;display:flex;gap:6px;justify-content:flex-end;">';
        if(status==='pending'){
          html+='<button class="order-btn done-btn" data-id="'+o.id+'">Done</button>';
        }
        if(status==='done'&&owner){
          html+='<button class="order-btn approve-btn" data-id="'+o.id+'">Approve</button>';
          html+='<button class="order-btn return-btn" data-id="'+o.id+'">Return</button>';
        }
        html+='</div>';
        html+='</div></div>';
      });
      list.innerHTML=html;

      list.querySelectorAll('.done-btn').forEach(function(btn){
        btn.addEventListener('click',function(){updateOrderStatus(btn.dataset.id,'done');});
      });
      list.querySelectorAll('.approve-btn').forEach(function(btn){
        btn.addEventListener('click',function(){updateOrderStatus(btn.dataset.id,'completed');});
      });
      list.querySelectorAll('.return-btn').forEach(function(btn){
        btn.addEventListener('click',function(){updateOrderStatus(btn.dataset.id,'pending');});
      });
    }

    function renderStats(){
      var orders=getOrders();
      var total=orders.length;
      var pending=orders.filter(function(o){return o.status==='pending';}).length;
      var completed=orders.filter(function(o){return o.status==='completed';}).length;
      var revenue=orders.filter(function(o){return o.status!=='cancelled';}).reduce(function(s,o){return s+Number(o.total||0);},0);
      document.getElementById('statTotal').textContent=total;
      document.getElementById('statPending').textContent=pending;
      document.getElementById('statCompleted').textContent=completed;
      document.getElementById('statRevenue').textContent='$'+revenue.toFixed(2);
    }

    document.getElementById('searchBar').addEventListener('input',function(){renderOrders(this.value);});

    // Employees
    function renderEmployees(){
      var emps=getEmployees();
      var list=document.getElementById('empList');
      var owner=isOwner();
      var html='';
      emps.forEach(function(e){
        var name=(e.first||'')+' '+(e.last||'');
        var isOwn=e.email.toLowerCase()===OWNER_EMAIL.toLowerCase();
        html+='<div class="emp-row"><span class="emp-email">'+name.trim()+'</span>';
        if(owner&&!isOwn){
          html+='<button class="emp-del" data-email="'+e.email+'">Remove</button>';
        }
        html+='</div>';
      });
      list.innerHTML=html;
      list.querySelectorAll('.emp-del').forEach(function(btn){
        btn.addEventListener('click',function(){
          if(!isOwner())return;
          var emps=getEmployees().filter(function(e){return e.email!==btn.dataset.email;});
          saveEmployees(emps);
          renderEmployees();
        });
      });
    }

    document.getElementById('addEmpBtn').addEventListener('click',function(){
      if(!isOwner())return;
      var first=document.getElementById('newEmpFirst').value.trim();
      var last=document.getElementById('newEmpLast').value.trim();
      var email=document.getElementById('newEmpEmail').value.trim();
      var pass=document.getElementById('newEmpPass').value;
      if(!email||!pass||!first)return;
      var emps=getEmployees();
      if(emps.find(function(e){return e.email.toLowerCase()===email.toLowerCase();})){return;}
      emps.push({email:email,pass:pass,first:first,last:last});
      saveEmployees(emps);
      document.getElementById('newEmpFirst').value='';
      document.getElementById('newEmpLast').value='';
      document.getElementById('newEmpEmail').value='';
      document.getElementById('newEmpPass').value='';
      renderEmployees();
    });

    function renderAll(){renderStats();renderOrders();renderEmployees();}
    renderAll();

    // Notification sound for new orders
    function playNotif(){
      try{
        var ctx=new(window.AudioContext||window.webkitAudioContext)();
        var o=ctx.createOscillator();
        var g=ctx.createGain();
        o.connect(g);g.connect(ctx.destination);
        o.type='sine';
        o.frequency.setValueAtTime(880,ctx.currentTime);
        o.frequency.setValueAtTime(1100,ctx.currentTime+0.1);
        o.frequency.setValueAtTime(880,ctx.currentTime+0.2);
        g.gain.setValueAtTime(0.3,ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.5);
        o.start(ctx.currentTime);o.stop(ctx.currentTime+0.5);
      }catch(e){}
    }

    // Poll for changes every 5 seconds
    var lastSnapshot=JSON.stringify(getOrders());
    setInterval(function(){
      var current=JSON.stringify(getOrders());
      if(current!==lastSnapshot){
        playNotif();
        renderAll();
        lastSnapshot=current;
      }
    },5000);
  })();
  </script>