document.addEventListener("DOMContentLoaded", () => {
  const listaCarrito = document.getElementById("lista-carrito");
  const totalCarrito = document.getElementById("total-carrito");
  const carritoVacio = document.getElementById("carrito-vacio");
  const alerta = document.getElementById("alerta-carrito");

  const API_BASE_URL = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000/api'
    : 'https://tu-backend-en-render.onrender.com/api';

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  function mostrarAlerta(mensaje, tipo = "info") {
    if (!alerta) return;
    alerta.textContent = mensaje;
    alerta.className = tipo;
    alerta.style.display = "block";
    setTimeout(() => {
      alerta.style.display = "none";
    }, 3000);
  }

  function actualizarCarrito() {
    if (!listaCarrito || !totalCarrito || !carritoVacio) return;

    listaCarrito.innerHTML = "";
    let total = 0;

    carrito.forEach((item, index) => {
      total += item.precio * item.cantidad;
      const li = document.createElement("li");
      li.innerHTML = `
        ${item.nombre} - S/ ${item.precio.toFixed(2)} x 
        <input type="number" value="${item.cantidad}" min="1" data-index="${index}" class="input-cantidad" style="width: 40px;"> 
        = <strong>S/ ${(item.precio * item.cantidad).toFixed(2)}</strong>
        <button class="eliminar-item" data-index="${index}">✖</button>
      `;
      listaCarrito.appendChild(li);
    });

    totalCarrito.textContent = `Subtotal: S/ ${total.toFixed(2)}`;
    carritoVacio.style.display = carrito.length === 0 ? "block" : "none";

    guardarCarrito();
  }

  listaCarrito?.addEventListener("input", (e) => {
    if (e.target.classList.contains("input-cantidad")) {
      const index = e.target.dataset.index;
      let nuevaCantidad = parseInt(e.target.value);
      if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
        nuevaCantidad = 1;
        e.target.value = 1;
      }
      carrito[index].cantidad = nuevaCantidad;
      guardarCarrito();
      actualizarCarrito();
    }
  });

  listaCarrito?.addEventListener("click", (e) => {
    if (e.target.classList.contains("eliminar-item")) {
      const index = e.target.dataset.index;
      carrito.splice(index, 1);
      guardarCarrito();
      actualizarCarrito();
      mostrarAlerta("Producto eliminado del carrito.", "info");
    }
  });

  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("boton-comprar")) {
      const boton = e.target;
      const producto = boton.closest(".producto");
      if (!producto) return;

      const nombre = producto.querySelector("h3")?.textContent || "";
      const precioTexto = producto.querySelector(".precio")?.textContent || "0";
      const precio = parseFloat(precioTexto.replace(/[^\d.]/g, "")) || 0;
      const imagen = producto.querySelector("img")?.getAttribute("src") || "";

      const existente = carrito.find(item => item.nombre === nombre);

      if (existente) {
        existente.cantidad += 1;
      } else {
        carrito.push({ nombre, precio, cantidad: 1, imagen });
      }

      guardarCarrito();
      actualizarCarrito();
      mostrarAlerta("Se agregó al carrito.", "info");
    }
  });

  if (listaCarrito && carrito.length > 0) {
    actualizarCarrito();
  }

  fetch(`${API_BASE_URL}/obtener-mensaje`)
    .then(res => {
      if (!res.ok) throw new Error('Respuesta no válida del servidor');
      return res.json();
    })
    .then(data => {
      mostrarAlerta(data.mensaje, "info");
    })
    .catch(() => {
      mostrarAlerta("No se pudo conectar con el servidor 😥", "error");
    });
});
