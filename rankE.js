<script>
    

    let selectedMode = "rumble";

    /*
      Extra Modes pricing is positioned as a market-friendly premium over
      standard playlists. Rumble/Hoops/Snow Day use a ~20% premium;
      Dropshot/Heatseeker use a ~30% premium, reflecting current competitor
      pricing structures for extra/niche playlists.
    */
    const prices = {

        "rumble": [
            9.60,
            12.00,
            16.80,
            24.00,
            36.00,
            66.00,
            102.00
        ],

        "hoops": [
            9.60,
            12.00,
            16.80,
            24.00,
            36.00,
            66.00,
            102.00
        ],

        "snowday": [
            9.60,
            12.00,
            16.80,
            24.00,
            36.00,
            66.00,
            102.00
        ],

        "dropshot": [
            10.40,
            13.00,
            18.20,
            26.00,
            39.00,
            72.00,
            111.00
        ],

        "heatseeker": [
            10.40,
            13.00,
            18.20,
            26.00,
            39.00,
            72.00,
            111.00
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
            `Extra Modes Boosting (${selectedMode})`,
            total,
            route
        );

    }


    updatePrice();

</script>