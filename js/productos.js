// Listado de productos en cards y búsqueda

const contenedorProductos = document.getElementById('contenedor-productos');
const conteoProductos = document.getElementById('conteo-productos');

// Guardamos todos los productos para poder filtrarlos por categoría sin volver a pedirlos a la API
let todosLosProductos = [];

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
