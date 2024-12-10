document.addEventListener('DOMContentLoaded', () => {
    loadJuegos();


    document.querySelectorAll('input[name="marca"]').forEach((radio) => {
        radio.addEventListener('change', filterJuegos);
    });

    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', () => {
            const idvideo_juegos = button.getAttribute('data-id');
            eliminarJuego(idvideo_juegos);
        });
    });

});

function loadJuegos() {
    fetch('/api/juegos')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('juegoTableBody');
            tableBody.innerHTML = '';

            data.forEach(juego => {
                const row = `
                    <div class="card" style="width: 18rem;">
                    <img src="../uploads/${juego.img}" class="card-img-top" alt="${juego.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">Nombe: ${juego.nombre}</h5>    
                        <p class="card-text">ID: ${juego.idvideo_juegos}</p>
                        <p class="card-text"> Descripcion: ${juego.descripcion}</p>
                        <p class="card-text"><strong>Precio: </strong>${juego.precio}</p>
                        <button class="btn btn-danger btn-eliminar" data-id="${juego.idvideo_juegos}">Eliminar</button>


                    </div>
                </div>
                <br>
            `;
                tableBody.innerHTML += row;
            });


            document.querySelectorAll('.btn-eliminar').forEach(button => {
                button.addEventListener('click', () => {
                    const idvideo_juegos = button.getAttribute('data-id');
                    eliminarJuego(idvideo_juegos);
                });
            });
        })
        .catch(error => console.error('Error al cargar juegos:', error));
}

function filterJuegos() {
    const selectedMarca = document.querySelector('input[name="marca"]:checked')?.value;
    if (!selectedMarca) return;

    fetch(`/api/juegos?marca=${selectedMarca}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('juegoTableBody');
            tableBody.innerHTML = '';

            data.forEach(juego => {
                const row = `
                    <div class="card" style="width: 18rem;">
                    <img src="../uploads/${juego.img}" class="card-img-top" alt="${juego.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">Nombe: ${juego.nombre}</h5>    
                        <p class="card-text">ID: ${juego.idvideo_juegos}</p>
                        <p class="card-text"> Descripcion: ${juego.descripcion}</p>
                        <p class="card-text"><strong>Precio: </strong>${juego.precio}</p>
                        <button class="btn btn-danger btn-eliminar" data-id="${juego.idvideo_juegos}">Eliminar</button>


                    </div>
                </div>
                <br>
            `;
                tableBody.innerHTML += row;
            });


            addDeleteEventListeners();
        })
        .catch(error => console.error('Error al filtrar juegos:', error));
}

function addDeleteEventListeners() {
    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', () => {
            const idvideo_juegos = button.getAttribute('data-id');
            eliminarJuego(idvideo_juegos);
        });

    });
}

function updateJuego(data) {
    fetch('/api/juegos', {
        method: 'PUT',
        body: JSON.stringify(Object.fromEntries(data)),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                loadJuegos();

            } else {
                alert('Error al actualizar juego.');
            }
        })
        .catch(error => console.error('Error al actualizar juego:', error));
}

function eliminarJuego(id) {
    if (confirm("¿Estás seguro que deseas eliminar este juego?")) {
        fetch(`/api/juegos/${id}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    alert("juego eliminado");
                    loadJuegos();
                } else {
                    alert("Error al eliminar juego");
                    console.error('Error en la respuesta:', response.status, response.statusText);
                }
            })
            .catch(error => console.error('Error en la petición:', error));
    }
}