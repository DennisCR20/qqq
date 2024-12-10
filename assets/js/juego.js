const agregarAlCarrito = (juego) => {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push(juego);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    console.log('Carrito actualizado:', carrito); // Esto te permitirá ver el carrito actualizado
};
fetch('/api/juegos')
    .then(response => response.json())
    .then(juegos => {
        const juegosSection = document.getElementById('juegos');
        juegos.forEach(juego => {

            const juegoCard = `
                <div class="card" style="width: 18rem;">
                    <img src="../uploads/${juego.img}" class="card-img-top" alt="${juego.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${juego.nombre}</h5>
                        <p class="card-text">${juego.descripcion}</p>
                        <p class="card-text"><strong>Precio: </strong>${juego.precio}</p>
                        <button class="btn btn-primary agregar-carrito" data-id="${juego.idvideo_juegos}" data-nombre="${juego.nombre}" data-precio="${juego.precio}" data-img="${juego.img}">Agregar al Carrito</button>
                    </div>
                </div>
                <br>
            `;
            juegosSection.innerHTML += juegoCard;
        });
        const botonesAgregar = document.querySelectorAll('.agregar-carrito');
        botonesAgregar.forEach(boton => {
            boton.addEventListener('click', (event) => {
                console.log('Botón clicado:', event.target); // Esto confirmará que el evento se está disparando
                const id = event.target.getAttribute('data-id');
                const nombre = event.target.getAttribute('data-nombre');
                const precio = event.target.getAttribute('data-precio');
                const img = event.target.getAttribute('data-img');

                const juego = { id, nombre, precio, img };
                agregarAlCarrito(juego);
            });
        });
    })
    .catch(error => console.error('Error al obtener juegos:', error));


document.getElementById('consolaForm').addEventListener('submit', function (event) {
    event.preventDefault();


    const marca = document.querySelector('input[name="marca"]:checked');


    if (marca) {
        const marcaValue = marca.value;


        const juegoData = {
            nombre: 'Nombre del Juego',
            descripcion: 'Descripción del Juego',
            precio: 350000.00,
            img: 'nombre_de_la_imagen.jpg',
            marca: marcaValue
        };


        fetch('/api/juegos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(juegoData)
        })
            .then(response => response.json())
            .then(data => {
                console.log('juego guardado:', data);

            })
            .catch(error => console.error('Error al guardar la consola:', error));
    } else {
        alert('Por favor selecciona una marca.');
    }
});
