document.addEventListener("DOMContentLoaded", () => {

    /* ========== STATE ========== */
    let vocabList = [];
    let currentIndex = 0;
    let reversed = false;

    let frontLang = "";
    let backLang = "";

    /* ========== ELEMENTS ========== */
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

    /* ========== LOAD EXCEL ========== */
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

    /* ========== CONTROLS ========== */
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

    prevBtn.onclick = () => currentIndex > 0 && showCard(currentIndex - 1);
    nextBtn.onclick = () => currentIndex < vocabList.length - 1 && showCard(currentIndex + 1);

    /* ========== LIST ========== */
    function renderList() {
        wordList.innerHTML = "";
        const m = mode.value;

        vocabList.forEach((item, i) => {
            const row = document.createElement("div");
            row.className = "word";

            const left = document.createElement("div");
            left.className = "left";
            left.innerText = getText(item, "front", m).text;

            const right = document.createElement("div");
            right.className = "right";
            right.innerText = getText(item, "back", m).text;

            const audioBtn = document.createElement("button");
            audioBtn.className = "audio-btn";
            audioBtn.innerText = "🔊";
            audioBtn.onclick = e => {
                e.stopPropagation();
                const info = getText(item, "front", m);
                speak(info.text, info.lang);
            };

            row.append(left, audioBtn, right);
            row.onclick = () => showCard(i);

            wordList.appendChild(row);
        });
    }

    /* ========== CARD ========== */
    function showCard(i) {
        currentIndex = i;
        const item = vocabList[i];
        const m = mode.value;

        const f = getText(item, "front", m);
        const b = getText(item, "back", m);

        frontText.innerText = f.text;
        backText.innerText = b.text;

        frontLang = f.lang;
        backLang = b.lang;

        counter.innerText = `${String(i + 1).padStart(2, "0")} / ${vocabList.length}`;
        card.classList.remove("flipped");
    }

    card.onclick = () => card.classList.toggle("flipped");

    /* ========== CORE LOGIC ========== */
    function getText(item, side, m) {
        const map = {
            en: { key: "Từ vựng tiếng anh", lang: "en-US" },
            ko: { key: "Từ vựng tiếng hàn", lang: "ko-KR" },
            vi: { key: "Từ vựng tiếng việt", lang: "vi-VN" }
        };

        let from, to;
        if (m === "en-ko") [from, to] = ["en", "ko"];
        if (m === "ko-vi") [from, to] = ["ko", "vi"];
        if (m === "en-vi") [from, to] = ["en", "vi"];

        const langKey =
            !reversed
                ? side === "front" ? from : to
                : side === "front" ? to : from;

        return {
            text: item[map[langKey].key],
            lang: map[langKey].lang
        };
    }

    /* ========== AUDIO ========== */
    function speak(text, lang) {
        if (!text) return;
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
    }

    frontAudio.onclick = e => {
        e.stopPropagation();
        speak(frontText.innerText, frontLang);
    };

    backAudio.onclick = e => {
        e.stopPropagation();
        speak(backText.innerText, backLang);
    };

});
