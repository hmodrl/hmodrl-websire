  <script>
    (function(){
      var body=document.body;
      emailjs.init('TBMyuXqKYB7PQBpqM');
      var EMAILJS_SERVICE='service_2g1qfsi';
      var EMAILJS_TEMPLATE='template_9d4ncci';

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

      var params=new URLSearchParams(window.location.search);
      var authCode=params.get('code');
      if(authCode){
        localStorage.setItem('aerialarc_google_code',authCode);
        localStorage.setItem('aerialarc_login_method','google');
        window.history.replaceState({},document.title,window.location.pathname);
        showMsg('Signed in with Google! Redirecting...',false);
        setTimeout(function(){body.classList.add('exiting');setTimeout(function(){window.location.href='index.html';},400);},1000);
      }

      var pendingCode='';
      var pendingEmail='';
      var resendInterval;

      function showMsg(msg,isError){
        var el=document.getElementById('errorMsg');
        el.textContent=msg;
        el.style.background=isError?'rgba(239,68,68,0.1)':'rgba(34,197,94,0.1)';
        el.style.borderColor=isError?'rgba(239,68,68,0.2)':'rgba(34,197,94,0.2)';
        el.style.color=isError?'#ef4444':'#22c55e';
        el.classList.add('show');
      }
      function clearMsg(){document.getElementById('errorMsg').classList.remove('show');}

      function goToStep(n){
        document.querySelectorAll('.step').forEach(function(s){s.classList.remove('active');});
        document.getElementById('step'+n).classList.add('active');
        if(n===2){
          document.getElementById('cardTitle').textContent='Verify Your Email';
          document.getElementById('cardSubtitle').textContent='Enter the code we sent you';
          setTimeout(function(){document.querySelector('#step2 .code-inputs input').focus();},100);
        }else{
          document.getElementById('cardTitle').textContent='Welcome Back';
          document.getElementById('cardSubtitle').textContent='Log in to your AERIALARC account';
        }
      }

      function generateCode(){
        return String(Math.floor(100000+Math.random()*900000));
      }

      function sendCode(email,cb){
        pendingCode=generateCode();
        pendingEmail=email;
        var params={to_email:email,code:pendingCode,from_name:'AERIALARC'};
        emailjs.send(EMAILJS_SERVICE,EMAILJS_TEMPLATE,params).then(function(){
          if(cb)cb();
        },function(err){
          showMsg('Failed to send code. Please try again.',true);
        });
      }

      function startResendTimer(){
        var btn=document.getElementById('resendBtn');
        var timer=document.getElementById('resendTimer');
        btn.style.display='none';
        var sec=60;
        timer.textContent='Resend in '+sec+'s';
        clearInterval(resendInterval);
        resendInterval=setInterval(function(){
          sec--;
          if(sec<=0){
            clearInterval(resendInterval);
            timer.textContent='';
            btn.style.display='inline';
          }else{
            timer.textContent='Resend in '+sec+'s';
          }
        },1000);
      }

      var form=document.getElementById('loginForm');
      var loginBtn=document.getElementById('loginBtn');

      form.addEventListener('submit',function(e){
        e.preventDefault();
        clearMsg();
        var email=document.getElementById('email').value.trim();
        var pass=document.getElementById('password').value;
        if(!email||!pass){showMsg('Please fill in all fields.',true);return;}
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){showMsg('Please enter a valid email address.',true);return;}
        if(pass.length<6){showMsg('Password must be at least 6 characters.',true);return;}

        loginBtn.classList.add('loading');
        loginBtn.disabled=true;

        sendCode(email,function(){
          loginBtn.classList.remove('loading');
          loginBtn.disabled=false;
          document.getElementById('codeEmailDisplay').textContent=email;
          goToStep(2);
          startResendTimer();
          clearMsg();
        });
      });

      document.getElementById('resendBtn').addEventListener('click',function(){
        sendCode(pendingEmail,function(){
          startResendTimer();
          showMsg('Code resent!',false);
          setTimeout(clearMsg,2000);
        });
      });

      document.getElementById('backBtn').addEventListener('click',function(){
        goToStep(1);
        clearMsg();
        clearInterval(resendInterval);
      });

      var codeInputs=document.querySelectorAll('#codeInputs input');
      codeInputs.forEach(function(inp,idx){
        inp.addEventListener('input',function(e){
          var val=e.target.value.replace(/[^0-9]/g,'');
          e.target.value=val;
          if(val){
            e.target.classList.add('filled');
            if(idx<5)codeInputs[idx+1].focus();
          }else{
            e.target.classList.remove('filled');
          }
          checkCodeComplete();
        });
        inp.addEventListener('keydown',function(e){
          if(e.key==='Backspace'&&!e.target.value&&idx>0){
            codeInputs[idx-1].focus();
            codeInputs[idx-1].value='';
            codeInputs[idx-1].classList.remove('filled');
          }
        });
        inp.addEventListener('paste',function(e){
          e.preventDefault();
          var paste=(e.clipboardData||window.clipboardData).getData('text').replace(/[^0-9]/g,'').substring(0,6);
          for(var i=0;i<paste.length&&i<6;i++){
            codeInputs[i].value=paste[i];
            codeInputs[i].classList.add('filled');
          }
          if(paste.length>0)codeInputs[Math.min(paste.length,5)].focus();
          checkCodeComplete();
        });
      });

      function getCode(){
        var c='';
        codeInputs.forEach(function(inp){c+=inp.value;});
        return c;
      }

      function checkCodeComplete(){
        if(getCode().length===6){
          document.getElementById('verifyBtn').click();
        }
      }

      document.getElementById('verifyBtn').addEventListener('click',function(){
        clearMsg();
        var entered=getCode();
        if(entered.length<6){showMsg('Please enter the full 6-digit code.',true);return;}
        if(entered!==pendingCode){showMsg('Incorrect code. Please try again.',true);codeInputs.forEach(function(i){i.value='';i.classList.remove('filled');});codeInputs[0].focus();return;}

        var email=pendingEmail;
        var pass=document.getElementById('password').value;
        var users=JSON.parse(localStorage.getItem('aerialarc_users')||'{}');
        users[email]=pass;
        localStorage.setItem('aerialarc_users',JSON.stringify(users));
        localStorage.setItem('aerialarc_current_user',email);
        localStorage.setItem('aerialarc_verified','true');
        showMsg('Verified! Redirecting...',false);
        setTimeout(function(){body.classList.add('exiting');setTimeout(function(){window.location.href='index.html';},400);},800);
      });

      document.getElementById('googleBtn').addEventListener('click',function(){
        var GOOGLE_CLIENT_ID='441965061955-tmnd4hhl0npdldf6l4g1vrfvrnik9hsp.apps.googleusercontent.com';
        var REDIRECT_URI='https://aerialarc.net/login.html';
        window.location.href='https://accounts.google.com/o/oauth2/v2/auth'
          +'?client_id='+encodeURIComponent(GOOGLE_CLIENT_ID)
          +'&redirect_uri='+encodeURIComponent(REDIRECT_URI)
          +'&response_type=code'
          +'&scope='+encodeURIComponent('openid email profile')
          +'&access_type=offline'
          +'&prompt=select_account';
      });
    })();
  </script>