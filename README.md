# 🛒 TiendaOnline — E-commerce

Trabajo práctico de **Laboratorio de Aplicaciones Web Cliente**: una tienda online desarrollada con HTML5, CSS3 y JavaScript, que consume una API REST de productos.

## 👥 Integrantes

| Nombre  | Usuario de GitHub |
|---------|--------------------|
| Esteban | `tebaniglesias`    |
| Gabriel | `Gabriieelo`      |

## 📋 Descripción

La aplicación permite listar productos obtenidos desde una API externa, ver el detalle de cada uno en un modal, agregarlos a un carrito de compras persistido en `localStorage`, gestionar cantidades, filtrar por búsqueda y por categoría, y finalizar la compra.

## 🚀 Tecnologías

- **HTML5** semántico (`header`, `nav`, `main`, `section`, `footer`)
- **CSS3** + [Bootstrap 5](https://getbootstrap.com/)
- **JavaScript**: DOM, Fetch API, LocalStorage
- **API de productos**: [web-api-products.runasp.net](https://web-api-products.runasp.net/swagger/index.html)

## ✅ Funcionalidades

- [x] Listado de productos desde la API en cards
- [x] Agregar producto al carrito (persistido en LocalStorage)
- [x] Contador de productos en el ícono del carrito (navbar)
- [ ] Modal de detalle de producto (título, precio, descripción)
- [ ] Sidebar/offcanvas del carrito con listado de productos
- [ ] Control de cantidad por producto (botones +/-) y eliminación individual
- [ ] Botón "Finalizar compra" (vacía el carrito y el LocalStorage)
- [ ] Botón "Eliminar todos los productos" del carrito
- [ ] Estados deshabilitados/ocultos cuando el carrito está vacío
- [ ] Buscador de productos
- [ ] Navegación y filtrado por categorías
- [ ] Mensajes de feedback al usuario (agregado al carrito, compra finalizada)

> Proyecto en desarrollo activo — este checklist se irá actualizando a medida que se completen los requisitos del enunciado.

## 📂 Estructura del proyecto

```
├── index.html   # Estructura principal de la página
├── css.css      # Estilos de la aplicación
├── js.js        # Lógica: fetch de productos, carrito, LocalStorage
└── README.md
```
