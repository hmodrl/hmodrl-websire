<script>
(function(){
    var KEY="aerialarc_basket";
    function load(){try{var r=localStorage.getItem(KEY);return r?JSON.parse(r):[]}catch(e){return[]}}
    function save(items){try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}}
    function fmt(p){return p==null?"Price on request":"$"+Number(p).toFixed(2)}

    function render(){
        var items=load();
        var el=document.getElementById("basketContent");
        if(!items.length){
            el.innerHTML='<div class="empty-basket"><h2>Your cart is empty</h2><p>Add services to get started.</p><a href="index.html">Browse Services</a></div>';
            return;
        }
        var html='<div class="basket-grid"><div class="basket-items">';
        items.forEach(function(it,i){
            html+='<div class="basket-card" style="animation-delay:'+(i*0.06)+'s">';
            html+='<div class="basket-card-info">';
            html+='<div class="basket-card-title"></div>';
            html+='<div class="basket-card-meta"></div>';
            html+='</div>';
            html+='<div class="basket-card-right">';
            html+='<button class="basket-card-remove" data-i="'+i+'">&#10005;</button>';
            html+='<div class="basket-card-prices"><span class="basket-card-price"></span></div>';
            html+='</div>';
            html+='</div>';
        });
        html+='</div>';
        var total=items.reduce(function(s,it){return s+(Number(it.price)||0)},0);
        html+='<div class="basket-summary">';
        html+='<div class="summary-card">';
        html+='<div class="summary-title">Order Summary</div>';
        html+='<div class="discount-row"><input class="discount-input" placeholder="Enter discount code"><button class="discount-btn">Apply</button></div>';
        html+='<div class="summary-rows">';
        html+='<div class="summary-row"><span class="label">Subtotal ('+items.length+' item'+(items.length>1?'s':'')+')</span><span class="value" id="subTotal"></span></div>';
        html+='</div>';
        html+='<div class="summary-total"><span class="label">Total</span><span class="value" id="sumTotal"></span></div>';
        html+='<button class="checkout-btn" id="checkoutBtn">Complete Order</button>';
        html+='</div></div>';
        el.innerHTML=html;

        var cards=el.querySelectorAll(".basket-card");
        cards.forEach(function(card,i){
            card.querySelector(".basket-card-title").textContent=items[i].name;
            card.querySelector(".basket-card-meta").textContent=items[i].meta||"";
            card.querySelector(".basket-card-price").textContent=fmt(items[i].price);
        });
        document.getElementById("subTotal").textContent=fmt(total);
        document.getElementById("sumTotal").textContent=fmt(total);

        el.querySelectorAll(".basket-card-remove").forEach(function(btn){
            btn.addEventListener("click",function(){
                var idx=parseInt(btn.getAttribute("data-i"));
                var arr=load();arr.splice(idx,1);save(arr);render();
            });
        });

        document.getElementById("checkoutBtn").addEventListener("click",function(){
            if(!items.length)return;
            var user=null;
            try{user=JSON.parse(localStorage.getItem("arcUser")||"null")}catch(e){}
            if(!user||!user.email){
                window.location.href="login.html?redirect=basket.html";
                return;
            }
            var orderId="ARC-"+Math.random().toString(36).substring(2,8).toUpperCase();
            window._currentOrderId=orderId;
            var mItems=document.getElementById("modalItems");
            mItems.innerHTML="";
            var idRow=document.createElement("div");idRow.className="checkout-modal-item";
            idRow.innerHTML='<div><span class="nm" style="font-size:12px;color:#888;">Order ID</span></div><span class="pr" style="font-size:13px;font-weight:700;color:#a855f7;">'+orderId+'</span>';
            mItems.appendChild(idRow);
            items.forEach(function(it){
                var row=document.createElement("div");row.className="checkout-modal-item";
                row.innerHTML='<div><span class="nm"></span><span class="mt"></span></div><span class="pr"></span>';
                row.querySelector(".nm").textContent=it.name;
                row.querySelector(".mt").textContent=it.meta||"";
                row.querySelector(".pr").textContent=fmt(it.price);
                mItems.appendChild(row);
            });
            document.getElementById("modalTotal").textContent=fmt(total);
            var orderIdEl=document.getElementById("modalOrderId");
            orderIdEl.textContent="Order ID: "+orderId;
            orderIdEl.style.display="block";
            document.getElementById("checkoutOverlay").classList.add("open");
        });
    }

    document.getElementById("modalClose").addEventListener("click",function(){document.getElementById("checkoutOverlay").classList.remove("open")});
    document.getElementById("checkoutOverlay").addEventListener("click",function(e){if(e.target===this)this.classList.remove("open")});
    document.getElementById("modalNext").addEventListener("click",function(){
        document.querySelector('[data-step="review"]').classList.remove("active");
        document.querySelector('[data-step="ticket"]').classList.add("active");
    });
    document.getElementById("modalDone").addEventListener("click",function(){
        document.getElementById("checkoutOverlay").classList.remove("open");
    });

    // Save order when Discord link is clicked
    var discordLink=document.querySelector(".checkout-modal-discord");
    if(discordLink){
        discordLink.addEventListener("click",function(){
            var items=load();
            if(items.length&&window._currentOrderId){
                var user=localStorage.getItem("aerialarc_current_user")||"Guest";
                var names=items.map(function(it){return it.name;}).join(", ");
                var metas=items.map(function(it){return it.meta||"";}).filter(function(m){return m;}).join(" | ");
                var tot=items.reduce(function(s,it){return s+(Number(it.price)||0);},0);
                var orders=JSON.parse(localStorage.getItem("aerialarc_orders")||"[]");
                orders.push({
                    id:window._currentOrderId,
                    customer:user,
                    email:user,
                    items:names,
                    meta:metas,
                    total:tot,
                    status:"pending",
                    timestamp:Date.now()
                });
                localStorage.setItem("aerialarc_orders",JSON.stringify(orders));
                save([]);
                window._currentOrderId=null;
            }
        });
    }

    render();
})();
</script>