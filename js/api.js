// Llamadas a la API REST de productos y categorías

// URL base de la API elegida
const API_URL = 'https://web-api-products.runasp.net/api/products';
const CATEGORIES_URL = 'https://web-api-products.runasp.net/api/categories';

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
        filtrarProductos();

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
