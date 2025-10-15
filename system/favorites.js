import { translations } from './language.js';

export function saveFavorites(favs) {
    try {
        localStorage.setItem("userFavorites", JSON.stringify(favs));
    } catch (e) {
        console.warn("Could not save favorites:", e);
    }
}

export function loadFavorites() {
    const cont = document.getElementById("favorites");
    cont.innerHTML = "";
    let favs = [];
    let maxFav = 5;
    let linkBehavior = "newTab";
    let lang = "tr";
    try {
        const storedFavs = localStorage.getItem("userFavorites");
        favs = storedFavs ? JSON.parse(storedFavs) : [];
        if (!Array.isArray(favs)) {
            favs = [];
            localStorage.setItem("userFavorites", "[]");
        }
        maxFav = parseInt(localStorage.getItem("maxFavorites") || "5");
        linkBehavior = localStorage.getItem("linkBehavior") || "newTab";
        lang = localStorage.getItem("language") || "tr";
    } catch (e) {
        localStorage.setItem("userFavorites", "[]");
    }

    favs.forEach((f, i) => {
        if (!f.url || !f.name) return;
        let faviconUrl = "ico/default-favicon.png";
        try {
            faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(f.url).hostname}`;
        } catch (e) {}

        const btn = document.createElement("div");
        btn.className = "favorite-item";
        btn.setAttribute("draggable", "true");
        btn.setAttribute("data-index", i);
        btn.innerHTML = `
            <div style="display:flex; flex-direction: column; align-items: center; gap:4px; text-align: center;">
                <img src="${faviconUrl}" style="width:32px;height:32px;border-radius:6px;" onerror="this.src='ico/default-favicon.png'">
                <a href="${f.url}" ${linkBehavior === "closeCurrent" ? "" : 'target="_blank"'}>${f.name}</a>
            </div>
        `;
        btn.addEventListener("dragstart", handleDragStart);
        btn.addEventListener("dragover", handleDragOver);
        btn.addEventListener("drop", handleDrop);
        btn.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            showFavoriteContextMenu(e, i, f);
        });
        cont.appendChild(btn);
    });

    const addBtn = document.createElement("div");
    addBtn.id = "addFavoriteBtn";
    addBtn.className = "favorite-item accent";
    addBtn.textContent = translations[lang]?.addFavorite || '+ Favori Ekle';
    addBtn.onclick = () => {
        document.getElementById("addFavoriteModal").style.display = "block";
        document.getElementById("modalName").focus();
    };
    cont.appendChild(addBtn);
    document.getElementById("addFavoriteBtn").style.display = favs.length >= maxFav ? "none" : "flex";
}

export function removeFavorite(i) {
    const favs = JSON.parse(localStorage.getItem("userFavorites") || "[]");
    favs.splice(i, 1);
    saveFavorites(favs);
    loadFavorites();
}

let draggedIndex = null;

export function handleDragStart(e) {
    draggedIndex = e.target.getAttribute("data-index");
    e.dataTransfer.setData("text/plain", draggedIndex);
}

export function handleDragOver(e) {
    e.preventDefault();
}

export function handleDrop(e) {
    e.preventDefault();
    const droppedItem = e.target.closest(".favorite-item");
    if (!droppedItem) return;
    const droppedIndex = droppedItem.getAttribute("data-index");
    if (draggedIndex !== null && droppedIndex !== null && draggedIndex !== droppedIndex) {
        const favs = JSON.parse(localStorage.getItem("userFavorites") || "[]");
        const draggedFav = favs[draggedIndex];
        favs.splice(draggedIndex, 1);
        favs.splice(droppedIndex, 0, draggedFav);
        saveFavorites(favs);
        loadFavorites();
    }
    draggedIndex = null;
}

export async function addFavoriteFromModal() {
    const name = document.getElementById("modalName").value.trim();
    let url = document.getElementById("modalUrl").value.trim();
    const lang = localStorage.getItem("language") || "tr";
    if (!url) {
        alert(translations[lang].invalidUrlAlert);
        return;
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }
    try {
        new URL(url);
        const favs = JSON.parse(localStorage.getItem("userFavorites") || "[]");
        const maxFav = parseInt(localStorage.getItem("maxFavorites") || "5");
        if (favs.length >= maxFav) {
            alert(translations[lang].maxFavoritesAlert);
            return;
        }
        const finalName = name || await fetchWebsiteTitle(url);
        favs.push({ name: finalName, url });
        saveFavorites(favs);
        loadFavorites();
        document.getElementById("addFavoriteModal").style.display = "none";
        document.getElementById("modalName").value = "";
        document.getElementById("modalUrl").value = "";
    } catch {
        alert(translations[lang].invalidUrlAlert);
    }
}

async function fetchWebsiteTitle(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
        return doc.title || url;
    } catch {
        return url;
    }
}

export function showFavoriteContextMenu(e, index, fav) {
    const menu = document.getElementById("favoriteContextMenu");
    menu.style.display = "block";
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    menu.setAttribute("data-index", index);

    document.querySelectorAll(".favorite-item").forEach(item => item.classList.remove("context-active"));
    const favItems = document.querySelectorAll(".favorite-item");
    if (favItems[index]) favItems[index].classList.add("context-active");
}
