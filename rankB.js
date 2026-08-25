<script>
    

    let selectedMode = "1v1";

    const prices = {

        "1v1": [
            8,
            10,
            14,
            20,
            30,
            55,
            85
        ],

        "2v2": [
            7,
            9,
            13,
            18,
            27,
            50,
            77
        ],

        "3v3": [
            10,
            12,
            17,
            24,
            36,
            66,
            102
        ],

        "4v4": [
            10,
            13,
            18,
            26,
            39,
            72,
            111
        ]

    };


    const ranks = [
        "Bronze",
        "Silver",
        "Gold",
        "Platinum",
        "Diamond",
        "Champion",
        "Grand Champion",
        "Supersonic Legend"
    ];


    const modes = document.querySelectorAll(".mode");

    modes.forEach(mode => {

        mode.addEventListener("click", () => {

            modes.forEach(m => m.classList.remove("active"));

            mode.classList.add("active");

            selectedMode = mode.dataset.mode;

            updatePrice();

        });

    });


    document
        .getElementById("currentRank")
        .addEventListener("change", updatePrice);


    document
        .getElementById("targetRank")
        .addEventListener("change", updatePrice);


    const TIERS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Champion", "Grand Champion"];

    const DIVS = ["I", "II", "III", "IV"];


    function rankLabel(i) {

        if (i === 0) return "Unranked";

        if (i >= 85) return "Supersonic Legend";

        const off = i - 1;

        const tier = Math.floor(off / 12);

        const sub = Math.floor((off % 12) / 4);

        const div = (off % 12) % 4;

        return TIERS[tier] + " " + DIVS[sub] + " · Div " + DIVS[div];

    }


    function pos(i) {

        if (i === 0 || i === 1) return 0;

        if (i >= 85) return 84;

        const off = i - 1;

        return Math.floor(off / 12) * 12 + (off % 12);

    }


    function segPrice(t) {

        const arr = prices[selectedMode];

        return arr[Math.min(Math.max(t, 0), arr.length - 1)];

    }


    function computeTotal(ci, ti) {

        const a = pos(ci);

        const b = pos(ti);

        const ta = Math.floor(a / 12);

        const tb = Math.floor(b / 12);

        const sa = a % 12;

        const sb = b % 12;

        let total = 0;

        for (let t = ta; t < tb; t++) {

            total += segPrice(t);

        }

        total -= sa * segPrice(ta) / 12;

        total += sb * segPrice(tb) / 12;

        return total;

    }


    function updatePrice() {

        const current =
            parseInt(document.getElementById("currentRank").value);

        const target =
            parseInt(document.getElementById("targetRank").value);


        const priceElement =
            document.getElementById("price");

        const routeElement =
            document.getElementById("route");


        if (target <= current) {

            window.aaUpdatePrice(priceElement, null);

            routeElement.textContent =
                "Choose a higher target rank";

            return;

        }


        const total = computeTotal(current, target);

        routeElement.textContent =
            `${rankLabel(current)} → ${rankLabel(target)}`;

        window.aaUpdatePrice(priceElement, total);

    }


    function orderBoost() {

        const current =
            parseInt(document.getElementById("currentRank").value);

        const target =
            parseInt(document.getElementById("targetRank").value);


        if (target <= current) {

            alert("Please select a higher target rank.");

            return;

        }


        const total = computeTotal(current, target);

        const route =
            `${rankLabel(current)} → ${rankLabel(target)}`;


        window.Basket.add(
            `Rank Boosting (${selectedMode})`,
            total,
            route
        );

    }


    updatePrice();

</script>