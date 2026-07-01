const grid = document.getElementById("propGrid");
const cards = [...document.querySelectorAll(".nq-card")];

const searchInput = document.getElementById("searchInput");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");
const sortSelect = document.getElementById("sortSelect");

const regionFilter = document.getElementById("f-region");
const priceFilter = document.getElementById("f-price");
const statusFilter = document.getElementById("f-status");
const roomsFilter = document.getElementById("f-rooms");
const floorsFilter = document.getElementById("f-floors");

const applyBtn = document.getElementById("applyFilters");
const resetBtn = document.getElementById("resetFilters");
const emptyResetBtn = document.getElementById("emptyResetBtn");

applyBtn?.addEventListener("click", filterCards);
resetBtn?.addEventListener("click", resetFilters);
emptyResetBtn?.addEventListener("click", resetFilters);

searchInput?.addEventListener("input", filterCards);

[
    regionFilter,
    priceFilter,
    statusFilter,
    roomsFilter,
    floorsFilter,
    sortSelect
].forEach(el => {
    el?.addEventListener("change", filterCards);
});

function filterCards() {

    const search = searchInput.value.trim().toLowerCase();
    const region = regionFilter.value;
    const price = priceFilter.value;
    const status = statusFilter.value;
    const rooms = roomsFilter.value;
    const floors = floorsFilter.value;

    let visibleCount = 0;

    cards.forEach(card => {

        const name = (card.dataset.name || "").toLowerCase();
        const cardRegion = (card.dataset.region || "").toLowerCase();
        const cardType = (card.dataset.type || "").toLowerCase();
        const employee = (card.dataset.employee || "").toLowerCase();

        const cardPrice = Number(card.dataset.price || 0);
        const cardStatus = card.dataset.status || "";
        const cardRooms = Number(card.dataset.rooms || 0);
        const cardFloors = Number(card.dataset.floors || 0);

        let show = true;

        if (search) {

            const searchableText = `
                ${name}
                ${cardRegion}
                ${cardType}
                ${employee}
                ${cardPrice}
                ${cardRooms}
                ${cardFloors}
                ${cardStatus}
            `.toLowerCase();

            if (!searchableText.includes(search)) {
                show = false;
            }
        }

        if (region && card.dataset.region !== region)
            show = false;

        if (status && cardStatus !== status)
            show = false;

        if (rooms) {

            if (rooms === "5") {
                if (cardRooms < 5) show = false;
            } else {
                if (cardRooms !== Number(rooms))
                    show = false;
            }
        }

        if (floors) {

            if (floors === "4") {
                if (cardFloors < 4) show = false;
            } else {
                if (cardFloors !== Number(floors))
                    show = false;
            }
        }

        if (price) {

            const [min, max] = price
                .split("-")
                .map(Number);

            if (
                cardPrice < min ||
                cardPrice > max
            ) {
                show = false;
            }
        }

        card.style.display = show ? "" : "none";

        if (show) visibleCount++;
    });

    sortCards();
    updateResults(visibleCount);
}

function sortCards() {

    const value = sortSelect.value;

    const visibleCards = cards.filter(
        card => card.style.display !== "none"
    );

    visibleCards.sort((a, b) => {

        switch (value) {

            case "price-asc":
                return Number(a.dataset.price || 0) -
                    Number(b.dataset.price || 0);

            case "price-desc":
                return Number(b.dataset.price || 0) -
                    Number(a.dataset.price || 0);

            case "location-asc":
                return (a.dataset.region || "")
                    .localeCompare(
                        b.dataset.region || "",
                        "ar"
                    );

            case "location-desc":
                return (b.dataset.region || "")
                    .localeCompare(
                        a.dataset.region || "",
                        "ar"
                    );

            case "name-asc":
                return (a.dataset.name || "")
                    .localeCompare(
                        b.dataset.name || "",
                        "ar"
                    );

            case "name-desc":
                return (b.dataset.name || "")
                    .localeCompare(
                        a.dataset.name || "",
                        "ar"
                    );

            default:
                return 0;
        }
    });

    visibleCards.forEach(card => {
        grid.appendChild(card);
    });
}

function updateResults(count) {

    if (resultsCount)
        resultsCount.textContent = count;

    if (emptyState) {

        if (count === 0) {
            emptyState.classList.remove("d-none");
        } else {
            emptyState.classList.add("d-none");
        }
    }

    updateFilterBadge();
}

function updateFilterBadge() {

    let active = 0;

    if (regionFilter.value) active++;
    if (priceFilter.value) active++;
    if (statusFilter.value) active++;
    if (roomsFilter.value) active++;
    if (floorsFilter.value) active++;

    const badge =
        document.getElementById(
            "activeFilterCount"
        );

    if (badge) {
        badge.textContent = active;
    }
}

function resetFilters() {

    searchInput.value = "";

    regionFilter.value = "";
    priceFilter.value = "";
    statusFilter.value = "";
    roomsFilter.value = "";
    floorsFilter.value = "";

    sortSelect.value = "default";

    cards.forEach(card => {
        card.style.display = "";
    });

    updateResults(cards.length);
}

document.addEventListener("click", e => {

    if (
        !e.target.classList.contains(
            "property-preview"
        )
    ) return;

    const modalImage =
        document.getElementById(
            "modalImage"
        );

    if (modalImage) {
        modalImage.src = e.target.src;
        modalImage.alt = e.target.alt;
    }
});


filterCards();