document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;

    fetch('/cargarL', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.blocked) {
                // Si la cuenta está bloqueada
                document.getElementById('error-message').innerText = data.message;
                document.getElementById('attempts-message').innerText = '';
            } else {
                // Si la cuenta no está bloqueada
                document.getElementById('error-message').innerText = data.message;
                document.getElementById('attempts-message').innerText = `Te quedan ${data.attemptsLeft} intentos.`;
            }

            // Si el login es exitoso, puedes redirigir o hacer lo que desees
            if (data.success) {
                window.location.href = "/perfil.html"; // O cualquier otra página que desees redirigir
            }
        })
        .catch(error => {
            document.getElementById('error-message').innerText = "Hubo un error al procesar la solicitud.";
            document.getElementById('attempts-message').innerText = '';
            console.error('Error:', error);
        });
});
