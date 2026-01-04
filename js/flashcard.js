document.addEventListener("DOMContentLoaded", () => {

    /* ================== STATE ================== */
    let vocabList = [];
    let currentIndex = 0;
    let reversed = false;

    /* ================== ELEMENTS ================== */
    const mode = document.getElementById("mode");
    const reverseBtn = document.getElementById("reverseBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    const wordList = document.getElementById("wordList");

    const card = document.getElementById("card");
    const frontText = document.getElementById("frontText");
    const backText = document.getElementById("backText");
    const counter = document.getElementById("counter");

    const frontAudio = document.querySelector(".front-audio");
    const backAudio = document.querySelector(".back-audio");

    /* ================== LOAD EXCEL ================== */
    fetch("flashcard.xlsx")
        .then(res => res.arrayBuffer())
        .then(data => {
            const wb = XLSX.read(data, { type: "array" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            vocabList = XLSX.utils.sheet_to_json(sheet);

            if (vocabList.length) {
                showCard(0);
                renderList();
            }
        });

    /* ================== CONTROLS ================== */
    mode.onchange = () => {
        reversed = false;
        showCard(0);
        renderList();
    };

    reverseBtn.onclick = () => {
        reversed = !reversed;
        showCard(currentIndex);
        renderList();
    };

    prevBtn.onclick = () => {
        if (currentIndex > 0) showCard(currentIndex - 1);
    };

    nextBtn.onclick = () => {
        if (currentIndex < vocabList.length - 1) showCard(currentIndex + 1);
    };

    /* ================== LIST ================== */
    function renderList() {
        wordList.innerHTML = "";
        const m = mode.value;

        vocabList.forEach((item, i) => {
            const row = document.createElement("div");
            row.className = "word";

            const left = document.createElement("div");
            left.className = "left";
            left.innerText = getFront(item, m);

            const right = document.createElement("div");
            right.className = "right";
            right.innerText = getBack(item, m);

            const audioBtn = document.createElement("button");
            audioBtn.className = "audio-btn";
            audioBtn.innerText = "🔊";
            audioBtn.onclick = e => {
                e.stopPropagation();
                speak(left.innerText, m);
            };

            row.append(left, audioBtn, right);
            row.onclick = () => showCard(i);

            wordList.appendChild(row);
        });
    }

    /* ================== CARD ================== */
    function showCard(i) {
        currentIndex = i;
        const item = vocabList[i];
        const m = mode.value;

        frontText.innerText = getFront(item, m);
        backText.innerText = getBack(item, m);

        counter.innerText = `${String(i + 1).padStart(2, "0")} / ${vocabList.length}`;
        card.classList.remove("flipped");
    }

    card.onclick = () => {
        card.classList.toggle("flipped");
    };

    /* ================== TEXT LOGIC ================== */
    function getFront(it, m) {
        if (!reversed) {
            if (m === "en-ko" || m === "en-vi") return it["Từ vựng tiếng anh"];
            return it["Từ vựng tiếng hàn"];
        } else {
            if (m === "en-ko") return it["Từ vựng tiếng hàn"];
            return it["Từ vựng tiếng việt"];
        }
    }

    function getBack(it, m) {
        if (!reversed) {
            if (m === "en-ko") return it["Từ vựng tiếng hàn"];
            return it["Từ vựng tiếng việt"];
        } else {
            if (m === "en-ko") return it["Từ vựng tiếng anh"];
            return it["Từ vựng tiếng hàn"];
        }
    }

    /* ================== AUDIO ================== */
    function speak(text, m) {
        if (!text) return;

        const u = new SpeechSynthesisUtterance(text);

        if (m.includes("en")) u.lang = "en-US";
        if (m.includes("ko")) u.lang = "ko-KR";
        if (m.includes("vi")) u.lang = "vi-VN";

        speechSynthesis.cancel();
        speechSynthesis.speak(u);
    }

    frontAudio.onclick = e => {
        e.stopPropagation();
        speak(frontText.innerText, mode.value);
    };

    backAudio.onclick = e => {
        e.stopPropagation();
        speak(backText.innerText, mode.value);
    };

});
