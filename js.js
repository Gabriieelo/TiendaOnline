// URL base de la API elegida
const API_URL = 'https://web-api-products.runasp.net/api/products';
const CATEGORIES_URL = 'https://web-api-products.runasp.net/api/categories';

// Elementos del DOM
const contenedorProductos = document.getElementById('contenedor-productos');
const contenedorCategorias = document.getElementById('contenedor-categorias');
const cantCarrito = document.getElementById('cant-carrito');
const conteoProductos = document.getElementById('conteo-productos');

// Guardamos todos los productos para poder filtrarlos por categoría sin volver a pedirlos a la API
let todosLosProductos = [];
// Guardamos todas las categorías para poder filtrar los productos por categoría sin volver a pedirlas a la API
let todasLasCategorias = [];

// Elementos del modal de detalle de producto (Bootstrap 5)
const modalDetalle = document.getElementById('modal-detalle');
const modalBootstrap = new bootstrap.Modal(modalDetalle);
const modalImg = document.getElementById('modal-img');
const modalCategoria = document.getElementById('modal-categoria');
const modalTitulo = document.getElementById('modal-titulo');
const modalDescripcion = document.getElementById('modal-descripcion');
const modalPrecio = document.getElementById('modal-precio');
const modalBtnAgregar = document.getElementById('modal-btn-agregar');

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

const inputBuscador = document.getElementById('input-buscador');
const inputBuscadorMobile = document.getElementById('input-buscador-mobile');

// 1. Función para obtener productos de la API (Fetch)
async function obtenerProductos() {
    try {
        // Mostrar mensaje de carga mientras responde la API
        contenedorProductos.innerHTML = `
            <div class="col-12 text-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2 text-muted">Cargando productos...</p>
            </div>
        `;

        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error(`Error en la petición: ${respuesta.status}`);
        }

        const productos = await respuesta.json();
        todosLosProductos = productos;
        renderizarProductos(productos);

    } catch (error) {
        console.error('Error al traer los productos:', error);
        contenedorProductos.innerHTML = `
            <div class="col-12 text-center text-danger my-5">
                <p>⚠️ Hubo un problema al cargar los productos. Por favor, intenta de nuevo más tarde.</p>
            </div>
        `;
    }
}

// 1.1 Función para obtener las categorías de la API y renderizarlas como filtro
async function obtenerCategorias() {
    try {
        const respuesta = await fetch(CATEGORIES_URL);

        if (!respuesta.ok) {
            throw new Error(`Error en la petición: ${respuesta.status}`);
        }

        const categorias = await respuesta.json();
        todasLasCategorias = categorias;
        renderizarCategorias(categorias);

    } catch (error) {
        console.error('Error al traer las categorías:', error);
    }
}

// 1.2 Función para renderizar los botones de filtro por categoría
function renderizarCategorias(categorias) {
    contenedorCategorias.innerHTML = '';

    // Botón para mostrar todos los productos sin filtrar
    const btnTodas = document.createElement('button');
    btnTodas.type = 'button';
    btnTodas.className = 'btn btn-primary btn-sm btn-categoria activa';
    btnTodas.textContent = 'Todas';
    btnTodas.addEventListener('click', () => {
        marcarCategoriaActiva(btnTodas);
        renderizarProductos(todosLosProductos);
    });
    contenedorCategorias.appendChild(btnTodas);

    categorias
        .filter(categoria => categoria.name && categoria.name !== 'string') // Descarta categorías sin nombre && que vengan como "string"
        .forEach(categoria => {
            const btnCategoria = document.createElement('button');
            btnCategoria.type = 'button';
            btnCategoria.className = 'btn btn-outline-primary btn-sm btn-categoria';
            btnCategoria.textContent = categoria.name;
            btnCategoria.addEventListener('click', () => {
                marcarCategoriaActiva(btnCategoria);
                const productosFiltrados = todosLosProductos.filter(
                    producto => producto.categoryId === categoria.id
                );
                renderizarProductos(productosFiltrados);
            });
            contenedorCategorias.appendChild(btnCategoria);
        });
}

// 1.2.1 Busca el nombre de una categoría por su id (los productos solo traen categoryId)
function obtenerNombreCategoria(categoryId) {
    const categoria = todasLasCategorias.find(cat => cat.id === categoryId);
    return categoria ? categoria.name : '';
}

// 1.3 Función para resaltar visualmente el botón de categoría seleccionado
function marcarCategoriaActiva(botonActivo) {
    contenedorCategorias.querySelectorAll('.btn-categoria').forEach(boton => {
        boton.classList.remove('btn-primary', 'activa');
        boton.classList.add('btn-outline-primary');
    });

    botonActivo.classList.remove('btn-outline-primary');
    botonActivo.classList.add('btn-primary', 'activa');
}

// 2. Función para renderizar las tarjetas en el DOM
function renderizarProductos(productos) {
    contenedorProductos.innerHTML = ''; // Limpiar loader
    if (productos.length === 0) {
        contenedorProductos.innerHTML = `
        <div class="col-12 text-center my-5 text-muted">
            <h4>🔎 No se encontraron productos</h4>
            <p>Intenta buscar con otra palabra clave.</p>
        </div>
    `;
        return;
    }

    conteoProductos.textContent = `${productos.length} productos`;

    productos.forEach(producto => {
        // Adaptar propiedades de la API (si alguna propiedad viene con otro nombre, se maneja un fallback)
        const id = producto.id;
        const titulo = producto.title || producto.name || 'Producto sin título';
        const precio = producto.price || 0;
        const imagen = producto.image || producto.imageUrl || 'https://via.placeholder.com/200?text=Sin+Imagen';
        const nombreCategoria = obtenerNombreCategoria(producto.categoryId);

        // Creamos la columna responsive
        const col = document.createElement('div');
        col.className = 'col';

        // Estructura de la Card usando las clases de tu styles.css
        col.innerHTML = `
            <div class="card card-producto h-100">
                <div class="card-img-container">
                    <img src="${imagen}" alt="${titulo}" class="img-fluid" loading="lazy">
                </div>
                <div class="card-body">
                    ${nombreCategoria ? `<span class="badge-categoria">${nombreCategoria}</span>` : ''}
                    <h5 class="card-title">${titulo}</h5>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="precio">$${precio.toFixed(2)}</span>
                        <button class="btn btn-primary btn-sm btn-agregar-carrito" data-id="${id}">
                            <i class="bi bi-cart-plus me-2"></i>Agregar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Evento para el botón de agregar al carrito
        const btnAgregar = col.querySelector('.btn-agregar-carrito');
        btnAgregar.addEventListener('click', (evento) => {
            evento.stopPropagation(); // Evita que también se abra el modal de detalle
            agregarAlCarrito(producto);
        });

        // Evento para abrir el modal de detalle al hacer click en la card
        const card = col.querySelector('.card-producto');
        card.addEventListener('click', () => {
            abrirModalDetalle(producto);
        });

        contenedorProductos.appendChild(col);
    });
}

// 2.1 Función para abrir el modal con el detalle del producto
function abrirModalDetalle(producto) {
    const titulo = producto.title || producto.name || 'Producto sin título';
    const precio = producto.price || 0;
    const imagen = producto.image || producto.imageUrl || 'https://via.placeholder.com/200?text=Sin+Imagen';
    const descripcion = producto.description || 'Sin descripción disponible.';
    const categoria = obtenerNombreCategoria(producto.categoryId);

    modalImg.src = imagen;
    modalImg.alt = titulo;
    modalCategoria.textContent = categoria;
    modalTitulo.textContent = titulo;
    modalDescripcion.textContent = descripcion;
    modalPrecio.textContent = `$${precio.toFixed(2)}`;

    // Al agregar desde el modal, se suma al carrito y se cierra el modal
    modalBtnAgregar.onclick = () => {
        agregarAlCarrito(producto);
        modalBootstrap.hide();
    };

    modalBootstrap.show();
}

// 2.2 Función para filtrar los productos por texto de búsqueda
function filtrarProductos(textoBusqueda) {
    const textoLimpio = (textoBusqueda ?? '').toLowerCase().trim();

    const productosFiltrados = textoLimpio === ''
        ? todosLosProductos
        : todosLosProductos.filter(producto => {
            const titulo = (producto.title || producto.name || '').toLowerCase();
            return titulo.includes(textoLimpio);
        });

    renderizarProductos(productosFiltrados);
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

// Inicializar la app cuando cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    obtenerProductos();
    obtenerCategorias();
    actualizarCarrito(); // Recupera el contador guardado
    btnFinalizarCompra.addEventListener('click', finalizarCompra);
    btnVaciarCarrito.addEventListener('click', vaciarCarrito);

    [inputBuscador, inputBuscadorMobile].forEach((input) => {
        if (!input) return;
        input.addEventListener('input', (evento) => {
            const valor = evento.target.value;
            filtrarProductos(valor);
            // Mantiene sincronizados los dos buscadores (desktop y mobile)
            if (inputBuscador && inputBuscador !== evento.target) inputBuscador.value = valor;
            if (inputBuscadorMobile && inputBuscadorMobile !== evento.target) inputBuscadorMobile.value = valor;
        });
    });
});
