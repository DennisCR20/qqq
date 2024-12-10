document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // Aquí puedes usar el token para realizar alguna verificación o mostrarlo
    if (token) {
        document.querySelector('input[name="token"]').value = token; // Coloca el token en el input
    }
});