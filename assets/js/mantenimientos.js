document.addEventListener('DOMContentLoaded', () => {
    loadConsolas();


    document.querySelectorAll('input[name="marca"]').forEach((radio) => {
        radio.addEventListener('change', filterConsolas);
    });

    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', () => {
            const idconsolas = button.getAttribute('data-id');
            eliminarConsola(idconsolas);
        });
    });

});

function loadConsolas() {
    fetch('/api/consolas')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('consolasTableBody');
            tableBody.innerHTML = '';

            data.forEach(consola => {
                const consolaCard = `
                <div class="card" style="width: 18rem;">
                    <img src="../uploads/${consola.img}" class="card-img-top" alt="${consola.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">Nombe: ${consola.nombre}</h5>    
                        <p class="card-text">ID: ${consola.idconsolas}</p>
                        <p class="card-text"> Descripcion: ${consola.descripcion}</p>
                        <p class="card-text"><strong>Precio: </strong>${consola.precio}</p>
                        <button class="btn btn-danger btn-eliminar" data-id="${consola.idconsolas}">Eliminar</button>


                    </div>
                </div>
                <br>
            `;
                tableBody.innerHTML += consolaCard;
            });


            document.querySelectorAll('.btn-eliminar').forEach(button => {
                button.addEventListener('click', () => {
                    const idconsolas = button.getAttribute('data-id');
                    eliminarConsola(idconsolas);
                });
            });
        })
        .catch(error => console.error('Error al cargar consolas:', error));
}

function filterConsolas() {
    const selectedMarca = document.querySelector('input[name="marca"]:checked')?.value;
    if (!selectedMarca) return;

    fetch(`/api/consolas?marca=${selectedMarca}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('consolasTableBody');
            tableBody.innerHTML = '';

            data.forEach(consola => {
                const consolaCard = `
                <div class="card" style="width: 18rem;">
                    <img src="../uploads/${consola.img}" class="card-img-top" alt="${consola.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">Nombe: ${consola.nombre}</h5>    
                        <p class="card-text">ID: ${consola.idconsolas}</p>
                        <p class="card-text"> Descripcion: ${consola.descripcion}</p>
                        <p class="card-text"><strong>Precio: </strong>${consola.precio}</p>
                        <button class="btn btn-danger btn-eliminar" data-id="${consola.idconsolas}">Eliminar</button>


                    </div>
                </div>
                <br>
            `;
                tableBody.innerHTML += consolaCard;
            });


            addDeleteEventListeners();
        })
        .catch(error => console.error('Error al filtrar consolas:', error));
}

function loadJuegos() {
    fetch('/api/juegos')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('consolasTableBody');
            tableBody.innerHTML = '';

            data.forEach(juego => {
                const row = `
                    <tr class="consola-item">
                        <td>${juego.idvideo_juegos}</td>
                        <td>${juego.marca}</td>
                        <td>${juego.nombre}</td>
                        <td>${juego.descripcion}</td>
                        <td>${juego.precio}</td>
                        <td><img src="../uploads/${juego.img}" alt="${juego.nombre}" style="width: 50px;"></td>
                        <td>
                            <button class="btn btn-danger btn-eliminar" data-id="${juego.idvideo_juegos}">Eliminar</button>
                        </td>
                    </tr>
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
            const tableBody = document.getElementById('consolasTableBody');
            tableBody.innerHTML = '';

            data.forEach(juego => {
                const row = `
                    <tr class="consola-item">
                        <td>${juego.idvideo_juegos}</td>
                        <td>${juego.marca}</td>
                        <td>${juego.nombre}</td>
                        <td>${juego.descripcion}</td>
                        <td>${juego.precio}</td>
                        <td><img src="../uploads/${juego.img}" alt="${juego.nombre}" style="width: 50px;"></td>
                        <td>
                            <button class="btn btn-danger btn-eliminar" data-id="${juego.idvideo_juegos}">Eliminar</button>
                        </td>
                    </tr>
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
            const idconsolas = button.getAttribute('data-id');
            eliminarConsola(idconsolas);
        });

    });
}


function updateConsola(data) {
    fetch('/api/consolas', {
        method: 'PUT',
        body: JSON.stringify(Object.fromEntries(data)),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                loadConsolas();

            } else {
                alert('Error al actualizar consola.');
            }
        })
        .catch(error => console.error('Error al actualizar consola:', error));
}



function eliminarConsola(id) {
    if (confirm("¿Estás seguro que deseas eliminar esta consola?")) {
        fetch(`/api/consolas/${id}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    alert("Consola eliminada");
                    loadConsolas();
                } else {
                    alert("Error al eliminar consola");
                    console.error('Error en la respuesta:', response.status, response.statusText);
                }
            })
            .catch(error => console.error('Error en la petición:', error));
    }
}

