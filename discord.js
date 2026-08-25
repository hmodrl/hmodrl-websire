<script>
function showBoosts(type, btnElem){

    document.getElementById("month1").style.display = "none";
    document.getElementById("month3").style.display = "none";

    document.getElementById(type).style.display = "grid";

    document.querySelectorAll(".boost-tab").forEach(btn=>{
        btn.classList.remove("active");
    });

    if(btnElem) btnElem.classList.add("active");
}
</script>
<script>
document.addEventListener('DOMContentLoaded', function(){
    var sections=document.querySelectorAll('.section-title');
    var cards=document.querySelectorAll('.card');
    var boostCards=document.querySelectorAll('.boost-card');
    var boostBtns=document.querySelector('.boost-buttons');
    var accountsBox=document.querySelector('.accounts-box');
    var footer=document.querySelector('footer');

    function staggerReveal(els,delay){
        els.forEach(function(el,i){
            el.style.transitionDelay=(i*delay)+'s';
            el.classList.add('reveal');
        });
    }

    staggerReveal(sections,0);
    staggerReveal(cards,0.08);
    staggerReveal(boostCards,0.08);
    if(boostBtns)boostBtns.classList.add('reveal');
    if(accountsBox)accountsBox.classList.add('reveal');
    if(footer)footer.classList.add('reveal');

    var io=new IntersectionObserver(function(entries,obs){
        entries.forEach(function(entry){
            if(entry.isIntersecting){
                entry.target.classList.add('active','visible');
                obs.unobserve(entry.target);
            }
        });
    },{threshold:0.08});

    document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});

    var boostObserver=new IntersectionObserver(function(entries,obs){
        entries.forEach(function(entry){
            if(entry.isIntersecting){
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    },{threshold:0.1});

    boostCards.forEach(function(c){boostObserver.observe(c);});
});
</script>