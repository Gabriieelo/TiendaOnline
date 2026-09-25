// Modal de detalle de producto

// Elementos del modal de detalle de producto (Bootstrap 5)
const modalDetalle = document.getElementById('modal-detalle');
const modalBootstrap = new bootstrap.Modal(modalDetalle);
const modalImg = document.getElementById('modal-img');
const modalCategoria = document.getElementById('modal-categoria');
const modalTitulo = document.getElementById('modal-titulo');
const modalDescripcion = document.getElementById('modal-descripcion');
const modalPrecio = document.getElementById('modal-precio');
const modalBtnAgregar = document.getElementById('modal-btn-agregar');

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
