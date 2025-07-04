function drrrSendMessage(msg) {
    fetch("https://drrr.com/room/?ajax=1", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest"
        },
        body: new URLSearchParams({
            message: msg,
            loadness: "",
            url: "",
            to: ""
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Message sent:", data);
    })
    .catch(err => {
        console.error("Message failed to send:", err);
    });
}

function drrrSetMusicUrl(mp3Url) {
    fetch("https://drrr.com/room/?ajax=1", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
        },
        body: new URLSearchParams({
            music: "music",
            name: "",
            url: mp3Url
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Music URL set:", data);
    })
    .catch(err => {
        console.error("Failed to set music URL:", err);
    });
}

function drrrPlayByName(musicName, mp3Url) {
    fetch("https://drrr.com/room/?ajax=1", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
        },
        body: new URLSearchParams({
            music: "music",
            name: musicName,
            url: mp3Url
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log(`Music "${musicName}" set:`, data);
    })
    .catch(err => {
        console.error(`Failed to set music "${musicName}":`, err);
    });
}

let lastProcessedElement = null;

setInterval(function () {
    const dlElement = document.querySelector("#talks > dl:nth-child(1)");
    if (!dlElement) return;

    if (dlElement === lastProcessedElement) return;

    lastProcessedElement = dlElement;

    const textElement = dlElement.querySelector("dd > div > p");
    if (!textElement) return;

    const textContent = textElement.textContent || textElement.innerText;

    if (textContent.startsWith("/play -url ")) {
        const urlMatch = textContent.match(/\/play -url\s+(https?:\/\/[^\s]+)/);
        if (urlMatch && urlMatch[1]) {
            const videoUrl = urlMatch[1];
            fetch("https://drrr-music.duckdns.org:3000/download", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: videoUrl })
            })
            .then(res => res.json())
            .then(data => {
                if (data.downloadUrl) {
                    drrrSendMessage(`/me ▶️ Now playing: ${data.downloadUrl}`);
                    drrrSetMusicUrl(data.downloadUrl);
                } else {
                    drrrSendMessage("⚠️ Failed to generate MP3 link.");
                }
            })
            .catch(() => {
                drrrSendMessage("⚠️ Server error.");
            });
        }
    }
    else if (textContent.startsWith("/play ")) {
        const query = textContent.slice(6).trim();
        if (query.length === 0) return;

        fetch(`https://drrr-music.duckdns.org:3000/search?query=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            if (data.mp3Url && data.title) {
                drrrSendMessage(`/me ▶️ Now playing: ${data.title}`);
                drrrPlayByName(data.title, data.mp3Url);
            } else {
                drrrSendMessage("⚠️ No results found.");
            }
        })
        .catch(() => {
            drrrSendMessage("⚠️ Server error.");
        });
    }

}, 1000);
