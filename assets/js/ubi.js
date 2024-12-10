document.addEventListener('DOMContentLoaded', () => {
    loadpais();
    loadprovincia();
    loadcanton();
    loaddistrito();

    // Listener para cuando el usuario seleccione un país
    const paisSelect = document.getElementById('pais');
    paisSelect.addEventListener('change', () => {
        const paisId = paisSelect.value;  // Obtener el ID del país seleccionado
        if (paisId) {
            loadprovincia(paisId);  // Cargar las provincias según el país seleccionado
        }
    });

    const provinciaSelect = document.getElementById('provincia');
    provinciaSelect.addEventListener('change', () => {
        const provinciaId = provinciaSelect.value;  // Obtener el ID del país seleccionado
        if (provinciaId) {
            loadcanton(provinciaId);  // Cargar las provincias según el país seleccionado
        }
    });
    const cantonSelect = document.getElementById('canton');
    cantonSelect.addEventListener('change', () => {
        const cantonId = cantonSelect.value;  // Obtener el ID del país seleccionado
        if (cantonId) {
            loaddistrito(cantonId);  // Cargar las provincias según el país seleccionado
        }
    });


});

function loadpais() {
    fetch('/api/ubicaciones/paises')
        .then(response => response.json())
        .then(data => {
            const paisSelect = document.getElementById('pais');  // Seleccionar el <select> ya existente
            paisSelect.innerHTML = '<option value="">Seleccione un país</option>';  // Resetear las opciones

            data.forEach(pais => {
                const option = document.createElement('option');
                option.value = pais.idubucacion;  // Asignar el valor del ID del país
                option.textContent = pais.descripcion;  // Mostrar el nombre del país
                paisSelect.appendChild(option);  // Agregar la opción al <select>
            });
        })
        .catch(error => console.error('Error al cargar países:', error));
}

function loadprovincia(paisId) {
    fetch(`/api/ubicaciones/provincias?paisId=${paisId}`)  // Modificar la ruta para pasar el ID del país
        .then(response => response.json())
        .then(data => {
            const provinciaSelect = document.getElementById('provincia');  // Seleccionar el <select> ya existente
            provinciaSelect.innerHTML = '<option value="">Seleccione una provincia</option>';  // Resetear las opciones

            data.forEach(provincia => {
                const option = document.createElement('option');
                option.value = provincia.idubucacion;  // Asignar el valor del ID de la provincia
                option.textContent = provincia.descripcion;  // Mostrar el nombre de la provincia
                provinciaSelect.appendChild(option);  // Agregar la opción al <select>
            });
        })
        .catch(error => console.error('Error al cargar provincias:', error));
}

function loadcanton(provinciaId) {
    fetch(`/api/ubicaciones/cantones?provinciaId=${provinciaId}`)  // Pasar el ID de la provincia
        .then(response => response.json())
        .then(data => {
            const cantonSelect = document.getElementById('canton');  // Seleccionar el <select> de cantones
            cantonSelect.innerHTML = '<option value="">Seleccione un cantón</option>';  // Resetear las opciones

            data.forEach(canton => {
                const option = document.createElement('option');
                option.value = canton.idubucacion;  // Asignar el valor del ID del cantón
                option.textContent = canton.descripcion;  // Mostrar el nombre del cantón
                cantonSelect.appendChild(option);  // Agregar la opción al <select>
            });
        })
        .catch(error => console.error('Error al cargar los cantones:', error));
}

function loaddistrito(cantonId) {
    fetch(`/api/ubicaciones/distritos?cantonId=${cantonId}`)  // Pasar el ID de la provincia
        .then(response => response.json())
        .then(data => {
            const distritoSelect = document.getElementById('distrito');  // Seleccionar el <select> de cantones
            distritoSelect.innerHTML = '<option value="">Seleccione un distrito</option>';  // Resetear las opciones

            data.forEach(distrito => {
                const option = document.createElement('option');
                option.value = distrito.idubucacion;  // Asignar el valor del ID del cantón
                option.textContent = distrito.descripcion;  // Mostrar el nombre del cantón
                distritoSelect.appendChild(option);  // Agregar la opción al <select>
            });
        })
        .catch(error => console.error('Error al cargar los cantones:', error));
}