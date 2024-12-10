function handleLogin(event) {
    event.preventDefault(); // Evita que el formulario se envíe de manera convencional

    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;

    fetch('/cargarL', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo: email, password: password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirige a la página de verificar token
                window.location.href = '/verificar-token.html'; // Cambia esta ruta según sea necesario
            } else {
                alert(data.message || 'Error en el login');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
