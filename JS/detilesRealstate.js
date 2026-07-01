(function () {
    'use strict';

    /* ───────────────────────────────────────────────
        HELPERS
    ─────────────────────────────────────────────── */
    /**
     * Shorthand querySelector.
     * @param {string} sel
     * @param {Element} [ctx=document]
     * @returns {Element|null}
     */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);

    /**
     * Shorthand querySelectorAll → Array.
     * @param {string} sel
     * @param {Element} [ctx=document]
     * @returns {Element[]}
     */
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    /* ───────────────────────────────────────────────
        MODAL MANAGER
        Manages open/close of all .nq-modal-overlay elements.
    ─────────────────────────────────────────────── */
    const Modal = {
        /**
         * @param {HTMLElement} overlay
         */
        open(overlay) {
            overlay.classList.add('is-open');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            // Focus first interactive element inside modal
            const firstFocusable = overlay.querySelector(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 300);
            }
        },

        /**
         * @param {HTMLElement} overlay
         */
        close(overlay) {
            overlay.classList.remove('is-open');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        },

        /** Close all open modals. */
        closeAll() {
            $$('.nq-modal-overlay.is-open').forEach(m => this.close(m));
        }
    };

    /* ───────────────────────────────────────────────
        TOAST NOTIFICATIONS
    ─────────────────────────────────────────────── */
    const Toast = {
        _el: null,
        _timer: null,

        init() {
            this._el = $('#nqToast');
        },

        /**
         * @param {string} message
         * @param {'success'|'info'} [type='success']
         * @param {number} [duration=2800]
         */
        show(message, type = 'success', duration = 2800) {
            if (!this._el) return;
            const textEl = this._el.querySelector('.nq-toast-text');
            if (textEl) textEl.textContent = message;
            this._el.classList.add('is-visible');
            clearTimeout(this._timer);
            this._timer = setTimeout(() => {
                this._el.classList.remove('is-visible');
            }, duration);
        }
    };

    /* ───────────────────────────────────────────────
        HAMBURGER DRAWER
    ─────────────────────────────────────────────── */
    const Drawer = {
        _overlay: null,
        _drawer: null,

        init() {
            this._overlay = $('#nqDrawerOverlay');
            this._drawer = $('#nqDrawer');
            if (!this._overlay || !this._drawer) return;

            const openBtn = $('#nqHamburgerBtn');
            const closeBtn = $('#nqDrawerClose');

            openBtn?.addEventListener('click', () => this.open());
            closeBtn?.addEventListener('click', () => this.close());
            this._overlay.addEventListener('click', () => this.close());
        },

        open() {
            this._overlay.classList.add('is-open');
            this._drawer.classList.add('is-open');
            this._drawer.setAttribute('aria-hidden', 'false');
        },

        close() {
            this._overlay.classList.remove('is-open');
            this._drawer.classList.remove('is-open');
            this._drawer.setAttribute('aria-hidden', 'true');
        }
    };

    /* ───────────────────────────────────────────────
        LIGHTBOX / IMAGE VIEWER
        Reads image URLs from .nq-gallery-thumb[data-full-src]
        and .nq-gallery-main[data-full-src].
    ─────────────────────────────────────────────── */
    const Lightbox = {
        _overlay: null,
        _img: null,
        _counter: null,
        _images: [],    // array of { src, alt }
        _current: 0,

        init() {
            this._overlay = $('#nqLightbox');
            this._img = $('#nqLightboxImg');
            this._counter = $('#nqLightboxCounter');
            if (!this._overlay) return;

            // Collect all gallery images in order
            this._images = $$('[data-lightbox-src]').map(el => ({
                src: el.dataset.lightboxSrc || '',
                alt: el.dataset.lightboxAlt || ''
            }));

            // Open on main image click
            const mainTrigger = $('#nqGalleryMain');
            mainTrigger?.addEventListener('click', () => this.open(0));

            // Open on thumbnail click
            $$('.nq-gallery-thumb').forEach((thumb, idx) => {
                thumb.addEventListener('click', () => this.open(idx));
                thumb.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.open(idx);
                    }
                });
            });

            // Close button
            $('#nqLightboxClose')?.addEventListener('click', () => this.close());

            // Overlay background click closes
            this._overlay.addEventListener('click', e => {
                if (e.target === this._overlay) this.close();
            });

            // Keyboard navigation
            document.addEventListener('keydown', e => {
                if (!this._overlay.classList.contains('is-open')) return;
                if (e.key === 'Escape') this.close();
                if (e.key === 'ArrowLeft') this.navigate(1);
                if (e.key === 'ArrowRight') this.navigate(-1);
            });
        },

        /**
         * @param {number} index
         */
        open(index) {
            if (!this._overlay) return;
            this._current = index;
            this._render();
            this._overlay.classList.add('is-open');
            this._overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            $('#nqLightboxClose')?.focus();
        },

        close() {
            this._overlay.classList.remove('is-open');
            this._overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        },

        /**
         * @param {number} dir — +1 = next, -1 = prev
         */
        navigate(dir) {
            if (!this._images.length) return;
            this._current = (this._current + dir + this._images.length) % this._images.length;
            this._render();
        },

        _render() {
            const item = this._images[this._current];
            if (!item || !this._img) return;
            this._img.src = item.src;
            this._img.alt = item.alt;
            if (this._counter) {
                this._counter.textContent = `${this._current + 1} / ${this._images.length}`;
            }
            // Update active thumbnail
            $$('.nq-gallery-thumb').forEach((t, i) => {
                t.classList.toggle('is-active', i === this._current);
            });
        }
    };

    /* ───────────────────────────────────────────────
        GALLERY MAIN IMAGE SWAP (thumbnails → main)
        Also updates the lightbox target.
    ─────────────────────────────────────────────── */
    const GallerySwap = {
        init() {
            const mainImg = $('#nqGalleryMainImg');
            if (!mainImg) return;

            $$('.nq-gallery-thumb').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    const src = thumb.dataset.lightboxSrc || thumb.querySelector('img')?.src || '';
                    const alt = thumb.dataset.lightboxAlt || '';
                    if (src && mainImg) {
                        mainImg.src = src;
                        mainImg.alt = alt;
                    }
                    // Update active state
                    $$('.nq-gallery-thumb').forEach(t => t.classList.remove('is-active'));
                    thumb.classList.add('is-active');
                });
            });

            // Mark first as active on init
            $$('.nq-gallery-thumb')[0]?.classList.add('is-active');
        }
    };

    /* ───────────────────────────────────────────────
        DELETE MODAL
    ─────────────────────────────────────────────── */
    const DeleteModal = {
        init() {
            const overlay = $('#nqDeleteModal');
            const openBtn = $('#nqDeleteBtn');
            const closeBtn = $('#nqDeleteModalClose');
            const cancelBtn = $('#nqDeleteCancelBtn');
            const form = $('#nqDeleteForm');

            openBtn?.addEventListener('click', () => Modal.open(overlay));
            closeBtn?.addEventListener('click', () => Modal.close(overlay));
            cancelBtn?.addEventListener('click', () => Modal.close(overlay));
            overlay?.addEventListener('click', e => {
                if (e.target === overlay) Modal.close(overlay);
            });
            form?.addEventListener('submit', e => {
                e.preventDefault(); 
                Modal.close(overlay);
                Toast.show('تم حذف العقار بنجاح');
            });
        }
    };

    /* ───────────────────────────────────────────────
        SOLD MODAL
    ─────────────────────────────────────────────── */
    const SoldModal = {
        init() {
            const overlay = $('#nqSoldModal');
            const openBtn = $('#nqSoldBtn');
            const closeBtn = $('#nqSoldModalClose');
            const cancelBtn = $('#nqSoldCancelBtn');
            const form = $('#nqSoldForm');

            openBtn?.addEventListener('click', () => Modal.open(overlay));
            closeBtn?.addEventListener('click', () => Modal.close(overlay));
            cancelBtn?.addEventListener('click', () => Modal.close(overlay));
            overlay?.addEventListener('click', e => {
                if (e.target === overlay) Modal.close(overlay);
            });

            form?.addEventListener('submit', e => {
                e.preventDefault();
                Modal.close(overlay);
                Toast.show('تم تغيير حالة العقار إلى "تم البيع"');
            });
        }
    };

    /* ───────────────────────────────────────────────
        ADD VISIT MODAL
    ─────────────────────────────────────────────── */
    const AddVisitModal = {
        _starRating: 0,

        init() {
            const overlay = $('#nqAddVisitModal');
            const openBtn = $('#nqAddVisitBtn');
            const closeBtn = $('#nqAddVisitClose');
            const cancelBtn = $('#nqAddVisitCancel');
            const form = $('#nqAddVisitForm');

            openBtn?.addEventListener('click', () => {
                this._resetForm();
                Modal.open(overlay);
            });
            closeBtn?.addEventListener('click', () => Modal.close(overlay));
            cancelBtn?.addEventListener('click', () => Modal.close(overlay));
            overlay?.addEventListener('click', e => {
                if (e.target === overlay) Modal.close(overlay);
            });

            // Star rating interaction
            this._initStars();

            form?.addEventListener('submit', e => {
                e.preventDefault(); // Remove in production
                Modal.close(overlay);
                Toast.show('تم إضافة المعاينة بنجاح');
            });
        },

        _initStars() {
            const stars = $$('.nq-star-btn[data-star]');

            stars.forEach(btn => {
                const val = parseInt(btn.dataset.star, 10);

                btn.addEventListener('mouseenter', () => {
                    stars.forEach(s => {
                        const sv = parseInt(s.dataset.star, 10);
                        s.classList.toggle('is-hover', sv <= val);
                    });
                });

                btn.addEventListener('mouseleave', () => {
                    stars.forEach(s => s.classList.remove('is-hover'));
                });

                btn.addEventListener('click', () => {
                    this._starRating = val;
                    const ratingInput = $('#nqVisitRating');
                    if (ratingInput) ratingInput.value = val;
                    stars.forEach(s => {
                        const sv = parseInt(s.dataset.star, 10);
                        s.classList.toggle('is-active', sv <= val);
                    });
                });

                btn.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        btn.click();
                    }
                });
            });
        },

        _resetForm() {
            const form = $('#nqAddVisitForm');
            if (form) {
                // Preserve read-only employee name
                const empNameVal = $('#nqVisitEmployee')?.value;
                form.reset();
                const empInput = $('#nqVisitEmployee');
                if (empInput && empNameVal) empInput.value = empNameVal;
            }
            this._starRating = 0;
            $$('.nq-star-btn').forEach(s => s.classList.remove('is-active', 'is-hover'));
        }
    };

    /* ───────────────────────────────────────────────
        ESCAPE KEY — closes any open modal
    ─────────────────────────────────────────────── */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') Modal.closeAll();
    });

    /* ───────────────────────────────────────────────
        SCROLL REVEAL — lightweight IntersectionObserver
        Adds .is-revealed to cards as they enter viewport.
    ─────────────────────────────────────────────── */
    const ScrollReveal = {
        init() {
            if (!('IntersectionObserver' in window)) return;

            const observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-revealed');
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.08 }
            );

            $$('.nq-card, .nq-visit-card, .nq-note-card').forEach(el => {
                observer.observe(el);
            });
        }
    };

    /* ───────────────────────────────────────────────
        VISIT CARD — expand/collapse notes
        Not required by spec but enhances UX on long pages.
    ─────────────────────────────────────────────── */
    const VisitExpand = {
        init() {
            $$('.nq-visit-toggle').forEach(btn => {
                btn.addEventListener('click', () => {
                    const card = btn.closest('.nq-visit-card');
                    const body = card?.querySelector('.nq-visit-expandable');
                    if (!body) return;
                    const isExpanded = body.classList.toggle('is-open');
                    btn.setAttribute('aria-expanded', String(isExpanded));
                });
            });
        }
    };
    /* ───────────────────────────────────────────────
    SUGGESTED PROPERTIES — Expand / Collapse
    ─────────────────────────────────────────────── */
    const SuggestedProperties = {
        init() {
            $$('.nq-suggest-header').forEach(btn => {
                btn.addEventListener('click', () => {
                    const card = btn.closest('.nq-suggest-card');
                    if (!card) return;
                    const details = card.querySelector('.nq-suggest-details');
                    const icon = card.querySelector('.nq-expand-icon');
                    if (!details) return;
                    const isOpen = card.classList.toggle('is-open');
                    // تغيير حالة aria
                    btn.setAttribute(
                        'aria-expanded',
                        String(isOpen)
                    );
                    // فتح التفاصيل
                    if (isOpen) {
                        details.style.maxHeight =
                            details.scrollHeight + "px";
                        if(icon)
                            icon.textContent = "▲";
                    } else {
                        details.style.maxHeight = "0px";
                        if(icon)
                            icon.textContent = "▼";
                    }
                });
            });
        }
    };
    /* ───────────────────────────────────────────────
        BOOTSTRAP TOOLTIP INIT (for icon buttons)
    ─────────────────────────────────────────────── */
    const BootstrapTooltips = {
        init() {
            if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) return;
            $$('[data-bs-toggle="tooltip"]').forEach(el => {
                new bootstrap.Tooltip(el, { placement: 'bottom' });
            });
        }
    };

    /* ───────────────────────────────────────────────
        BOOT — DOMContentLoaded
    ─────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', () => {
        Toast.init();
        Drawer.init();
        Lightbox.init();
        GallerySwap.init();
        DeleteModal.init();
        SoldModal.init();
        AddVisitModal.init();
        ScrollReveal.init();
        VisitExpand.init();
        SuggestedProperties.init();
        BootstrapTooltips.init();
    });

})();