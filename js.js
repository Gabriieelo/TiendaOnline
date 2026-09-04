// URL base de la API elegida
const API_URL = 'https://web-api-products.runasp.net/api/products';
const CATEGORIES_URL = 'https://web-api-products.runasp.net/api/categories';

// Elementos del DOM
const contenedorProductos = document.getElementById('contenedor-productos');
const contenedorCategorias = document.getElementById('contenedor-categorias');
const cantCarrito = document.getElementById('cant-carrito');

// Guardamos todos los productos para poder filtrarlos por categoría sin volver a pedirlos a la API
let todosLosProductos = [];

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
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

const inputBuscador = document.getElementById('input-buscador');

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

    productos.forEach(producto => {
        // Adaptar propiedades de la API (si alguna propiedad viene con otro nombre, se maneja un fallback)
        const id = producto.id;
        const titulo = producto.title || producto.name || 'Producto sin título';
        const precio = producto.price || 0;
        const imagen = producto.image || producto.imageUrl || 'https://via.placeholder.com/200?text=Sin+Imagen';

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
                    <h5 class="card-title">${titulo}</h5>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="precio">$${precio.toFixed(2)}</span>
                        <button class="btn btn-primary btn-sm btn-agregar-carrito" data-id="${id}">
                            Agregar 🛒
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
    const categoria = typeof producto.category === 'string'
        ? producto.category
        : (producto.category && producto.category.name) || '';

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
    const existe = carrito.some(item => item.id === producto.id);

    if (existe) {
        carrito = carrito.map(item => {
            if (item.id === producto.id) {
                return { ...item, cantidad: (item.cantidad || 1) + 1 };
            }
            return item;
        });
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    actualizarCarrito();
}

// 4. Actualizar contador del carrito y LocalStorage
function actualizarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Sumar todas las cantidades
    const totalItems = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
    cantCarrito.textContent = totalItems;
}

// Inicializar la app cuando cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    obtenerProductos();
    obtenerCategorias();
    actualizarCarrito(); // Recupera el contador guardado

    if (inputBuscador) {
        inputBuscador.addEventListener('input', (evento) => {
            filtrarProductos(evento.target.value);
        });
    }
});