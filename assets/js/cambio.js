// Función para cargar las preguntas de seguridad
function cargarPreguntas() {
    const correo = document.getElementById("correo").value;

    fetch('/api/cargarPreguntas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo }),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data); // Log de la respuesta
            if (data.success) {
                document.getElementById("pregunta1Label").textContent = data.pregunta1;
                document.getElementById("pregunta2Label").textContent = data.pregunta2;
                document.getElementById("pregunta3Label").textContent = data.pregunta3;

                // Mostrar las preguntas de seguridad
                document.getElementById("preguntasSeguridad").style.display = 'block';
                document.getElementById("botonCambiarPassword").style.display = 'inline-block';
            } else {
                alert("Correo no encontrado o error al cargar las preguntas.");
            }
        })
        .catch(error => {
            console.error('Error al cargar preguntas:', error);
        });
}


// Función para cambiar la contraseña
function cambiarPassword() {
    const correo = document.getElementById("correo").value;
    const respuesta1 = document.getElementById("respuesta1").value;
    const respuesta2 = document.getElementById("respuesta2").value;
    const respuesta3 = document.getElementById("respuesta3").value;
    const nuevaPassword = document.getElementById("nuevaPassword").value;

    fetch('/api/cambiarPassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            correo,
            respuesta1,
            respuesta2,
            respuesta3,
            nuevaPassword
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Contraseña cambiada exitosamente.");
                // Limpiar el formulario o redirigir a la página de login
            } else {
                alert("Respuestas incorrectas o error al cambiar la contraseña.");
            }
        })
        .catch(error => {
            console.error('Error al cambiar la contraseña:', error);
        });
}
