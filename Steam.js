<script>
(function () {
    

    const state = {
        family: "no",
        epic: "no",
        legacy: "no"
    };

    const optionButtons = document.querySelectorAll(".option-card");
    const priceEl = document.getElementById("price");
    const titleEl = document.getElementById("selectionTitle");
    const noteEl = document.getElementById("selectionNote");

    const priceMatrix = {
        "yes:no:yes": 35,
        "no:no:yes": 150,
        "yes:yes:yes": 27,
        "no:yes:yes": null,
        "yes:no:no": null,
        "no:no:no": 133,
        "no:yes:no": 105,
        "yes:yes:no": null
    };

    function update() {
        const family = state.family === "yes";
        const epic = state.epic === "yes";
        const legacy = state.legacy === "yes";

        const price = priceMatrix[`${state.family}:${state.epic}:${state.legacy}`];

        const familyLabel = family ? "Family Share" : "No Family Share";
        const epicLabel = epic ? "Epic Linked" : "Not Linked";
        const legacyLabel = legacy ? "Legacy Items" : "Standard Inventory";

        titleEl.textContent = `${familyLabel} · ${epicLabel} · ${legacyLabel}`;
        if (price === null) { window.aaUpdatePrice(priceEl, null, "N/A"); }
        else { window.aaUpdatePrice(priceEl, price); }

        noteEl.textContent =
            "Indicative marketplace pricing. Actual value depends on inventory quality, account history and exact contents.";
    }

    function buySteamAccount() {
        const family = state.family === "yes";
        const epic = state.epic === "yes";
        const legacy = state.legacy === "yes";
        const price = priceMatrix[`${state.family}:${state.epic}:${state.legacy}`];

        window.Basket.add(
            "Steam Rocket League Account",
            price,
            `${family ? "Family Share" : "No Family Share"} · ${epic ? "Epic Linked" : "Not Linked"} · ${legacy ? "Legacy Items" : "Standard Inventory"}`
        );
    }

    window.buySteamAccount = buySteamAccount;

    optionButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const group = button.dataset.group;
            const value = button.dataset.value;

            document
                .querySelectorAll(`.option-card[data-group="${group}"]`)
                .forEach((item) => item.classList.remove("active"));

            button.classList.add("active");
            state[group] = value;
            update();
        });
    });

    update();
})();
</script>