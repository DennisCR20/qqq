const agregarAlCarrito = (consola) => {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push(consola);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    console.log('Carrito actualizado:', carrito); // Esto te permitirá ver el carrito actualizado
};


fetch('/api/consolas')
    .then(response => response.json())
    .then(consolas => {
        const consolasSection = document.getElementById('consolas');
        consolas.forEach(consola => {
            const consolaCard = `
                <div class="card" style="width: 18rem;">
                    <img src="../uploads/${consola.img}" class="card-img-top" alt="${consola.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${consola.nombre}</h5>
                        <p class="card-text">${consola.descripcion}</p>
                        <p class="card-text"><strong>Precio: </strong>${consola.precio}</p>
                        <button class="btn btn-primary agregar-carrito" data-id="${consola.idconsolas}" data-nombre="${consola.nombre}" data-precio="${consola.precio}" data-img="${consola.img}">Agregar al Carrito</button>
                    </div>
                </div>
                <br>
            `;
            consolasSection.innerHTML += consolaCard;
        });

        const botonesAgregar = document.querySelectorAll('.agregar-carrito');
        botonesAgregar.forEach(boton => {
            boton.addEventListener('click', (event) => {
                console.log('Botón clicado:', event.target); // Esto confirmará que el evento se está disparando
                const id = event.target.getAttribute('data-id');
                const nombre = event.target.getAttribute('data-nombre');
                const precio = event.target.getAttribute('data-precio');
                const img = event.target.getAttribute('data-img');

                const consola = { id, nombre, precio, img };
                agregarAlCarrito(consola);
            });
        });
    })
    .catch(error => console.error('Error al obtener consolas:', error));


document.getElementById('consolaForm').addEventListener('submit', function (event) {
    event.preventDefault();


    const marca = document.querySelector('input[name="marca"]:checked');


    if (marca) {
        const marcaValue = marca.value;


        const consolaData = {
            nombre: 'Nombre de la Consola',
            descripcion: 'Descripción de la Consola',
            precio: 350000.00,
            img: 'nombre_de_la_imagen.jpg',
            marca: marcaValue
        };


        fetch('/api/consolas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(consolaData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Consola guardada:', data);

            })
            .catch(error => console.error('Error al guardar la consola:', error));
    } else {
        alert('Por favor selecciona una marca.');
    }
});
document.querySelectorAll('input[name="marca"]').forEach((radio) => {
    radio.addEventListener('change', filterConsolas);
});
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