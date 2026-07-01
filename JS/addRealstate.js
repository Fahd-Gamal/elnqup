(function () {
    'use strict';

    var MAX_IMAGES = 5;
    var fileInput = document.getElementById('PropertyImages');
    var countBadge = document.getElementById('imgCountBadge');
    var slots = document.querySelectorAll('.img-slot');
    var selectedFiles = [];   // array of File objects (mirrors backend IFormFile[])

    /* ── Update counter badge ── */
    function updateCounter() {
        countBadge.textContent = selectedFiles.length + ' / ' + MAX_IMAGES + ' صور';
        countBadge.style.color = selectedFiles.length >= MAX_IMAGES
            ? 'rgba(212,175,55,1)' : 'rgba(212,175,55,.75)';
    }

    /* ── Render previews into slots ── */
    function renderSlots() {
        slots.forEach(function (slot, i) {
            var preview = slot.querySelector('.slot-img-preview');
            if (selectedFiles[i]) {
                var url = URL.createObjectURL(selectedFiles[i]);
                preview.src = url;
                slot.classList.add('is-filled');
                slot.setAttribute('aria-label', 'صورة ' + (i + 1) + ': ' + selectedFiles[i].name);
            } else {
                preview.src = '';
                slot.classList.remove('is-filled');
                slot.setAttribute('aria-label', 'موقع صورة ' + (i + 1));
            }
        });
        updateCounter();
    }

    /* ── Handle file selection ── */
    fileInput.addEventListener('change', function () {
        var newFiles = Array.from(this.files);
        var combined = selectedFiles.concat(newFiles);
        // cap at MAX_IMAGES
        if (combined.length > MAX_IMAGES) {
            combined = combined.slice(0, MAX_IMAGES);
        }
        selectedFiles = combined;
        renderSlots();
        // reset input so same file can be re-selected after removal
        this.value = '';
    });

    /* ── Remove button on each slot ── */
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.slot-remove-btn');
        if (!btn) return;
        var idx = parseInt(btn.dataset.slot, 10) - 1;
        selectedFiles.splice(idx, 1);
        renderSlots();
    });

    /* ── Keyboard on upload zone ── */
    document.getElementById('uploadZone').addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });

    /* ── Floating label: mark select as has-value on change ── */
    var selects = document.querySelectorAll('.fl-select');
    selects.forEach(function (sel) {
        sel.addEventListener('change', function () {
            this.classList.toggle('has-value', this.value !== '');
        });
        // init on page load (for MVC back-fill)
        sel.classList.toggle('has-value', sel.value !== '');
    });

    /* ── Init counter ── */
    updateCounter();

    /* ── Dynamic "add another note" field ── */
    var addNoteBtn = document.getElementById('addNoteBtn');
    var notesWrap = document.getElementById('notesWrap');
    var noteCount = 0;

    if (addNoteBtn && notesWrap) {
        addNoteBtn.addEventListener('click', function () {
            noteCount++;
            var field = document.createElement('div');
            field.className = 'fl-field extra-note-field';
            field.innerHTML =
                '<button type="button" class="extra-note-remove" aria-label="حذف الملاحظة">' +
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                '</button>' +
                '<textarea class="fl-input fl-textarea fl-notes-textarea" name="ExtraNotes[]" ' +
                'placeholder="ملاحظة إضافية..." rows="3" maxlength="1000"></textarea>';
            notesWrap.parentNode.insertBefore(field, addNoteBtn);

            field.querySelector('.extra-note-remove').addEventListener('click', function () {
                field.remove();
            });
        });
    }

    document.querySelectorAll('.number-wrap').forEach(function (wrap) {
    const input = wrap.querySelector('input[type="number"]');
    const up = wrap.querySelector('.num-up');
    const down = wrap.querySelector('.num-down');
    up.addEventListener('click', function () {
        input.stepUp();
        input.dispatchEvent(new Event('input'));
    });
    down.addEventListener('click', function () {
        input.stepDown();
        input.dispatchEvent(new Event('input'));
    });

});
})();