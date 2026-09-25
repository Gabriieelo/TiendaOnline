// Punto de entrada: inicializa la app y conecta los buscadores

const inputBuscador = document.getElementById('input-buscador');
const inputBuscadorMobile = document.getElementById('input-buscador-mobile');

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
