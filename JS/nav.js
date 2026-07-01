
/* ──────────────────────────────────────────────
    1. THEME
────────────────────────────────────────────── */
const body        = document.body;
const themeToggle = document.getElementById('themeToggle');
const THEME_KEY   = 'naqeeb-theme';

function applyTheme(t) {
body.setAttribute('data-theme', t);
try { localStorage.setItem(THEME_KEY, t); } catch (_) {}
}

(function initTheme() {
let saved = 'dark';
try { saved = localStorage.getItem(THEME_KEY) || 'dark'; } catch (_) {}
applyTheme(saved);
})();

themeToggle.addEventListener('click', function () {
const current = body.getAttribute('data-theme') || 'dark';
applyTheme(current === 'dark' ? 'light' : 'dark');
});
// humborger
    function toggleMenu() {

    document
        .getElementById("sideMenu")
        ?.classList.toggle("is-open");

    document
        .getElementById("sideMenuOverlay")
        ?.classList.toggle("is-open");
}