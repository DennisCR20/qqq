const agregarAlCarrito = (accesorio) => {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push(accesorio);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    console.log('Carrito actualizado:', carrito); // Esto te permitirá ver el carrito actualizado
};
fetch('/api/accesorios')
    .then(response => response.json())
    .then(accesorios => {
        const accesoriosSection = document.getElementById('accesorios');
        accesorios.forEach(accesorios => {

            const accesoriosCard = `
                <div class="card" style="width: 18rem;">
                    <img src="../uploads/${accesorios.img}" class="card-img-top" alt="${accesorios.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${accesorios.nombre}</h5>
                        <p class="card-text">${accesorios.descripcion}</p>
                        <p class="card-text"><strong>Precio: </strong>${accesorios.precio}</p>
                        <button class="btn btn-primary agregar-carrito" data-id="${accesorios.idaccesorios}" data-nombre="${accesorios.nombre}" data-precio="${accesorios.precio}" data-img="${accesorios.img}">Agregar al Carrito</button>
                    </div>
                </div>
                <br>
            `;
            accesoriosSection.innerHTML += accesoriosCard;
        });
        const botonesAgregar = document.querySelectorAll('.agregar-carrito');
        botonesAgregar.forEach(boton => {
            boton.addEventListener('click', (event) => {
                console.log('Botón clicado:', event.target); // Esto confirmará que el evento se está disparando
                const id = event.target.getAttribute('data-id');
                const nombre = event.target.getAttribute('data-nombre');
                const precio = event.target.getAttribute('data-precio');
                const img = event.target.getAttribute('data-img');

                const accesorio = { id, nombre, precio, img };
                agregarAlCarrito(accesorio);
            });
        });
    })
    .catch(error => console.error('Error al obtener juegos:', error));


document.getElementById('consolaForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const marca = document.querySelector('input[name="marca"]:checked');


    if (marca) {
        const marcaValue = marca.value;


        const accesorioData = {
            nombre: 'Nombre del Accesorio',
            descripcion: 'Descripción del Accesorio',
            precio: 350000.00,
            img: 'nombre_de_la_imagen.jpg',
            marca: marcaValue
        };

        fetch('/api/accesorios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(accesorioData)
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
