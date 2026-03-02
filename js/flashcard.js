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
    function loadFlashcardData(){
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
        console.log("đã fetch");
    };
    

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
        // card.classList.remove("flipped");
        // backText.style.display="none";
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


    const validCodes = [
    "HANA7XK9Q2L","HANAZ4M8T1P","HANAQ9L2V7R","HANA3N8WX5K","HANAY6T2B9J",
    "HANAR1P7Z4M","HANA8KQ3L6X","HANAV5M9T2C","HANAW2X7R8N","HANA6ZL4P1T",
    "HANAT9Q5M3B","HANAP4V8K2R","HANAX7N1L9C","HANA2M6T8QK","HANAL9R3X5V",
    "HANA5B7P2ZN","HANAQ1T8M4L","HANA8V3K6RX","HANAM2L7Q9P","HANA4X8T1BZ"
];

const lockScreen = document.getElementById("lockScreen");
const unlockBtn = document.getElementById("unlockBtn");
const passwordInput = document.getElementById("passwordInput");
const errorMsg = document.getElementById("errorMsg");

// Kiểm tra nếu đã login trong session
if (sessionStorage.getItem("flashcardUnlocked") === "true") {
    lockScreen.style.display = "none";
    loadFlashcardData();
}

unlockBtn.addEventListener("click", () => {
    const enteredCode = passwordInput.value.trim();

    if (!enteredCode) {
        errorMsg.textContent = "❌ Không được để trống!";
        triggerShake();
        return;
    }

    if (validCodes.includes(enteredCode)) {
        sessionStorage.setItem("flashcardUnlocked", "true");
        lockScreen.style.display = "none";
        loadFlashcardData();
    } else {
        errorMsg.textContent = "❌ Mật mã không đúng!";
        triggerShake();
    }
});

// Nhấn Enter để mở khóa
passwordInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        unlockBtn.click();
    }
});

document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
});

document.addEventListener("keydown", function(e) {

    // F12
    if (e.key === "F12") {
        e.preventDefault();
    }

    // Ctrl + Shift + I
    if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
    }

    // Ctrl + Shift + J
    if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault();
    }

    // Ctrl + U (view source)
    if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
    }
});

function triggerShake() {
    unlockBtn.classList.remove("shake"); 
    void unlockBtn.offsetWidth; // reset animation
    unlockBtn.classList.add("shake");
   passwordInput.value = "";
}

});

