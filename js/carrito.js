// Carrito de compras persistido en LocalStorage

const cantCarrito = document.getElementById('cant-carrito');

// Array para almacenar el carrito de compras
let carrito = cargarCarrito();
const btnCarrito = document.getElementById('btn-carrito');
const listaCarrito = document.getElementById('lista-carrito');
const carritoVacio = document.getElementById('carrito-vacio');
const btnFinalizarCompra = document.getElementById('btn-finalizar-compra');
const btnVaciarCarrito = document.getElementById('btn-vaciar-carrito');
const mensajeCarrito = document.getElementById('mensaje-carrito');
const toastCarrito = new bootstrap.Toast(document.getElementById('toast-carrito'), { delay: 3500 });

// Recuperar lo guardado sin interrumpir la página si los datos están dañados.
function cargarCarrito() {
    try {
        const guardado = JSON.parse(localStorage.getItem('carrito'));
        return Array.isArray(guardado)
            ? guardado.filter(item => item && item.id != null).map(item => ({
                ...item,
                cantidad: Number.isSafeInteger(item.cantidad) && item.cantidad > 0 ? item.cantidad : 1
            }))
            : [];
    } catch (error) {
        console.error('No se pudo leer el carrito:', error);
        return [];
    }
}

// 3. Función para agregar productos al carrito y guardar en LocalStorage
function agregarAlCarrito(producto) {
    const carritoAnterior = carrito;
    const existe = carrito.some(item => item.id === producto.id);

    if (existe) {
        carrito = carrito.map(item => {
            if (item.id === producto.id) {
                return { ...item, cantidad: (item.cantidad || 1) + 1 };
            }
            return item;
        });
    } else {
        carrito = [...carrito, { ...producto, cantidad: 1 }];
    }

    if (!guardarCambiosCarrito(carrito, carritoAnterior)) return;
    mensajeCarrito.textContent = `${producto.title || producto.name || 'El producto'} se agregó al carrito.`;
    toastCarrito.show();
}

// Todas las acciones guardan primero; si falla, se conserva el carrito anterior.
function guardarCambiosCarrito(nuevoCarrito, carritoAnterior = carrito) {
    try {
        if (nuevoCarrito.length === 0) {
            localStorage.removeItem('carrito');
        } else {
            localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
        }
    } catch (error) {
        carrito = carritoAnterior;
        mensajeCarrito.textContent = 'No se pudo guardar el cambio en el carrito. Verificá que el navegador permita el almacenamiento local e intentá nuevamente.';
        toastCarrito.show();
        console.error('No se pudo guardar el carrito:', error);
        return false;
    }
    carrito = nuevoCarrito;
    actualizarCarrito();
    return true;
}

// Punto 6: cambiar unidades sin permitir cantidades menores a uno.
function cambiarCantidad(id, cambio) {
    const producto = carrito.find(item => item.id === id);
    if (!producto || ![1, -1].includes(cambio)) return;
    const nuevaCantidad = producto.cantidad + cambio;
    if (!Number.isSafeInteger(nuevaCantidad) || nuevaCantidad < 1) return;
    guardarCambiosCarrito(carrito.map(item =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
    ));
}

function eliminarDelCarrito(id) {
    guardarCambiosCarrito(carrito.filter(item => item.id !== id));
}

// Puntos 7 y 8: limpiar los datos del carrito y confirmar la acción.
function finalizarCompra() {
    if (carrito.length === 0 || !guardarCambiosCarrito([])) return;
    mensajeCarrito.textContent = '¡Compra finalizada! Gracias por tu compra.';
    toastCarrito.show();
}

function vaciarCarrito() {
    if (carrito.length === 0 || !guardarCambiosCarrito([])) return;
    mensajeCarrito.textContent = 'Se eliminaron todos los productos del carrito.';
    toastCarrito.show();
}

// 4 y 5. Actualizar el contador de unidades y el listado del sidebar.
function actualizarCarrito() {
    // Sumar todas las cantidades
    const totalItems = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
    cantCarrito.textContent = totalItems;
    cantCarrito.hidden = totalItems === 0;
    btnCarrito.setAttribute('aria-label', `Abrir carrito, ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`);
    carritoVacio.hidden = carrito.length > 0;
    btnFinalizarCompra.disabled = carrito.length === 0;
    btnVaciarCarrito.disabled = carrito.length === 0;
    listaCarrito.replaceChildren();

    carrito.forEach(item => {
        const fila = document.createElement('li');
        fila.className = 'list-group-item d-flex align-items-center gap-3 py-3 px-0';
        const imagen = document.createElement('img');
        imagen.className = 'carrito-imagen';
        imagen.src = item.image || item.imageUrl || 'https://via.placeholder.com/200?text=Sin+Imagen';
        imagen.alt = item.title || item.name || 'Producto sin título';
        const detalle = document.createElement('div');
        detalle.className = 'carrito-detalle';
        const titulo = document.createElement('h3');
        titulo.className = 'fs-6 mb-2';
        titulo.textContent = imagen.alt;
        const controles = document.createElement('div');
        controles.className = 'carrito-controles d-flex flex-wrap align-items-center gap-2 mb-2';
        const btnRestar = document.createElement('button');
        btnRestar.type = 'button';
        btnRestar.className = 'btn btn-primary btn-sm';
        btnRestar.textContent = '−';
        btnRestar.setAttribute('aria-label', `Restar una unidad de ${imagen.alt}`);
        btnRestar.disabled = item.cantidad === 1;
        btnRestar.addEventListener('click', () => cambiarCantidad(item.id, -1));
        const cantidad = document.createElement('span');
        cantidad.className = 'carrito-cantidad border rounded text-center';
        cantidad.textContent = item.cantidad;
        cantidad.setAttribute('aria-label', `Cantidad: ${item.cantidad}`);
        const btnSumar = document.createElement('button');
        btnSumar.type = 'button';
        btnSumar.className = 'btn btn-primary btn-sm';
        btnSumar.textContent = '+';
        btnSumar.setAttribute('aria-label', `Sumar una unidad de ${imagen.alt}`);
        btnSumar.addEventListener('click', () => cambiarCantidad(item.id, 1));
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.className = 'btn btn-danger btn-sm';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.setAttribute('aria-label', `Eliminar ${imagen.alt} del carrito`);
        btnEliminar.addEventListener('click', () => eliminarDelCarrito(item.id));
        controles.append(btnRestar, cantidad, btnSumar, btnEliminar);
        const precio = document.createElement('p');
        precio.className = 'fw-bold text-success mb-0';
        precio.textContent = `Total: $${((Number(item.price) || 0) * item.cantidad).toFixed(2)}`;
        detalle.append(titulo, controles, precio);
        fila.append(imagen, detalle);
        listaCarrito.appendChild(fila);
    });
}
