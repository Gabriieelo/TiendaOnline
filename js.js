// URL base de la API elegida
const API_URL = 'https://web-api-products.runasp.net/api/products';

// Elementos del DOM
const contenedorProductos = document.getElementById('contenedor-productos');
const cantCarrito = document.getElementById('cant-carrito');

// Array para almacenar el carrito de compras
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

const inputBuscador = document.getElementById('input-buscador');
let listaProductos = [];

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

        listaProductos = await respuesta.json();
        renderizarProductos(listaProductos);

    } catch (error) {
        console.error('Error al traer los productos:', error);
        contenedorProductos.innerHTML = `
            <div class="col-12 text-center text-danger my-5">
                <p>⚠️ Hubo un problema al cargar los productos. Por favor, intenta de nuevo más tarde.</p>
            </div>
        `;
    }
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
        btnAgregar.addEventListener('click', () => {
            agregarAlCarrito(producto);
        });

        contenedorProductos.appendChild(col);
    });
}

function filtrarProductos(textoBusqueda) {
    const textoLimpio = (textoBusqueda ?? '').toLowerCase().trim();

    const productosFiltrados = textoLimpio === ''
        ? listaProductos
        : listaProductos.filter(producto => {
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
    actualizarCarrito(); // Recupera el contador guardado

    if (inputBuscador) {
        inputBuscador.addEventListener('input', (evento) => {
            filtrarProductos(evento.target.value);
        });
    }
});