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

    fetch("flashcard.xlsx")
        .then(r => r.arrayBuffer())
        .then(data => {
            const wb = XLSX.read(data, { type: "array" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            allQuestions = XLSX.utils.sheet_to_json(sheet);
            syncSelectOptions();
            resetLearning();
        });

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
});
