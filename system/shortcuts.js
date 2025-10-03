export function bindShortcuts() {
    const shortcuts = {
        search: localStorage.getItem("searchShortcut") || "Ctrl + /",
        favorite: localStorage.getItem("favoriteShortcut") || "Ctrl + Shift + F",
        settings: localStorage.getItem("settingsShortcut") || "Ctrl + Shift + X",
        history: localStorage.getItem("historyShortcut") || "Ctrl + Shift + H",
        images: localStorage.getItem("imagesShortcut") || "Ctrl + i",
        shopping: localStorage.getItem("shoppingShortcut") || "Ctrl + S",
        news: localStorage.getItem("newsShortcut") || "Ctrl + N",
        account: localStorage.getItem("accountShortcut") || "Ctrl + Shift + A",
        ai: localStorage.getItem("aiShortcut") || "Ctrl + Shift + I"
    };

    document.addEventListener("keydown", (e) => {
        const ctrl = e.ctrlKey ? "Ctrl + " : "";
        const shift = e.shiftKey ? "Shift + " : "";
        const keyCombo = `${ctrl}${shift}${e.key}`;

        if (keyCombo === shortcuts.search) {
            e.preventDefault();
            document.getElementById("searchInput").focus();
        } else if (keyCombo === shortcuts.favorite) {
            e.preventDefault();
            document.getElementById("addFavoriteModal").style.display = "block";
            document.getElementById("modalName").focus();
        } else if (keyCombo === shortcuts.settings) {
            e.preventDefault();
            document.getElementById("menuButton").click();
            document.querySelector(".tab-button[data-tab='settings']").click();
        } else if (keyCombo === shortcuts.history) {
            e.preventDefault();
            document.getElementById("menuButton").click();
            document.querySelector(".tab-button[data-tab='history']").click();
        } else if (keyCombo === shortcuts.images) {
            e.preventDefault();
            document.getElementById("searchImagesBtn").click();
        } else if (keyCombo === shortcuts.shopping) {
            e.preventDefault();
            document.getElementById("searchShoppingBtn").click();
        } else if (keyCombo === shortcuts.news) {
            e.preventDefault();
            document.getElementById("searchNewsBtn").click();
        } else if (keyCombo === shortcuts.account) {
            e.preventDefault();
            showAccountModal();
        } else if (keyCombo === shortcuts.ai) {
            e.preventDefault();
            document.getElementById("searchAIBtn").click();
        }
    });
}