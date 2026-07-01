(function () {
    'use strict';

    /* ── Helpers ── */
    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        var firstFocus = modal.querySelector('input, button, [tabindex="0"]');
        if (firstFocus) setTimeout(function () { firstFocus.focus(); }, 320);
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    /* ── Toast ── */
    var toast = $('#successToast');
    var toastText = $('#toastText');
    var toastTimer;

    function showToast(msg, durationMs) {
        toastText.textContent = msg || 'تمت العملية بنجاح';
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toast.classList.remove('is-visible');
        }, durationMs || 3000);
    }

    /* ── ADD EMPLOYEE MODAL ── */
    var addModal = $('#addModal');
    var openAddBtn = $('#openAddModal');
    var closeAddBtn = $('#closeAddModal');
    var cancelAddBtn = $('#cancelAddModal');
    var addForm = $('#addEmpForm');

    openAddBtn.addEventListener('click', function () { openModal(addModal); });
    closeAddBtn.addEventListener('click', function () { closeModal(addModal); });
    cancelAddBtn.addEventListener('click', function () { closeModal(addModal); });

    addModal.addEventListener('click', function (e) {
        if (e.target === addModal) closeModal(addModal);
    });

    // Demo: intercept form (in production, MVC handles POST)
    addForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var phone = document.getElementById('add-phone').value.trim();
        var password = document.getElementById('add-password').value.trim();
        var role = document.getElementById('add-role').value;

        if (!phone || !password) {
            showToast('من فضلك أدخل رقم الهاتف وكلمة المرور');
            return;
        }

        // تحويل الرقم لصيغة واتساب
        var whatsappNumber = phone.replace(/\D/g, '');

        // لو الرقم مصري ويبدأ بـ 0
        if (whatsappNumber.startsWith('0')) {
            whatsappNumber = '20' + whatsappNumber.substring(1);
        }

        // لو المستخدم لسه مكتبش كود الدولة
        if (whatsappNumber.startsWith('20') === false) {
            whatsappNumber = '20' + whatsappNumber;
        }

        // رابط موقعك
        var website = 'https://example.com'; // غيره برابط موقعك

        // الرسالة
        var message = `مرحباً 
تم إنشاء حسابك بنجاح.
رابط الموقع: ${website}
رقم الهاتف: ${phone}
كلمة المرور: ${password}
نتمنى لك التوفيق`;

        // ===========================
        // هنا ضع كود حفظ الموظف في الـ API (role متاح لو محتاجه)
        // ===========================

        closeModal(addModal);
        showToast('تم إضافة الموظف بنجاح');
        addForm.reset();

        // فتح واتساب
        window.open(
            'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(message),
            '_blank'
        );
    });

    /* ── DELETE MODAL ── */
    var deleteModal = $('#deleteModal');
    var cancelDeleteBtn = $('#cancelDeleteModal');
    var deleteEmpIdInput = $('#delete-emp-id');
    var deleteForm = $('#deleteEmpForm');

    cancelDeleteBtn.addEventListener('click', function () { closeModal(deleteModal); });
    deleteModal.addEventListener('click', function (e) {
        if (e.target === deleteModal) closeModal(deleteModal);
    });

    // Demo: intercept delete (production: let MVC handle POST)
    deleteForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var empId = deleteEmpIdInput.value;
        var empCard = document.querySelector('.emp-card[data-emp-id="' + empId + '"]');
        closeModal(deleteModal);
        if (empCard) {
            empCard.style.transition = 'opacity .35s, transform .35s';
            empCard.style.opacity = '0';
            empCard.style.transform = 'scale(.96)';
            setTimeout(function () { empCard.remove(); }, 380);
        }
        showToast('تم حذف الموظف بنجاح');
    });

    /* ── IMAGE VIEWER MODAL ── */
    var imgViewerModal = $('#imgViewerModal');
    var closeImgViewerBtn = $('#closeImgViewer');
    var imgViewerTitle = $('#imgViewerTitle');
    var imgViewerImg = $('#imgViewerImg');
    var imgViewerPlaceholder = $('#imgViewerPlaceholder');

    closeImgViewerBtn.addEventListener('click', function () { closeModal(imgViewerModal); });
    imgViewerModal.addEventListener('click', function (e) {
        if (e.target === imgViewerModal) closeModal(imgViewerModal);
    });

    // Delegate click on all ID doc cards
    document.addEventListener('click', function (e) {
        var card = e.target.closest('.id-doc-card');
        if (!card) return;

        var src = card.dataset.imgSrc || '';
        var title = card.dataset.imgTitle || 'صورة البطاقة';

        imgViewerTitle.textContent = title;

        if (src) {
            imgViewerImg.src = src;
            imgViewerImg.style.display = 'block';
            imgViewerPlaceholder.style.display = 'none';
        } else {
            imgViewerImg.style.display = 'none';
            imgViewerPlaceholder.style.display = 'flex';
        }

        openModal(imgViewerModal);
    });

    // Keyboard: Enter/Space on id-doc-card
    document.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('id-doc-card')) {
            e.preventDefault();
            e.target.click();
        }
    });

    /* ── EMPLOYEE CARD EXPAND / COLLAPSE ── */
    document.addEventListener('click', function (e) {
        var row = e.target.closest('.emp-row');
        if (!row) return;

        var card = row.closest('.emp-card');
        if (!card) return;

        var isExpanded = card.classList.contains('is-expanded');

        // Collapse all others first (one open at a time)
        $$('.emp-card.is-expanded').forEach(function (c) {
            if (c !== card) {
                c.classList.remove('is-expanded', 'is-editing');
                var r = c.querySelector('.emp-row');
                if (r) r.setAttribute('aria-expanded', 'false');
            }
        });

        card.classList.toggle('is-expanded', !isExpanded);
        row.setAttribute('aria-expanded', String(!isExpanded));
    });

    // Keyboard: Enter/Space to expand
    document.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('emp-row')) {
            e.preventDefault();
            e.target.click();
        }
    });

    /* ── EDIT MODE ── */
    document.addEventListener('click', function (e) {
        // Edit button
        if (e.target.closest('.btn-emp-edit')) {
            var card = e.target.closest('.emp-card');
            if (card) {
                card.classList.add('is-editing');
                var firstInput = card.querySelector('.info-input, .info-select');
                if (firstInput) setTimeout(function () { firstInput.focus(); }, 80);
            }
            return;
        }

        // Cancel edit button
        if (e.target.closest('.btn-emp-cancel')) {
            var card = e.target.closest('.emp-card');
            if (card) card.classList.remove('is-editing');
            return;
        }

        // Save button — في الإنتاج، اربطها بـ MVC form POST
        if (e.target.closest('.btn-emp-save')) {
            var card = e.target.closest('.emp-card');
            if (card) {
                var fields = card.querySelectorAll('.info-field');
                fields.forEach(function (field) {
                    var input = field.querySelector('.info-input');
                    var select = field.querySelector('.info-select');
                    var value = field.querySelector('.info-value');
                    if (!value) return;

                    if (input) {
                        if (input.type === 'password') {
                            if (input.value.trim() !== '') {
                                value.textContent = '********';
                            }
                        } else if (input.type === 'date') {
                            var birthDate = new Date(input.value);
                            var today = new Date();
                            var age = today.getFullYear() - birthDate.getFullYear();
                            var m = today.getMonth() - birthDate.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                age--;
                            }
                            value.textContent = age + ' سنة';
                        } else {
                            value.textContent = input.value;
                        }
                    }

                    if (select) {
                        value.textContent = select.options[select.selectedIndex].text;
                    }
                });
                card.classList.remove('is-editing');
                showToast('تم حفظ التعديلات بنجاح');
            }
            return;
        }

        // Delete button — يفتح مودال التأكيد
        if (e.target.closest('.btn-emp-delete')) {
            var card = e.target.closest('.emp-card');
            if (card) {
                deleteEmpIdInput.value = card.dataset.empId || '';
                openModal(deleteModal);
            }
            return;
        }
    });

    /* ── BLOCK / UNBLOCK STATUS ── */
    var statusModal = $('#statusModal');
    var statusForm = $('#statusForm');
    var currentStatusBtn = null;

    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.btn-emp-status');
        if (!btn) return;

        currentStatusBtn = btn;

        var blocked = btn.dataset.blocked === 'true';
        var card = btn.closest('.emp-card');

        document.getElementById('status-emp-id').value = card ? card.dataset.empId : '';

        document.getElementById('statusTitle').textContent =
            blocked ? 'فك حظر الموظف' : 'حظر الموظف';

        document.getElementById('statusText').textContent =
            blocked ? 'هل تريد فك حظر هذا الموظف؟' : 'هل تريد حظر هذا الموظف؟';

        document.getElementById('statusBtn').textContent =
            blocked ? 'فك الحظر' : 'حظر';

        openModal(statusModal);
    });

    document.getElementById('cancelStatusModal').addEventListener('click', function () {
        closeModal(statusModal);
    });

    statusModal.addEventListener('click', function (e) {
        if (e.target === statusModal) closeModal(statusModal);
    });

    statusForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // هنا هتحط استدعاء الـ API أو الـ MVC

        var btn = currentStatusBtn;
        if (!btn) return;

        var icon = btn.querySelector('.status-icon');
        var text = btn.querySelector('span');

        if (btn.dataset.blocked === 'false') {
            btn.dataset.blocked = 'true';
            text.textContent = 'فك الحظر';

            icon.innerHTML = `
                <path d="M18 8A6 6 0 0 0 8 8v4"></path>
                <rect x="5" y="12" width="14" height="8" rx="2"></rect>
            `;

            showToast('تم حظر الموظف');
        } else {
            btn.dataset.blocked = 'false';
            text.textContent = 'حظر';

            icon.innerHTML = `
                <path d="M18 8A6 6 0 0 0 6 8v4"></path>
                <rect x="5" y="12" width="14" height="8" rx="2"></rect>
            `;

            showToast('تم فك حظر الموظف');
        }

        closeModal(statusModal);
    });

    /* ── ESC key to close any open modal ── */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            [addModal, deleteModal, imgViewerModal, statusModal].forEach(function (m) {
                if (m && m.classList.contains('is-open')) closeModal(m);
            });
        }
    });

})();