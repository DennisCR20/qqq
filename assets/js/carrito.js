const mostrarCarrito = () => {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const carritoDiv = document.getElementById('carrito');

    if (carrito.length === 0) {
        carritoDiv.innerHTML = '<p>No hay productos en el carrito.</p>';
        return;
    }

    carrito.forEach((item, index) => {
        const itemDiv = `
            <div class="card mb-3" style="max-width: 540px;">
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="../uploads/${item.img}" class="img-fluid rounded-start" alt="${item.nombre}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${item.nombre}</h5>
                            <p class="card-text"><strong>Precio: </strong>${item.precio}</p>
                            <button class="btn btn-outline-danger" onclick="eliminarProducto(${index})">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        carritoDiv.innerHTML += itemDiv;
    });
};

// Función para eliminar un producto del carrito y refrescar la página
const eliminarProducto = (index) => {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.splice(index, 1); // Elimina el producto en la posición indicada
    localStorage.setItem('carrito', JSON.stringify(carrito)); // Actualiza el localStorage
    location.reload(); // Refresca la página después de eliminar el producto
};

// Llama a la función para mostrar el carrito al cargar la página
mostrarCarrito();

document.getElementById('limpiar-carrito').addEventListener('click', () => {
    localStorage.removeItem('carrito');
    alert('Carrito limpiado.');
    location.reload(); // Recargar la página para actualizar la vista
});
