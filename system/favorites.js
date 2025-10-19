import { translations } from './language.js';

const FOLDERS_KEY = "userFolders";
const MAX_FOLDERS = 10;
const MAX_ITEMS_PER_FOLDER = 5;

function getMaxFavorites() {
    return parseInt(localStorage.getItem("maxFavorites") || "5", 10);
}

export function saveFavorites(favs) {
    try {
        localStorage.setItem("userFavorites", JSON.stringify(favs));
    } catch (e) {
        console.warn("Favoriler kaydedilemedi:", e);
    }
}

export function loadFavorites() {
    const cont = document.getElementById("favorites");
    cont.innerHTML = "";
    cont.addEventListener("dragover", handleDragOver);
    cont.addEventListener("drop", handleDrop);
    let favs = [];
    let folders = [];
    let linkBehavior = "newTab";
    let lang = "tr";
    try {
        const storedFavs = localStorage.getItem("userFavorites");
        favs = storedFavs ? JSON.parse(storedFavs) : [];
        if (!Array.isArray(favs)) {
            favs = [];
            localStorage.setItem("userFavorites", "[]");
        }
        const storedFolders = localStorage.getItem(FOLDERS_KEY);
        folders = storedFolders ? JSON.parse(storedFolders) : [];
        if (!Array.isArray(folders)) {
            folders = [];
            localStorage.setItem(FOLDERS_KEY, "[]");
        }
        linkBehavior = localStorage.getItem("linkBehavior") || "newTab";
        lang = localStorage.getItem("language") || "tr";
    } catch (e) {
        localStorage.setItem("userFavorites", "[]");
        localStorage.setItem(FOLDERS_KEY, "[]");
    }

// Klasörleri render et
folders.forEach((folder, fIndex) => {
    const folderDiv = document.createElement("div");
    folderDiv.className = "favorite-item folder-item";
    folderDiv.setAttribute("data-folder-index", fIndex);
    const theme = localStorage.getItem("theme") || "light";
    
    // Eğer folder.icon varsa onu kullan yoksa varsayılanı kullan
const iconSrc = folder.icon && folder.icon !== "" 
    ? folder.icon 
    : (theme === "light" ? "assets/dark/folder.png" : "assets/light/folder.png");


    
    const textColor = theme === "light" ? "#000000" : "var(--text-light)";

    folderDiv.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
            <img src="${iconSrc}" style="width:32px; height:32px; border-radius:6px;" alt="Klasör">
            <span style="
                text-decoration: none;
                font-weight: 600;
                font-size: 12px;
                color: ${textColor};
                text-align: center;
                max-width: 70px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                position: relative;
                top: 12px;
            ">${folder.name}</span>
        </div>
    `;

    folderDiv.onclick = (e) => {
        e.stopPropagation();
        openFolderModal(fIndex, folder, e.pageX, e.pageY);
    };
    folderDiv.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        showFolderContextMenu(e, fIndex, folder);
    });
    folderDiv.addEventListener("dragover", handleDragOver);
    folderDiv.addEventListener("drop", (e) => handleDropToFolder(e, fIndex));
    cont.appendChild(folderDiv);
});


    // Normal favorileri render et
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

    const totalItems = favs.length + folders.reduce((sum, f) => sum + f.items.length, 0);
    const maxFavorites = getMaxFavorites();
    const isFull = totalItems >= maxFavorites;

    const addBtn = document.createElement("div");
    addBtn.id = "addFavoriteBtn";
    addBtn.className = "favorite-item accent";
    addBtn.textContent = translations[lang]?.addFavorite || '+ ';
    addBtn.onclick = () => {
        document.getElementById("addFavoriteModal").style.display = "block";
        document.getElementById("modalName").focus();
    };
    cont.appendChild(addBtn);
    addBtn.style.display = isFull ? "none" : "flex";
}

export function removeFavorite(i) {
    const favs = JSON.parse(localStorage.getItem("userFavorites") || "[]");
    favs.splice(i, 1);
    saveFavorites(favs);
    loadFavorites();
}

let draggedIndex = null;
let currentOpenFolderIndex = -1;
let lastModalPos = {x: 100, y: 100};

export function handleDragStart(e) {
    draggedIndex = e.target.getAttribute("data-index");
    e.dataTransfer.setData("text/plain", draggedIndex);
}

export function handleDragOver(e) {
    e.preventDefault();
}

export function handleDrop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    const parts = data.split("-").map(Number);
    let sourceFavIndex, sourceFolderIndex, sourceItemIndex;
    if (parts.length === 1) {
        sourceFavIndex = parts[0];
    } else if (parts.length === 2) {
        [sourceFolderIndex, sourceItemIndex] = parts;
    }
    let droppedItem = e.target.closest(".favorite-item");
    if (droppedItem && droppedItem.classList.contains("folder-item")) return;
    let droppedIndex;
    if (droppedItem) {
        droppedIndex = parseInt(droppedItem.getAttribute("data-index"));
    } else {
        const favs = JSON.parse(localStorage.getItem("userFavorites") || "[]");
        droppedIndex = favs.length;
    }
    let moved = false;
    const favs = JSON.parse(localStorage.getItem("userFavorites") || "[]");
    const folders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
    const totalItems = favs.length + folders.reduce((sum, f) => sum + f.items.length, 0);
    const maxFavorites = getMaxFavorites();

    if (!isNaN(sourceFavIndex)) {
        if (sourceFavIndex !== droppedIndex) {
            const draggedFav = favs.splice(sourceFavIndex, 1)[0];
            favs.splice(droppedIndex, 0, draggedFav);
            saveFavorites(favs);
            moved = true;
        }
    } else if (!isNaN(sourceFolderIndex) && !isNaN(sourceItemIndex)) {
        if (totalItems >= maxFavorites) {
            alert(`Toplam ${maxFavorites} favori sınırına ulaşıldı.`);
            return;
        }
        const item = folders[sourceFolderIndex].items.splice(sourceItemIndex, 1)[0];
        favs.splice(droppedIndex, 0, item);
        localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
        saveFavorites(favs);
        moved = true;
    }
    if (moved) {
        loadFavorites();
        if (currentOpenFolderIndex !== -1) {
            const updatedFolders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
            closeFolderModal();
            setTimeout(() => openFolderModal(currentOpenFolderIndex, updatedFolders[currentOpenFolderIndex], lastModalPos.x, lastModalPos.y), 100);
        }
    }
    draggedIndex = null;
}

export function handleDropToFolder(e, targetFolderIndex) {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    const parts = data.split("-").map(Number);
    let sourceFolderIndex, sourceItemIndex, sourceFavIndex;
    if (parts.length === 1) {
        sourceFavIndex = parts[0];
    } else if (parts.length === 2) {
        [sourceFolderIndex, sourceItemIndex] = parts;
    }
    const folders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
    const favs = JSON.parse(localStorage.getItem("userFavorites") || "[]");
    const totalItems = favs.length + folders.reduce((sum, f) => sum + f.items.length, 0);
    const maxFavorites = getMaxFavorites();
    
    if (folders[targetFolderIndex].items.length >= MAX_ITEMS_PER_FOLDER) {
        alert("Klasör maksimum kapasiteye ulaştı (5 öğe).");
        return;
    }
    if (totalItems >= maxFavorites) {
        alert(`Toplam ${maxFavorites} favori sınırına ulaşıldı.`);
        return;
    }
    
    const targetItem = e.target.closest("[data-item-index]");
    const targetItemIndex = targetItem ? parseInt(targetItem.getAttribute("data-item-index")) : folders[targetFolderIndex].items.length;
    let moved = false;
    let sourceF = isNaN(sourceFolderIndex) ? -1 : sourceFolderIndex;

    if (!isNaN(sourceFavIndex)) {
        const item = favs.splice(sourceFavIndex, 1)[0];
        folders[targetFolderIndex].items.splice(targetItemIndex, 0, item);
        saveFavorites(favs);
        localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
        moved = true;
    } else if (!isNaN(sourceFolderIndex) && !isNaN(sourceItemIndex)) {
        if (sourceFolderIndex === targetFolderIndex) {
            if (sourceItemIndex !== targetItemIndex) {
                const item = folders[sourceFolderIndex].items.splice(sourceItemIndex, 1)[0];
                folders[sourceFolderIndex].items.splice(targetItemIndex, 0, item);
                moved = true;
            }
        } else {
            if (folders[targetFolderIndex].items.length >= MAX_ITEMS_PER_FOLDER) {
                alert("Hedef klasör dolu (5 öğe).");
                return;
            }
            const item = folders[sourceFolderIndex].items.splice(sourceItemIndex, 1)[0];
            folders[targetFolderIndex].items.splice(targetItemIndex, 0, item);
            moved = true;
        }
        localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
    }
    if (moved) {
        loadFavorites();
        if (currentOpenFolderIndex !== -1 && (sourceF === currentOpenFolderIndex || targetFolderIndex === currentOpenFolderIndex)) {
            const updatedFolders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
            closeFolderModal();
            setTimeout(() => openFolderModal(currentOpenFolderIndex, updatedFolders[currentOpenFolderIndex], lastModalPos.x, lastModalPos.y), 100);
        }
    }
}

export async function addFavoriteFromModal() {
    const name = document.getElementById("modalName").value.trim();
    let url = document.getElementById("modalUrl").value.trim();
    const lang = localStorage.getItem("language") || "tr";
    if (!url) {
        alert(translations[lang]?.invalidUrlAlert || "Geçersiz URL.");
        return;
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }
    try {
        new URL(url);
        const folders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
        const favs = JSON.parse(localStorage.getItem("userFavorites") || "[]");
        const totalItems = favs.length + folders.reduce((sum, f) => sum + f.items.length, 0);
        const maxFavorites = getMaxFavorites();
        
        if (totalItems >= maxFavorites) {
            alert(`Toplam ${maxFavorites} favori sınırına ulaşıldı.`);
            return;
        }

        const folderSelect = document.getElementById("folderSelect");
        if (folderSelect.style.display === "block") {
            const selectedFolderIndex = parseInt(document.getElementById("folderDropdown").value);
            if (isNaN(selectedFolderIndex)) {
                alert("Klasör seçin.");
                return;
            }
            if (folders[selectedFolderIndex].items.length >= MAX_ITEMS_PER_FOLDER) {
                alert("Seçilen klasör maksimum kapasiteye ulaştı (5 öğe).");
                return;
            }
            const finalName = name || await fetchWebsiteTitle(url);
            folders[selectedFolderIndex].items.push({ name: finalName, url });
            localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
        } else {
            const finalName = name || await fetchWebsiteTitle(url);
            favs.push({ name: finalName, url });
            saveFavorites(favs);
        }
        loadFavorites();
        closeAddFavoriteModal();
    } catch {
        alert(translations[lang]?.invalidUrlAlert || "Geçersiz URL.");
    }
}

function closeAddFavoriteModal() {
    document.getElementById("addFavoriteModal").style.display = "none";
    document.getElementById("modalName").value = "";
    document.getElementById("modalUrl").value = "";
    document.getElementById("folderSelect").style.display = "none";
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
    showItemContextMenu(e, "normal", index, fav, null);
}

function showItemContextMenu(e, type, index, item, folderIndex) {
    const menu = document.getElementById("favoriteContextMenu");
    menu.style.display = "block";
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    menu.setAttribute("data-type", type);
    menu.setAttribute("data-index", index);
    if (type === "folder-item") {
        menu.setAttribute("data-folder-index", folderIndex);
    }

    document.querySelectorAll(".favorite-item").forEach(itemEl => itemEl.classList.remove("context-active"));
    const targetItem = e.target.closest(".favorite-item");
    if (targetItem) targetItem.classList.add("context-active");
}

export function showFolderContextMenu(e, index, folder) {
    const menu = document.getElementById("folderContextMenu");
    if (!menu) return;
    menu.style.display = "block";
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    menu.setAttribute("data-folder-index", index);
    document.querySelectorAll(".folder-item").forEach(item => item.classList.remove("context-active"));
    const folderItems = document.querySelectorAll(".folder-item");
    if (folderItems[index]) folderItems[index].classList.add("context-active");
}

window.createFolder = function() {
    const lang = localStorage.getItem("language") || "tr";
    const folderName = prompt("Klasör adı girin:");
    if (!folderName || folderName.trim().length < 1) return;
    const folders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
    if (folders.length >= MAX_FOLDERS) {
        alert(`Maksimum ${MAX_FOLDERS} klasör.`);
        return;
    }
    folders.push({ name: folderName.trim(), items: [], icon: "" });
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
    loadFavorites();
};

window.openFolderModal = function(folderIndex, folder, x, y) {
    currentOpenFolderIndex = folderIndex;
    lastModalPos = { x, y };
    const modal = document.getElementById("folderModal");
    const modalContent = modal.querySelector(".modal-content");
    const folderTitle = document.getElementById("folderTitle");
    
    // Başlık başlangıçta normal metin
    folderTitle.textContent = folder.name;
    
    // Başlık düzenleme için olay dinleyici
    folderTitle.onclick = () => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = folder.name;
        input.style.width = "100%";
        input.style.fontSize = "inherit";
        input.style.fontWeight = "inherit";
        input.style.border = "1px solid var(--text-light)";
        input.style.borderRadius = "4px";
        input.style.padding = "2px 4px";
        
        folderTitle.innerHTML = "";
        folderTitle.appendChild(input);
        input.focus();
        
        // Enter ile kaydet
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                saveFolderName(input.value.trim());
            }
        });
        
        // Escape ile iptal
        input.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                folderTitle.textContent = folder.name;
            }
        });
        
        // Odak kaybında kaydet
        input.addEventListener("blur", () => {
            saveFolderName(input.value.trim());
        });
        
        // Ad kaydetme fonksiyonu
        function saveFolderName(newName) {
            if (newName) {
                const folders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
                folders[folderIndex].name = newName;
                localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
                folderTitle.textContent = newName;
                loadFavorites();
            } else {
                folderTitle.textContent = folder.name;
            }
        }
    };

    const folderCont = document.getElementById("folderFavorites");
    folderCont.innerHTML = "";
    folderCont.addEventListener("dragover", handleDragOver);
    folderCont.addEventListener("drop", (e) => handleDropToFolder(e, folderIndex));
    const linkBehavior = localStorage.getItem("linkBehavior") || "newTab";
    
    folder.items.forEach((item, i) => {
        let faviconUrl = "ico/default-favicon.png";
        try {
            faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}`;
        } catch (e) {}

        const itemDiv = document.createElement("div");
        itemDiv.className = "favorite-item";
        itemDiv.setAttribute("draggable", "true");
        itemDiv.setAttribute("data-item-index", i);
        itemDiv.setAttribute("data-folder-index", folderIndex);
        itemDiv.innerHTML = `
            <div style="display:flex; flex-direction: column; align-items: center; gap:4px; text-align: center;">
                <img src="${faviconUrl}" style="width:32px;height:32px;border-radius:6px;" onerror="this.src='ico/default-favicon.png'">
                <a href="${item.url}" ${linkBehavior === "closeCurrent" ? "" : 'target="_blank"'}>${item.name}</a>
            </div>
        `;

        itemDiv.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", `${folderIndex}-${i}`);
        });
        itemDiv.addEventListener("dragover", handleDragOver);
        itemDiv.addEventListener("drop", (e) => handleDropToFolder(e, folderIndex));
        itemDiv.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            showItemContextMenu(e, "folder-item", i, item, folderIndex);
        });
        folderCont.appendChild(itemDiv);
    });
    
    modalContent.style.position = "absolute";
    modalContent.style.left = `${x}px`;
    modalContent.style.top = `${y}px`;
    modal.style.display = "block";
};

window.closeFolderModal = function() {
    currentOpenFolderIndex = -1;
    document.getElementById("folderModal").style.display = "none";
};

window.removeFromFolder = function(folderIndex, itemIndex) {
    const folders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
    folders[folderIndex].items.splice(itemIndex, 1);
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
    loadFavorites();
    const folder = folders[folderIndex];
    if (folder) {
        closeFolderModal();
        setTimeout(() => openFolderModal(folderIndex, folder, lastModalPos.x, lastModalPos.y), 100);
    }
};

window.toggleFolderAdd = function() {
    const selectDiv = document.getElementById("folderSelect");
    const folders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
    const dropdown = document.getElementById("folderDropdown");
    dropdown.innerHTML = "";
    if (folders.length === 0) {
        alert("Önce klasör oluşturun.");
        return;
    }
    folders.forEach((f, i) => {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = f.name;
        dropdown.appendChild(opt);
    });
    selectDiv.style.display = selectDiv.style.display === "none" ? "block" : "none";
};

function toggleMenuOff() {
    const favMenu = document.getElementById("favoriteContextMenu");
    const folderMenu = document.getElementById("folderContextMenu");
    if (favMenu) {
        favMenu.style.display = "none";
        favMenu.removeAttribute("data-index");
        favMenu.removeAttribute("data-type");
        favMenu.removeAttribute("data-folder-index");
    }
    if (folderMenu) {
        folderMenu.style.display = "none";
        folderMenu.removeAttribute("data-folder-index");
    }
    document.querySelectorAll(".favorite-item").forEach(item => item.classList.remove("context-active"));
}

document.addEventListener("click", (e) => {
    if (!e.target.closest("#favoriteContextMenu") && !e.target.closest("#folderContextMenu")) {
        toggleMenuOff();
    }
    if (e.target.id === "folderModal" || !e.target.closest(".modal-content")) {
        closeFolderModal();
    }
});

window.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
        toggleMenuOff();
        closeFolderModal();
    }
});

document.getElementById("favoriteContextMenu")?.addEventListener("click", function(e) {
    const target = e.target;
    if (target.classList.contains("fav-menu-item")) {
        const action = target.getAttribute("data-action");
        const menu = this;
        const type = menu.getAttribute("data-type");
        const index = parseInt(menu.getAttribute("data-index"));
        if (isNaN(index)) return;

        if (type === "normal") {
            let favs = JSON.parse(localStorage.getItem("userFavorites") || "[]");
            switch (action) {
                case "open":
                    if (favs[index]) window.open(favs[index].url, "_blank");
                    break;
                case "renameFav":
                    const newName = prompt("Yeni favori adı:", favs[index]?.name || "");
                    if (newName && newName.trim()) {
                        favs[index].name = newName.trim();
                        saveFavorites(favs);
                        loadFavorites();
                    }
                    break;
                case "moveLeft":
                    if (index > 0) {
                        [favs[index], favs[index - 1]] = [favs[index - 1], favs[index]];
                        saveFavorites(favs);
                        loadFavorites();
                    }
                    break;
                case "moveRight":
                    if (index < favs.length - 1) {
                        [favs[index], favs[index + 1]] = [favs[index + 1], favs[index]];
                        saveFavorites(favs);
                        loadFavorites();
                    }
                    break;
                case "remove":
                    removeFavorite(index);
                    break;
            }
        } else if (type === "folder-item") {
            const folderIndex = parseInt(menu.getAttribute("data-folder-index"));
            let folders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
            const item = folders[folderIndex].items[index];
            switch (action) {
                case "open":
                    window.open(item.url, "_blank");
                    break;
                case "renameFav":
                    const newItemName = prompt("Yeni favori adı:", item?.name || "");
                    if (newItemName && newItemName.trim()) {
                        folders[folderIndex].items[index].name = newItemName.trim();
                        localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
                        const updatedFolders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
                        closeFolderModal();
                        setTimeout(() => openFolderModal(folderIndex, updatedFolders[folderIndex], lastModalPos.x, lastModalPos.y), 100);
                    }
                    break;
                case "remove":
                    folders[folderIndex].items.splice(index, 1);
                    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
                    const updatedFoldersRemove = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
                    closeFolderModal();
                    setTimeout(() => openFolderModal(folderIndex, updatedFoldersRemove[folderIndex], lastModalPos.x, lastModalPos.y), 100);
                    break;
                case "moveLeft":
                    if (index > 0) {
                        [folders[folderIndex].items[index], folders[folderIndex].items[index - 1]] = [folders[folderIndex].items[index - 1], folders[folderIndex].items[index]];
                        localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
                        const updatedFoldersLeft = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
                        closeFolderModal();
                        setTimeout(() => openFolderModal(folderIndex, updatedFoldersLeft[folderIndex], lastModalPos.x, lastModalPos.y), 100);
                    }
                    break;
                case "moveRight":
                    if (index < folders[folderIndex].items.length - 1) {
                        [folders[folderIndex].items[index], folders[folderIndex].items[index + 1]] = [folders[folderIndex].items[index + 1], folders[folderIndex].items[index]];
                        localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
                        const updatedFoldersRight = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
                        closeFolderModal();
                        setTimeout(() => openFolderModal(folderIndex, updatedFoldersRight[folderIndex], lastModalPos.x, lastModalPos.y), 100);
                    }
                    break;
                case "moveToMain":
                    const favs = JSON.parse(localStorage.getItem("userFavorites") || "[]");
                    const totalItems = favs.length + folders.reduce((sum, f) => sum + f.items.length, 0);
                    const maxFavorites = getMaxFavorites();
                    if (totalItems >= maxFavorites) {
                        alert(`Toplam ${maxFavorites} favori sınırına ulaşıldı.`);
                        break;
                    }
                    const movedItem = folders[folderIndex].items.splice(index, 1)[0];
                    favs.push(movedItem);
                    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
                    saveFavorites(favs);
                    loadFavorites();
                    const updatedFoldersMain = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
                    closeFolderModal();
                    setTimeout(() => openFolderModal(folderIndex, updatedFoldersMain[folderIndex], lastModalPos.x, lastModalPos.y), 100);
                    break;
            }
        }
        toggleMenuOff();
    }
});

document.getElementById("folderContextMenu")?.addEventListener("click", function(e) {
    const target = e.target;
    if (target.classList.contains("fav-menu-item")) {
        const action = target.getAttribute("data-action");
        const menu = this;
        const index = parseInt(menu.getAttribute("data-folder-index"));
        if (isNaN(index)) return;

        let folders = JSON.parse(localStorage.getItem(FOLDERS_KEY) || "[]");
        switch (action) {
            case "renameFolder":
                const newFolderName = prompt("Yeni klasör adı:", folders[index]?.name || "");
                if (newFolderName && newFolderName.trim()) {
                    folders[index].name = newFolderName.trim();
                    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
                    loadFavorites();
                }
                break;
            case "removeFolder":
                if (confirm("Klasörü silmek istediğinizden emin misiniz? İçeriği kaybolacak.")) {
                    folders.splice(index, 1);
                    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
                    loadFavorites();
                }
                break;
            case "moveLeft":
                if (index > 0) {
                    [folders[index], folders[index - 1]] = [folders[index - 1], folders[index]];
                    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
                    loadFavorites();
                }
                break;
            case "moveRight":
                if (index < folders.length - 1) {
                    [folders[index], folders[index + 1]] = [folders[index + 1], folders[index]];
                    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
                    loadFavorites();
                }
                break;
            case "changeIcon":
                const newIcon = prompt("Yeni ikon URL'si:", folders[index]?.icon || "assets/light/folder.png");
                if (newIcon && newIcon.trim()) {
                    folders[index].icon = newIcon.trim();
                    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
                    loadFavorites();
                }
                break;
        }
        toggleMenuOff();
    }
});
