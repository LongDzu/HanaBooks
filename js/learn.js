document.addEventListener("DOMContentLoaded", () => {

    const learnLang = document.getElementById("learnLang");
    const answerLang = document.getElementById("answerLang");
    const questionText = document.getElementById("questionText");
    const answersDiv = document.getElementById("answers");
    const progressFill = document.getElementById("progressFill");
    const counter = document.getElementById("counter");
    const audioBtn = document.getElementById("audioBtn");
    const unknownBtn = document.getElementById("unknownBtn");
    const popup = document.getElementById("popup");

    const LANG = {
        en: { key: "Từ vựng tiếng anh", voice: "en-US" },
        ko: { key: "Từ vựng tiếng hàn", voice: "ko-KR" },
        vi: { key: "Từ vựng tiếng việt", voice: "vi-VN" }
    };

    let allQuestions = [];
    let learningQueue = [];
    let unknownQueue = [];
    let current;
    let locked = false;

    function loadFlashcardData(){
        fetch("flashcard.xlsx")
        .then(r => r.arrayBuffer())
        .then(data => {
            const wb = XLSX.read(data, { type: "array" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            allQuestions = XLSX.utils.sheet_to_json(sheet);
            syncSelectOptions();
            resetLearning();
        });
    }
    

    function syncSelectOptions() {
        const learnVal = learnLang.value;
        const answerVal = answerLang.value;

        [...answerLang.options].forEach(o => o.disabled = o.value === learnVal);
        [...learnLang.options].forEach(o => o.disabled = o.value === answerVal);
    }

    learnLang.onchange = () => {
        syncSelectOptions();
        resetLearning();
    };

    answerLang.onchange = () => {
        syncSelectOptions();
        resetLearning();
    };

    function resetLearning() {
        learningQueue = shuffle([...allQuestions]);
        unknownQueue = [];
        next();
    }

    function next() {
        if (!learningQueue.length) {
            if (unknownQueue.length) {
                learningQueue = shuffle([...unknownQueue]);
                unknownQueue = [];
            } else {
                popup.style.display = "flex";
                return;
            }
        }
        current = learningQueue.shift();
        renderQuestion();
        updateProgress();
    }

    function renderQuestion() {
        locked = false;
        unknownBtn.disabled = false;

        const qLang = learnLang.value;
        const aLang = answerLang.value;

        questionText.innerText = current[LANG[qLang].key];
        audioBtn.onclick = () => speak(questionText.innerText, LANG[qLang].voice);

        const correct = current[LANG[aLang].key];
        const options = new Set([correct]);

        while (options.size < 4) {
            const r = allQuestions[Math.floor(Math.random() * allQuestions.length)];
            options.add(r[LANG[aLang].key]);
        }

        answersDiv.innerHTML = "";

        shuffle([...options]).forEach(text => {
            const div = document.createElement("div");
            div.className = "answer";
            div.innerText = text;

            div.onclick = () => {
                if (locked) return;
                locked = true;
                disableAllAnswers();
                unknownBtn.disabled = true;

                if (text !== correct) {
                    div.classList.add("wrong");
                    highlightCorrect(correct);
                    unknownQueue.push(current);
                } else {
                    div.classList.add("correct");
                }

                setTimeout(next, 1500);
            };

            answersDiv.appendChild(div);
        });

        unknownBtn.onclick = () => {
            if (locked) return;
            locked = true;
            disableAllAnswers();
            unknownBtn.disabled = true;

            unknownQueue.push(current);
            highlightCorrect(correct);

            setTimeout(next, 1500);
        };
    }

    function disableAllAnswers() {
        [...answersDiv.children].forEach(d => d.classList.add("disabled"));
    }

    function highlightCorrect(correct) {
        [...answersDiv.children].forEach(d => {
            if (d.innerText === correct) d.classList.add("correct");
        });
    }

    function updateProgress() {
        const done = allQuestions.length - learningQueue.length;
        counter.innerText = `${done} / ${allQuestions.length}`;
        progressFill.style.width = `${done / allQuestions.length * 100}%`;
    }

    function speak(text, lang) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
    }

    function shuffle(arr) {
        return arr.sort(() => Math.random() - 0.5);
    }


let validCodes = [];
async function loadValidCodes() {
    const response = await fetch("mvnskfnehcvlsiddfsdjlnfwei.txt");
    const text = await response.text();

    return text.split("\n").map(v => v.trim());
}
async function splitHash(code) {

    const part1 = code.slice(0, -4); // length - 4
    const part2 = code.slice(-4);    // 4 ký tự cuối

    const hash1 = await sha256(part1);
    const hash2 = await sha256(part2);

    return hash1 + hash2;
}
async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map(b =>
        b.toString(16).padStart(2, "0")
    ).join("");
}
const lockScreen = document.getElementById("lockScreen");
const unlockBtn = document.getElementById("unlockBtn");
const passwordInput = document.getElementById("passwordInput");
const errorMsg = document.getElementById("errorMsg");



loadValidCodes().then(data => {
    validCodes = data;
});

if (sessionStorage.getItem("flashcardUnlocked") === "true") {
    lockScreen.style.display = "none";
    loadFlashcardData();
}

unlockBtn.addEventListener("click", async () => {

    const enteredCode = passwordInput.value.trim();

    if (!enteredCode) {
        errorMsg.textContent = "❌ Không được để trống!";
        triggerShake();
        return;
    }

    const hashedCode = await splitHash(enteredCode);

    if (validCodes.includes(hashedCode)) {

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
