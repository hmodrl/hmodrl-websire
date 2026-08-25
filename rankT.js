<script>
    

    let selectedMode = "normal";
    let selectedRank = "champion";
    let selectedColor = "grey";

    const prices = {
        "normal": {
            "champion": 19.99,
            "gc": 34.99,
            "ssl": 54.99
        },
        "pentathlon": {
            "champion": 34.99,
            "gc": 59.99,
            "ssl": 89.99
        }
    };

    const rankLabels = {
        "champion": "Champion",
        "gc": "Grand Champion",
        "ssl": "Supersonic Legend"
    };

    const colorOptions = {
        "champion": [
            { value: "grey", label: "⚪ Grey" },
            { value: "green", label: "🟢 Green" }
        ],
        "gc": [
            { value: "grey", label: "⚪ Grey" },
            { value: "red", label: "🔴 Red" }
        ],
        "ssl": [
            { value: "white", label: "⚪ White" },
            { value: "pink", label: "🩷 Pink" }
        ]
    };

    const colorLabels = {
        "grey": "Grey",
        "green": "Green",
        "red": "Red",
        "white": "White",
        "pink": "Pink"
    };

    const modes = document.querySelectorAll(".mode");
    const rankBtns = document.querySelectorAll(".rank-btn");
    const titleLabel = document.getElementById("titleLabel");
    const titleColorsContainer = document.getElementById("titleColors");

    modes.forEach(mode => {
        mode.addEventListener("click", () => {
            modes.forEach(m => m.classList.remove("active"));
            mode.classList.add("active");
            selectedMode = mode.dataset.mode;
            updatePrice();
        });
    });

    rankBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            rankBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedRank = btn.dataset.rank;
            selectedColor = colorOptions[selectedRank][0].value;
            updateTitleColors();
            updatePrice();
        });
    });

    function updateTitleColors() {
        const colors = colorOptions[selectedRank];
        const rankLabel = rankLabels[selectedRank];
        
        titleLabel.textContent = `Select Title Color - ${rankLabel}`;
        
        titleColorsContainer.innerHTML = '';
        colors.forEach((color, index) => {
            const btn = document.createElement('button');
            btn.className = `color-btn ${index === 0 ? 'active' : ''}`;
            btn.textContent = color.label;
            btn.dataset.color = color.value;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedColor = color.value;
                updatePrice();
            });
            titleColorsContainer.appendChild(btn);
        });
    }

    function updatePrice() {
        const priceElement = document.getElementById("price");
        const routeElement = document.getElementById("route");

        const price = prices[selectedMode][selectedRank];
        const modeLabel = selectedMode === "normal" ? "Normal Tournament" : "Pentathlon Tournament";
        const rankLabel = rankLabels[selectedRank];
        const colorLabel = colorLabels[selectedColor];

        routeElement.textContent = `${modeLabel} - ${rankLabel} (${colorLabel})`;
        window.aaUpdatePrice(priceElement, price);
    }

    function orderBoost() {
        const price = prices[selectedMode][selectedRank];
        const mode = selectedMode === "normal" ? "Normal Tournament" : "Pentathlon Tournament";
        const rank = rankLabels[selectedRank];
        const color = colorLabels[selectedColor];

        window.Basket.add(
            mode + " Boosting",
            price,
            `${rank} (${color})`
        );
    }

    updatePrice();

</script>