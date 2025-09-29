// Menu toggle for mobile
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn?.addEventListener("click", () => {
    navMenu.classList.toggle("active");
});

// Update year
document.getElementById("year").textContent = new Date().getFullYear();

// Email form handler
const emailForm = document.getElementById("emailForm");
emailForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    showToast("✅ Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm.");
    emailForm.reset();
});

// Modal functionality
const orderBtn = document.getElementById("globalOrderBtn");
const backdrop = document.getElementById("g5ContactBackdrop");
const closeBtn = document.getElementById("g5Close");
const form = document.getElementById("g5ContactForm");
const btnSubmit = document.getElementById("g5Submit");
const toast = document.getElementById("g5Toast");

// Form elements
const nameEl = document.getElementById('g5Name');
const phoneEl = document.getElementById('g5Phone');
const emailEl = document.getElementById('g5Email');
const msgEl = document.getElementById('g5Message');

const minName = 2;
const minMsg = 10;
const phoneRe = /^(\+?84|0)(3|5|7|8|9)\d{8}$/;

function showErr(el, id) {
    el.setAttribute('aria-invalid', 'true');
    const e = document.getElementById(id);
    if (e) e.style.display = 'block';
}

function clearErr(el, id) {
    el.setAttribute('aria-invalid', 'false');
    const e = document.getElementById(id);
    if (e) e.style.display = 'none';
}

function validateName() {
    const ok = nameEl.value.trim().length >= minName;
    ok ? clearErr(nameEl, 'err-g5Name') : showErr(nameEl, 'err-g5Name');
    return ok;
}

function validateEmail() {
    const v = emailEl.value.trim();
    if (!v) {
        clearErr(emailEl, 'err-g5Email');
        return true;
    }
    const ok = emailEl.checkValidity();
    ok ? clearErr(emailEl, 'err-g5Email') : showErr(emailEl, 'err-g5Email');
    return ok;
}

function validatePhone() {
    const v = phoneEl.value.trim();
    if (!v) {
        clearErr(phoneEl, 'err-g5Phone');
        return true;
    }
    const ok = phoneRe.test(v);
    ok ? clearErr(phoneEl, 'err-g5Phone') : showErr(phoneEl, 'err-g5Phone');
    return ok;
}

function validateMsg() {
    const v = msgEl.value.trim();
    if (!v) {
        clearErr(msgEl, 'err-g5Message');
        return true;
    }
    const ok = v.length >= minMsg;
    ok ? clearErr(msgEl, 'err-g5Message') : showErr(msgEl, 'err-g5Message');
    return ok;
}

function validateAtLeastEmailOrPhone() {
    const hasAny = emailEl.value.trim() || phoneEl.value.trim();
    if (!hasAny) {
        showErr(emailEl, 'err-g5Email');
        showErr(phoneEl, 'err-g5Phone');
    }
    return !!hasAny;
}

[nameEl, emailEl, phoneEl, msgEl].forEach(el => {
    el.addEventListener('input', () => {
        if (el === nameEl) validateName();
        if (el === emailEl) validateEmail();
        if (el === phoneEl) validatePhone();
        if (el === msgEl) validateMsg();
    });
    el.addEventListener('blur', () => el.dispatchEvent(new Event('input')));
});

function showToast(msg, isError = false) {
    toast.textContent = msg;
    toast.classList.toggle('error', !!isError);
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

function openModal() {
    backdrop.style.display = "flex";
    backdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    backdrop.style.display = "none";
    backdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = '';
    form.reset();
    [nameEl, emailEl, phoneEl, msgEl].forEach(el => el.setAttribute('aria-invalid', 'false'));
    ['err-g5Name', 'err-g5Email', 'err-g5Phone', 'err-g5Message'].forEach(id => {
        const e = document.getElementById(id);
        if (e) e.style.display = 'none';
    });
}

orderBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
});

closeBtn?.addEventListener('click', closeModal);

backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const okName = validateName();
    const okEmail = validateEmail();
    const okPhone = validatePhone();
    const okAny = validateAtLeastEmailOrPhone();
    const okMsg = validateMsg();

    if (!(okName && okEmail && okPhone && okAny)) {
        showToast("Vui lòng kiểm tra lại thông tin.", true);
        const invalidEl = document.querySelector('#g5ContactModal [aria-invalid="true"]');
        (invalidEl || nameEl).focus();
        return;
    }

    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const email = emailEl.value.trim();
    const message = msgEl.value.trim();

    btnSubmit.disabled = true;
    const oldText = btnSubmit.textContent;
    btnSubmit.textContent = "Đang gửi...";

    // Simulate API call
    setTimeout(() => {
        showToast("✅ Đã gửi yêu cầu thành công! Chúng tôi sẽ liên hệ sớm.");
        closeModal();
        btnSubmit.disabled = false;
        btnSubmit.textContent = oldText;
    }, 1500);
});