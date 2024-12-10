document.addEventListener('DOMContentLoaded', () => {
    loadAccesorios();


    document.querySelectorAll('input[name="marca"]').forEach((radio) => {
        radio.addEventListener('change', filterAccesorios);
    });

    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', () => {
            const idaccesorios = button.getAttribute('data-id');
            eliminarAccesorio(idaccesorios);
        });
    });

});

function loadAccesorios() {
    fetch('/api/accesorios')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('accesorioTableBody');
            tableBody.innerHTML = '';

            data.forEach(accesorio => {
                const row = `
                    <div class="card" style="width: 18rem;">
                    <img src="../uploads/${accesorio.img}" class="card-img-top" alt="${accesorio.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">Nombe: ${accesorio.nombre}</h5>    
                        <p class="card-text">ID: ${accesorio.idaccesorios}</p>
                        <p class="card-text"> Descripcion: ${accesorio.descripcion}</p>
                        <p class="card-text"><strong>Precio: </strong>${accesorio.precio}</p>
                        <button class="btn btn-danger btn-eliminar" data-id="${accesorio.idaccesorios}">Eliminar</button>


                    </div>
                </div>
                <br>
            `;
                tableBody.innerHTML += row;
            });


            document.querySelectorAll('.btn-eliminar').forEach(button => {
                button.addEventListener('click', () => {
                    const idaccesorios = button.getAttribute('data-id');
                    eliminarAccesorio(idaccesorios);
                });
            });
        })
        .catch(error => console.error('Error al cargar juegos:', error));
}

function filterAccesorios() {
    const selectedMarca = document.querySelector('input[name="marca"]:checked')?.value;
    if (!selectedMarca) return;

    fetch(`/api/accesorios?marca=${selectedMarca}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('accesorioTableBody');
            tableBody.innerHTML = '';

            data.forEach(accesorio => {
                const row = `
                    <div class="card" style="width: 18rem;">
                    <img src="../uploads/${accesorio.img}" class="card-img-top" alt="${accesorio.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">Nombe: ${accesorio.nombre}</h5>    
                        <p class="card-text">ID: ${accesorio.idaccesorios}</p>
                        <p class="card-text"> Descripcion: ${accesorio.descripcion}</p>
                        <p class="card-text"><strong>Precio: </strong>${accesorio.precio}</p>
                        <button class="btn btn-danger btn-eliminar" data-id="${accesorio.idaccesorios}">Eliminar</button>


                    </div>
                </div>
                <br>
            `;
                tableBody.innerHTML += row;
            });

            // Agregar el evento a los botones de eliminar después de cargar las consolas filtradas
            addDeleteEventListeners();
        })
        .catch(error => console.error('Error al filtrar juegos:', error));
}

function addDeleteEventListeners() {
    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', () => {
            const idaccesorios = button.getAttribute('data-id');
            eliminarAccesorio(idaccesorios);
        });

    });
}

function updateAccesorio(data) {
    fetch('/api/accesorios', {
        method: 'PUT',
        body: JSON.stringify(Object.fromEntries(data)),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                loadAccesorios();

            } else {
                alert('Error al actualizar juego.');
            }
        })
        .catch(error => console.error('Error al actualizar juego:', error));
}

function eliminarAccesorio(id) {
    if (confirm("¿Estás seguro que deseas eliminar este juego?")) {
        fetch(`/api/accesorios/${id}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    alert("juego eliminado");
                    loadAccesorios();
                } else {
                    alert("Error al eliminar juego");
                    console.error('Error en la respuesta:', response.status, response.statusText);
                }
            })
            .catch(error => console.error('Error en la petición:', error));
    }
}