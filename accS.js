<script>

var RANKS=[
    {name:'Bronze',price:4.99},
    {name:'Silver',price:5.99},
    {name:'Gold',price:6.99},
    {name:'Platinum',price:8.99},
    {name:'Diamond',price:11.99},
    {name:'Champion',price:17.99},
    {name:'Grand Champion',price:29.99},
    {name:'Supersonic Legend',price:49.99}
];

var STEAM_EXTRA=100;

var RANK_READY_EXTRA=5;

var rankSelect=document.getElementById('rankSelect');
var platformSelect=document.getElementById('platformSelect');
var typeSelect=document.getElementById('typeSelect');
var priceEl=document.getElementById('price');
var routeEl=document.getElementById('route');

function updatePrice(){
    var ri=Number(rankSelect.value);
    var platform=platformSelect.value;
    var type=typeSelect.value;
    var base=RANKS[ri].price;
    var total=base+(platform==='steam'?STEAM_EXTRA:0)+(type==='ready'?RANK_READY_EXTRA:0);
    var typeLabel=type==='ready'?'Rank Ready':'Not Rank Ready';
    routeEl.textContent=RANKS[ri].name+' \u2022 '+platformSelect.options[platformSelect.selectedIndex].text.replace(' (+$100)','')+' \u2022 '+typeLabel;
    window.aaUpdatePrice(priceEl,total);
}

rankSelect.addEventListener('change',updatePrice);
platformSelect.addEventListener('change',updatePrice);
typeSelect.addEventListener('change',updatePrice);

function orderAccount(){
    var ri=Number(rankSelect.value);
    var platform=platformSelect.value;
    var type=typeSelect.value;
    var base=RANKS[ri].price;
    var total=base+(platform==='steam'?STEAM_EXTRA:0)+(type==='ready'?RANK_READY_EXTRA:0);
    var typeLabel=type==='ready'?'Rank Ready':'Not Rank Ready';
    window.Basket.add(
        'Rocket League Smurf Account',
        total,
        RANKS[ri].name+' \u2022 '+platformSelect.options[platformSelect.selectedIndex].text.replace(' (+$100)','')+' \u2022 '+typeLabel
    );
}

updatePrice();
</script>