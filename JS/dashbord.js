// Dynamic Greeting
function setGreeting() {
    const hour = new Date().getHours();
    const greetingEl = document.getElementById('greeting');
    if (hour >= 5 && hour < 12) {
        greetingEl.textContent = 'صباح الخير 👋';
    } else if (hour >= 12 && hour < 17) {
        greetingEl.textContent = 'مساء الخير 👋';
    } else {
        greetingEl.textContent = 'مساء الخير 👋';
    }
}

// Initialize
window.onload = function () {
    setGreeting();
};
/* ===========================
   Add Section Modal
=========================== */

const addSectionModal = document.getElementById("addSectionModal");

const openSectionBtn = document.getElementById("openSectionModal");
const menuAddSection = document.getElementById("menuAddSection");

const closeSectionBtn = document.getElementById("closeSectionModal");
const cancelSectionBtn = document.getElementById("cancelSectionModal");

function openSectionModal() {
    addSectionModal.classList.add("is-open");
    document.body.style.overflow = "hidden";

    // يقفل القائمة الجانبية لو مفتوحة
    if (typeof toggleMenu === "function") {
        const menu = document.getElementById("sideMenu");
        if (menu && !menu.classList.contains("-right-80")) {
            toggleMenu();
        }
    }
}

function closeSectionModal() {
    addSectionModal.classList.remove("is-open");
    document.body.style.overflow = "";
}

openSectionBtn?.addEventListener("click", openSectionModal);
menuAddSection?.addEventListener("click", openSectionModal);

closeSectionBtn?.addEventListener("click", closeSectionModal);
cancelSectionBtn?.addEventListener("click", closeSectionModal);

addSectionModal?.addEventListener("click", function (e) {
    if (e.target === this) {
        closeSectionModal();
    }
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeSectionModal();
    }
});
// section form
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const text = document.getElementById("toastMessage");
    text.textContent = message;
    toast.className = "toast show " + type;
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}
const form = document.getElementById("addSectionForm");
form.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("add-section-name").value.trim();
    if (name === "") {
        showToast("اكتب اسم السكشن أولاً", "error");
        return;
    }
    showToast("تم إضافة السكشن بنجاح ✅️", "success");
    form.reset();
    closeSectionModal();
});
