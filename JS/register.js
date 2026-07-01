document.addEventListener('DOMContentLoaded', () => {

    const form = document.querySelector('form');

    form.addEventListener('submit', function (e) {

        let isValid = true;

        document.querySelectorAll('.nq-field-error').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });

        document.querySelectorAll('.nq-input, .nq-select').forEach(el => {
            el.style.borderColor = '';
        });

        // Full Name
        const fullName = document.getElementById('FullName');
        if (fullName.value.trim().length < 5) {
            showError(fullName, 'يرجى إدخال الاسم بالكامل');
            isValid = false;
        }

        // Email
        const email = document.getElementById('Email');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email.value.trim())) {
            showError(email, 'يرجى إدخال بريد إلكتروني صحيح');
            isValid = false;
        }

        // Date
        const dob = document.getElementById('DateOfBirth');
        if (!dob.value) {
            showError(dob, 'يرجى اختيار تاريخ الميلاد');
            isValid = false;
        }

        // Gender
        const gender = document.getElementById('Gender');
        if (!gender.value) {
            showError(gender, 'يرجى اختيار النوع');
            isValid = false;
        }

        // Marital Status
        const marital = document.getElementById('MaritalStatus');
        if (!marital.value) {
            showError(marital, 'يرجى اختيار الحالة الاجتماعية');
            isValid = false;
        }

        // Front ID
        const idFront = document.getElementById('IdFront');
        if (idFront.files.length === 0) {
            showFileError('IdFront-error', 'يرجى رفع صورة وجه البطاقة');
            isValid = false;
        }

        // Back ID
        const idBack = document.getElementById('IdBack');
        if (idBack.files.length === 0) {
            showFileError('IdBack-error', 'يرجى رفع صورة ظهر البطاقة');
            isValid = false;
        }

        if (!isValid) {

            e.preventDefault();

            const summary = document.querySelector('.nq-validation-summary');
            summary.style.display = 'block';

            summary.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }

    });

    function showError(element, message) {

        element.style.borderColor = '#e07878';

        const error = document.getElementById(
            element.getAttribute('aria-describedby')
        );

        if (error) {
            error.textContent = message;
            error.style.display = 'block';
        }
    }

    function showFileError(id, message) {

        const error = document.getElementById(id);

        error.textContent = message;
        error.style.display = 'block';
    }

});
