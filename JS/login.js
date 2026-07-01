// =====================================================
//      JAVASCRIPT
// ======================================================
(function () {
'use strict';
/* ──────────────────────────────────────────────
    2. LOADING SCREEN
────────────────────────────────────────────── */
const loader = document.getElementById('loader');

function dismissLoader() {
loader.classList.add('fade-out');
setTimeout(function () {
    loader.style.display = 'none';
}, 950);
}

// Wait for fonts + assets, then dismiss after 2.8s minimum
var loaderTimer = setTimeout(dismissLoader, 2800);

window.addEventListener('load', function () {
clearTimeout(loaderTimer);
var elapsed = performance.now();
var remaining = Math.max(0, 2800 - elapsed);
setTimeout(dismissLoader, remaining);
});

/* ──────────────────────────────────────────────
    3. PASSWORD TOGGLE
────────────────────────────────────────────── */
var pwInput    = document.getElementById('password');
var eyeToggle  = document.getElementById('eyeToggle');
var eyeOpen    = document.getElementById('eyeOpen');
var eyeClosed  = document.getElementById('eyeClosed');

eyeToggle.addEventListener('click', function () {
var isHidden = pwInput.type === 'password';
pwInput.type = isHidden ? 'text' : 'password';

eyeOpen.style.display   = isHidden ? 'none'  : 'block';
eyeClosed.style.display = isHidden ? 'block' : 'none';

eyeToggle.setAttribute('aria-label', isHidden ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');

// brief scale punch
eyeToggle.style.transform = 'translateY(-50%) scale(.80)';
setTimeout(function () {
    eyeToggle.style.transform = '';
}, 140);
});

/* ──────────────────────────────────────────────
    4. RIPPLE ON LOGIN BUTTON
────────────────────────────────────────────── */
var loginBtn = document.getElementById('loginBtn');

loginBtn.addEventListener('click', function (e) {
var rect = this.getBoundingClientRect();
var ripple = document.createElement('span');
ripple.className = 'ripple';
var size = Math.max(rect.width, rect.height);
var x    = e.clientX - rect.left  - size / 2;
var y    = e.clientY - rect.top   - size / 2;
ripple.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + x + 'px;top:' + y + 'px;';
this.appendChild(ripple);
setTimeout(function () { ripple.remove(); }, 580);
});

/* ──────────────────────────────────────────────
    5. FORM SUBMISSION
────────────────────────────────────────────── */
var loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', function (e) {

var phoneInput = document.getElementById('phone');
var passwordInput = document.getElementById('password');

var phone = phoneInput.value.trim();
var password = passwordInput.value.trim();

var phoneError = document.getElementById('phoneError');
var passwordError = document.getElementById('passwordError');

var isValid = true;

phoneError.textContent = '';
passwordError.textContent = '';

phoneInput.classList.remove('error');
passwordInput.classList.remove('error');

// Password Validation
if (password === '') {
    passwordError.textContent = 'يرجى إدخال كلمة المرور';
    passwordInput.classList.add('error');
    isValid = false;
}

// Phone Validation
const phoneRegex = /^01\d{9}$/;

if (phone === '') {
    phoneError.textContent = 'يرجى إدخال رقم التليفون';
    phoneInput.classList.add('error');
    isValid = false;
}
else if (!phoneRegex.test(phone)) {
    phoneError.textContent = 'رقم التليفون يجب أن يبدأ بـ 01 ويتكون من 11 رقم';
    phoneInput.classList.add('error');
    isValid = false;
}

if (!isValid) {
    e.preventDefault();
    shakeCard();
    return;
}
});
document.getElementById('phone').addEventListener('input', function () {
this.value = this.value.replace(/\D/g, '').slice(0, 11);
});
function shakeCard() {
var card = document.querySelector('.login-card');
card.style.animation = 'none';
card.style.transform = 'translateX(-8px)';
setTimeout(function () { card.style.transform = 'translateX(8px)'; },  80);
setTimeout(function () { card.style.transform = 'translateX(-5px)'; }, 160);
setTimeout(function () { card.style.transform = 'translateX(5px)'; },  240);
setTimeout(function () { card.style.transform = 'translateX(0)'; },    320);
}

/* ──────────────────────────────────────────────
    6. PARTICLE CANVAS
────────────────────────────────────────────── */
var canvas = document.getElementById('particle-canvas');
var ctx    = canvas.getContext('2d');
var W, H;
var particles = [];
var RAF;

function resize() {
W = canvas.width  = window.innerWidth;
H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function rand(min, max) { return Math.random() * (max - min) + min; }

function Particle() {
this.reset();
}
Particle.prototype.reset = function () {
this.x     = rand(0, W);
this.y     = rand(H * .5, H * 1.1);
this.r     = rand(.8, 2.8);
this.vy    = rand(-.55, -.18);
this.vx    = rand(-.15, .15);
this.life  = 0;
this.maxLife = rand(160, 380);
this.phase = rand(0, Math.PI * 2);
};
Particle.prototype.update = function () {
this.x += this.vx + Math.sin(this.life * .03 + this.phase) * .18;
this.y += this.vy;
this.life++;
if (this.y < -10 || this.life > this.maxLife) this.reset();
};
Particle.prototype.draw = function () {
var progress = this.life / this.maxLife;
var alpha    = Math.sin(progress * Math.PI) * .75;
ctx.beginPath();
ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
ctx.fillStyle   = 'rgba(212,175,55,' + alpha + ')';
ctx.shadowBlur  = 7;
ctx.shadowColor = 'rgba(212,175,55,' + (alpha * .6) + ')';
ctx.fill();
};

// Init pool — spread across screen
for (var i = 0; i < 72; i++) {
var p = new Particle();
p.y    = rand(0, H);
p.life = rand(0, p.maxLife);
particles.push(p);
}

function animateParticles() {
ctx.clearRect(0, 0, W, H);
ctx.shadowBlur = 0;
for (var j = 0; j < particles.length; j++) {
    particles[j].update();
    particles[j].draw();
}
RAF = requestAnimationFrame(animateParticles);
}
animateParticles();
/* Pause when tab hidden */
document.addEventListener('visibilitychange', function () {
if (document.hidden) {
    cancelAnimationFrame(RAF);
} else {
    animateParticles();
}
});
})();
let deferredPrompt;

const popup = document.getElementById("install-popup");
const installBtn = document.getElementById("installBtn");
const closeBtn = document.getElementById("closeBtn");

window.addEventListener("beforeinstallprompt", (e) => {

    e.preventDefault();

    deferredPrompt = e;

    const isInstalled =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

    if (!isInstalled) {
        popup.style.display = "flex";
    }
});

installBtn.addEventListener("click", async () => {

    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
        popup.style.display = "none";
    }

    deferredPrompt = null;
});

closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
});

window.addEventListener("appinstalled", () => {
    popup.style.display = "none";
});