<script>
(function () {
    

    const buttons = document.querySelectorAll("#platforms .mode");
    const status = document.getElementById("platformStatus");
    const emptyMessage = document.getElementById("emptyMessage");

    const labels = {
        all: "all platforms",
        playstation: "PlayStation",
        epic: "Epic Games",
        steam: "Steam",
        xbox: "Xbox",
        switch: "Nintendo Switch"
    };

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            buttons.forEach((item) => item.classList.remove("active"));
            button.classList.add("active");

            const key = button.dataset.platform;

            if (key === "all") {
                status.textContent = "Showing accounts from all platforms.";
                emptyMessage.textContent =
                    "There are currently no rare Rocket League accounts listed for sale. Check back later for new listings.";
            } else {
                status.textContent = `Showing ${labels[key]} accounts.`;
                emptyMessage.textContent =
                    `There are currently no rare Rocket League accounts listed for sale on ${labels[key]}. Check back later for new listings.`;
            }
        });
    });
})();
</script>