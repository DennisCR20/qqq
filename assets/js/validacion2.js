const passwordInput = document.getElementById('nuevaPassword');
const validationList = {
    length: document.getElementById('length'),
    uppercase: document.getElementById('uppercase'),
    lowercase: document.getElementById('lowercase'),
    number: document.getElementById('number'),
    special: document.getElementById('special')
};

passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;

    // Validaciones
    const validations = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[\W_]/.test(password)
    };

    // Actualizar la lista de validaciones
    for (const [key, valid] of Object.entries(validations)) {
        validationList[key].className = valid ? 'valid' : 'invalid';
        validationList[key].textContent = valid ? '✓ ' + validationList[key].textContent.substring(2) : '✖ ' + validationList[key].textContent.substring(2);
    }
});