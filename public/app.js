document.addEventListener("DOMContentLoaded", () => {
  const listaCarrito = document.getElementById("lista-carrito");
  const totalCarrito = document.getElementById("total-carrito");
  const carritoVacio = document.getElementById("carrito-vacio");
  const alerta = document.getElementById("alerta-carrito");

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  function mostrarAlerta(mensaje) {
    alerta.textContent = mensaje;
    alerta.style.display = "block";

    const cerrar = () => {
      alerta.style.display = "none";
      document.removeEventListener("click", cerrar);
    };

    setTimeout(() => {
      document.addEventListener("click", cerrar);
    }, 100);
  }

  function actualizarCarrito() {
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

    document.querySelectorAll(".input-cantidad").forEach(input => {
      input.addEventListener("change", (e) => {
        const index = e.target.dataset.index;
        const nuevaCantidad = parseInt(e.target.value);
        if (nuevaCantidad > 0) {
          carrito[index].cantidad = nuevaCantidad;
          actualizarCarrito();
        }
      });
    });
  }

  document.querySelectorAll(".boton-comprar").forEach(boton => {
    boton.addEventListener("click", () => {
      const producto = boton.closest(".producto");
      const nombre = producto.querySelector("h3").textContent;
      const precioTexto = producto.querySelector(".precio").textContent;
      const precio = parseFloat(precioTexto.replace(/[^\d.]/g, ""));
      const imagen = producto.querySelector("img")?.getAttribute("src") || "";

      const existente = carrito.find(item => item.nombre === nombre);

      if (existente) {
        existente.cantidad += 1;
      } else {
        carrito.push({ nombre, precio, cantidad: 1, imagen });
      }

      guardarCarrito();
      actualizarCarrito();
      mostrarAlerta("Se agregó al carrito.");
    });
  });

  listaCarrito?.addEventListener("click", (e) => {
    if (e.target.classList.contains("eliminar-item")) {
      const index = e.target.dataset.index;
      carrito.splice(index, 1);
      actualizarCarrito();
    }
  });

  if (listaCarrito && carrito.length > 0) {
    actualizarCarrito();
  }

  // Llamada al backend al cargar
  fetch('http://localhost:3000/api/mensaje')
    .then(res => res.json())
    .then(data => console.log("Mensaje del backend:", data))
    .catch(error => console.error("Error al obtener el mensaje:", error));
});
