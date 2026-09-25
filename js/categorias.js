// Filtro de productos por categoría

const contenedorCategorias = document.getElementById('contenedor-categorias');

// Guardamos todas las categorías para poder filtrar los productos por categoría sin volver a pedirlas a la API
let todasLasCategorias = [];

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
        filtrarPorCategoria(null);
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
                filtrarPorCategoria(categoria.id);
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
