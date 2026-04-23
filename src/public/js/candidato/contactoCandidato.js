import { enviarMensajeContacto } from "../api/generalApi.js";

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("btn-enviar-contacto")
    ?.addEventListener("click", enviarFormulario);
});

async function enviarFormulario() {
  const nombre = document.getElementById("input-nombre").value.trim();
  const correo = document.getElementById("input-correo").value.trim();
  const asunto = document.getElementById("input-asunto").value.trim();
  const mensaje = document.getElementById("input-mensaje").value.trim();

  limpiarErrores();

  let valido = true;

  if (!nombre) {
    mostrarError("input-nombre", "El nombre es obligatorio.");
    valido = false;
  }
  if (!correo) {
    mostrarError("input-correo", "El correo es obligatorio.");
    valido = false;
  }
  if (correo && !correo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    mostrarError("input-correo", "Ingresa un correo válido.");
    valido = false;
  }
  if (!asunto) {
    mostrarError("input-asunto", "El asunto es obligatorio.");
    valido = false;
  }
  if (!mensaje) {
    mostrarError("input-mensaje", "El mensaje no puede estar vacío.");
    valido = false;
  }

  if (!valido) return;

  const btn = document.getElementById("btn-enviar-contacto");
  btn.disabled = true;
  btn.textContent = "Enviando…";

  try {
    const resultado = await enviarMensajeContacto({
      nombre,
      correo,
      asunto,
      mensaje,
    });

    if (!resultado.ok) throw new Error(resultado.error || "Error al enviar");

    mostrarAlerta(
      "success",
      '<i class="bi bi-check-circle me-2"></i>¡Mensaje enviado correctamente! Te responderemos a la brevedad.',
    );

    document.getElementById("input-nombre").value = "";
    document.getElementById("input-correo").value = "";
    document.getElementById("input-asunto").value = "";
    document.getElementById("input-mensaje").value = "";
  } catch (err) {
    console.error("Error enviando contacto:", err);
    mostrarAlerta(
      "danger",
      '<i class="bi bi-exclamation-circle me-2"></i>No se pudo enviar el mensaje. Intenta de nuevo.',
    );
  } finally {
    btn.disabled = false;
    btn.textContent = "Enviar mensaje";
  }
}

function mostrarError(inputId, texto) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.classList.add("is-invalid");
  const feedback = document.createElement("div");
  feedback.className = "invalid-feedback";
  feedback.textContent = texto;
  input.parentNode.appendChild(feedback);
}

function limpiarErrores() {
  document
    .querySelectorAll(".is-invalid")
    .forEach((el) => el.classList.remove("is-invalid"));
  document.querySelectorAll(".invalid-feedback").forEach((el) => el.remove());
  document.getElementById("alerta-contacto")?.remove();
}

function mostrarAlerta(tipo, html) {
  const alerta = document.createElement("div");
  alerta.id = "alerta-contacto";
  alerta.className = `alert alert-${tipo} rounded-3 mt-3`;
  alerta.innerHTML = html;
  const btn = document.getElementById("btn-enviar-contacto");
  btn.parentNode.insertBefore(alerta, btn);
  setTimeout(() => alerta.remove(), 6000);
}
