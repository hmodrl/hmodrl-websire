  <script>
    // Luxurious proximity animation for buttons
    (function(){
      const buttons = document.querySelectorAll('#exploreBtn, #contactBtn');
      const proximityDistance = 120;

      document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        buttons.forEach(button => {
          const rect = button.getBoundingClientRect();
          const buttonCenterX = rect.left + rect.width / 2;
          const buttonCenterY = rect.top + rect.height / 2;

          const distance = Math.sqrt(
            Math.pow(mouseX - buttonCenterX, 2) + 
            Math.pow(mouseY - buttonCenterY, 2)
          );

          if(distance < proximityDistance){
            button.classList.add('proximity-active');
            
            // Update glow position based on mouse
            const angle = Math.atan2(mouseY - buttonCenterY, mouseX - buttonCenterX);
            const glowX = Math.cos(angle) * (proximityDistance - distance) * 0.8;
            const glowY = Math.sin(angle) * (proximityDistance - distance) * 0.8;
            
            button.style.setProperty('--glow-x', glowX + 'px');
            button.style.setProperty('--glow-y', glowY + 'px');
          } else {
            button.classList.remove('proximity-active');
          }
        });
      });
    })();

    // Scroll reveal animations
    (function(){
      var targets=document.querySelectorAll('.section-title,.section-subtitle,.card,.about p,.contact-item,.contact-note,footer');
      var observer=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('visible');
          }
        });
      },{threshold:0.15,rootMargin:'0px 0px -40px 0px'});
      targets.forEach(function(el){observer.observe(el);});
    })();
  </script>