export function applyBackground(bgUrl) {
    const video = document.getElementById('backgroundVideo');
    const yt = document.getElementById('backgroundYouTube');
    if (!bgUrl) {
        video.style.display = 'none';
        yt.style.display = 'none';
        video.src = '';
        yt.src = '';
        document.body.style.backgroundImage = '';
        return;
    }
    if (bgUrl.startsWith('data:video') || bgUrl.match(/\.(mp4|webm|ogg)$/i)) {
        video.src = bgUrl;
        video.style.display = 'block';
        yt.style.display = 'none';
        yt.src = '';
        document.body.style.backgroundImage = '';
    } else if (bgUrl.includes('youtube.com') || bgUrl.includes('youtu.be')) {
        const match = bgUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_\-]+)/);
        const vid = match ? match[1] : '';
        yt.src = vid ? `https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&modestbranding=1&showinfo=0` : '';
        yt.style.display = 'block';
        video.style.display = 'none';
        video.src = '';
        document.body.style.backgroundImage = '';
    } else if (bgUrl.startsWith('data:image') || bgUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
        video.style.display = 'none';
        yt.style.display = 'none';
        video.src = '';
        yt.src = '';
        document.body.style.backgroundImage = `url('${bgUrl}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    } else {
        video.style.display = 'none';
        yt.style.display = 'none';
        video.src = '';
        yt.src = '';
        document.body.style.backgroundImage = `url('${bgUrl}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    }
}

export function updateRecentBgList() {
    const recentBgList = document.getElementById("recentBgList");
    if (!recentBgList) return;
    recentBgList.innerHTML = "";
    let wallpapers = JSON.parse(localStorage.getItem("wallpapers") || "[]");
    const lang = localStorage.getItem("language") || "tr";

    if (wallpapers.length === 0) {
        recentBgList.innerHTML = `<div>${translations[lang]?.noWallpapers || "Henüz hiç duvar kağıdı yok."}</div>`;
        return;
    }

    wallpapers.forEach((w, index) => {
        if (!w.url || !w.name) return;
        const div = document.createElement("div");
        div.className = "recent-bg-item";
        div.style = "display: flex; align-items: center; gap: 8px; cursor: pointer; margin-bottom: 4px;";

        let thumbnailUrl = "assets/default-thumbnail.png";
        if (w.type === "file" && w.url.startsWith("data:image")) {
            thumbnailUrl = w.url;
        } else if (w.type === "file" && w.url.startsWith("data:video")) {
            thumbnailUrl = w.url;
        } else if (w.type === "url" && w.url.includes("youtube.com")) {
            const videoId = w.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_\-]+)/)?.[1];
            thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : "ico/default-thumbnail.png";
        } else if (w.type === "url" && w.url.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
            thumbnailUrl = w.url;
        }

        div.innerHTML = `
            <img src="${thumbnailUrl}" style="width: 40px; height: 40px; border-radius: 4px;" onerror="this.src='ico/default-thumbnail.png'" alt="${w.name}">
            <span style="word-break: break-all; max-width: 200px;">${w.name}</span>
            <span class="remove-bg-btn" style="cursor: pointer; color: #ff4444; font-weight: bold; margin-left: auto;">×</span>
        `;

        div.addEventListener("click", () => {
            localStorage.setItem("bgUrl", w.url);
            applyBackground(w.url);
        });

        const removeBtn = div.querySelector(".remove-bg-btn");
        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            removeBackground(index);
        });

        recentBgList.appendChild(div);
    });

    recentBgList.classList.remove("hidden");
}

export function removeBackground(index) {
    let wallpapers = JSON.parse(localStorage.getItem("wallpapers") || "[]");
    if (index >= 0 && index < wallpapers.length) {
        const removedUrl = wallpapers[index].url;
        wallpapers.splice(index, 1);
        localStorage.setItem("wallpapers", JSON.stringify(wallpapers));

        const currentBgUrl = localStorage.getItem("bgUrl");
        if (currentBgUrl === removedUrl) {
            localStorage.removeItem("bgUrl");
            applyBackground("");
        }

        updateRecentBgList();
    } else {
        console.warn("Geçersiz duvar kağıdı indeksi:", index);
    }
}

// Event listeners for background inputs
document.getElementById("bgFileInput").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const bgDataUrl = evt.target.result;
        localStorage.setItem("bgUrl", bgDataUrl);
        let wallpapers = JSON.parse(localStorage.getItem("wallpapers") || "[]");
        wallpapers.unshift({ type: "file", name: file.name, url: bgDataUrl, time: Date.now() });
        localStorage.setItem("wallpapers", JSON.stringify(wallpapers.slice(0, 20)));
        applyBackground(bgDataUrl);
        document.getElementById("bgUrlInput").value = "";
        updateRecentBgList();
    };
    reader.readAsDataURL(file);
});

document.getElementById("bgUrlInput").addEventListener("change", function() {
    const url = this.value.trim();
    if (!url) return;
    localStorage.setItem("bgUrl", url);
    let wallpapers = JSON.parse(localStorage.getItem("wallpapers") || "[]");
    wallpapers.unshift({ type: "url", name: url, url: url, time: Date.now() });
    localStorage.setItem("wallpapers", JSON.stringify(wallpapers.slice(0, 20)));
    applyBackground(url);
    updateRecentBgList();
});