(function(){
  var c=document.getElementById('arcCanvas');
  if(!c)return;
  var ctx=c.getContext('2d');
  var N=80,DIST=150,stars=[],mouse={x:null,y:null};

  function resize(){c.width=window.innerWidth;c.height=window.innerHeight;}
  function rv(){return(Math.random()-0.5)*0.5;}
  function mk(){return{x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.2+0.3,vx:rv(),vy:rv(),hue:Math.random()>0.5?270:170};}
  function init(){stars=[];for(var i=0;i<N;i++)stars.push(mk());}
  function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}

  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    ctx.globalCompositeOperation='lighter';

    for(var i=0;i<N;i++){
      var s=stars[i];
      ctx.beginPath();
      ctx.fillStyle='hsla('+s.hue+',60%,75%,0.8)';
      ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fill();
    }

    ctx.beginPath();
    for(var i=0;i<N;i++){
      for(var j=i+1;j<N;j++){
        var d=dist(stars[i],stars[j]);
        if(d<=DIST){
          var o=1-d/DIST;
          ctx.strokeStyle='rgba(168,85,247,'+(o*0.2)+')';
          ctx.moveTo(stars[i].x,stars[i].y);
          ctx.lineTo(stars[j].x,stars[j].y);
        }
      }
      if(mouse.x!==null){
        var d=dist(stars[i],mouse);
        if(d<=DIST*1.2){
          var o=1-d/(DIST*1.2);
          ctx.strokeStyle='rgba(94,234,212,'+(o*0.3)+')';
          ctx.moveTo(stars[i].x,stars[i].y);
          ctx.lineTo(mouse.x,mouse.y);
        }
      }
    }
    ctx.lineWidth=0.5;
    ctx.stroke();
  }

  function update(){
    for(var i=0;i<N;i++){
      var s=stars[i];
      s.x+=s.vx;s.y+=s.vy;
      if(s.x<=0||s.x>=c.width)s.vx*=-1;
      if(s.y<=0||s.y>=c.height)s.vy*=-1;
    }
  }

  function loop(){draw();update();requestAnimationFrame(loop);}

  resize();init();loop();

  window.addEventListener('resize',function(){resize();init();});
  c.addEventListener('mousemove',function(e){mouse.x=e.clientX;mouse.y=e.clientY;});
  c.addEventListener('mouseleave',function(){mouse.x=null;mouse.y=null;});
})();