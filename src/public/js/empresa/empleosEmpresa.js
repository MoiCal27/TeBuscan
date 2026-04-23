import {
  getEmpleos,
  crearEmpleo,
  actualizarEmpleo,
} from "../api/empresaApi.js";
import { mostrarError, limpiarTodos } from "../ui/validaciones.js";

let empleoEditandoId = null;

export async function cargarEmpleos() {
  try {
    const { empleos } = await getEmpleos();
    const contenedor = document.getElementById("lista-empleos");

    if (!empleos || empleos.length === 0) {
      contenedor.innerHTML =
        '<p class="text-muted small">No hay empleos publicados aún.</p>';
      return;
    }

    contenedor.innerHTML = empleos
      .map(
        (emp) => `
            <div class="info-card mb-3">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <span class="fw-bold" style="font-size:1rem;">${emp.titulo_empleo}</span>
                            <span style="background:var(--sky);color:#fff;font-size:0.72rem;padding:3px 10px;border-radius:20px;font-weight:600;">
                                ${emp.estado_empleo || "Activo"}
                            </span>
                        </div>
                        <div class="d-flex gap-3 text-muted small mb-2">
                            <span><i class="bi bi-geo-alt me-1"></i>${emp.ubicacion_empleo || "-"}</span>
                            <span><i class="bi bi-briefcase me-1"></i>${emp.tipo_empleo || "-"}</span>
                            <span><i class="bi bi-cash me-1"></i>${emp.salario_min_empleo || "-"} - ${emp.salario_max_empleo || "-"}</span>
                        </div>
                        <p class="small text-muted mb-0">${emp.descripcion_empleo || ""}</p>
                    </div>
                    <button class="btn btn-outline-secondary rounded-2 px-3 py-1 ms-3"
                        style="font-size:0.85rem;white-space:nowrap;"
                        onclick="window.abrirEditar(${emp.id_empleo})">
                        Editar
                    </button>
                </div>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Error cargando empleos:", error);
  }
}

function limpiarCamposPublicar() {
  document.getElementById("pub-titulo").value = "";
  document.getElementById("pub-ubicacion").value = "";
  document.getElementById("pub-categoria").value = "";
  document.getElementById("pub-tipo").value = "";
  document.getElementById("pub-contrato").value = "";
  document.getElementById("pub-salario_min").value = "";
  document.getElementById("pub-salario_max").value = "";
  document.getElementById("pub-experiencia").value = "";
  document.getElementById("pub-descripcion").value = "";
  document.getElementById("pub-requisitos").value = "";
  document.getElementById("pub-beneficios").value = "";
}

export async function guardarNuevoEmpleo() {
  const campos = [
    "pub-titulo",
    "pub-ubicacion",
    "pub-categoria",
    "pub-tipo",
    "pub-contrato",
    "pub-experiencia",
    "pub-descripcion",
    "pub-requisitos",
  ];
  limpiarTodos(campos);
  let valido = true;

  const titulo = document.getElementById("pub-titulo").value.trim();
  const ubicacion = document.getElementById("pub-ubicacion").value.trim();
  const categoria = document.getElementById("pub-categoria").value;
  const tipo = document.getElementById("pub-tipo").value;
  const contrato = document.getElementById("pub-contrato").value;
  const experiencia = document.getElementById("pub-experiencia").value;
  const descripcion = document.getElementById("pub-descripcion").value.trim();
  const requisitos = document.getElementById("pub-requisitos").value.trim();

  if (!titulo) {
    mostrarError("pub-titulo", "El título es obligatorio");
    valido = false;
  }
  if (!ubicacion) {
    mostrarError("pub-ubicacion", "La ubicación es obligatoria");
    valido = false;
  }
  if (!categoria) {
    mostrarError("pub-categoria", "Selecciona una categoría");
    valido = false;
  }
  if (!tipo) {
    mostrarError("pub-tipo", "Selecciona el tipo de empleo");
    valido = false;
  }
  if (!contrato) {
    mostrarError("pub-contrato", "Selecciona el tipo de contrato");
    valido = false;
  }
  if (!experiencia) {
    mostrarError("pub-experiencia", "Selecciona el nivel de experiencia");
    valido = false;
  }
  if (!descripcion) {
    mostrarError("pub-descripcion", "La descripción es obligatoria");
    valido = false;
  }
  if (!requisitos) {
    mostrarError("pub-requisitos", "Los requisitos son obligatorios");
    valido = false;
  }

  if (!valido) return;

  try {
    const data = {
      titulo_empleo: titulo,
      ubicacion_empleo: ubicacion,
      categoria_empleo: categoria,
      tipo_empleo: tipo,
      tipo_contrato_empleo: contrato,
      salario_min_empleo:
        document.getElementById("pub-salario_min").value || null,
      salario_max_empleo:
        document.getElementById("pub-salario_max").value || null,
      nivel_experiencia_empleo: experiencia,
      descripcion_empleo: descripcion,
      requisitos_empleo: requisitos,
      beneficios_empleo: document.getElementById("pub-beneficios").value.trim(),
    };

    const respuesta = await crearEmpleo(data);
    if (respuesta.error) {
      alert(respuesta.error);
      return;
    }

    limpiarCamposPublicar();
    window.cerrarModal();
    cargarEmpleos();
  } catch (error) {
    alert("Error al publicar empleo");
  }
}

export async function guardarEdicionEmpleo() {
  const campos = [
    "edit-titulo",
    "edit-ubicacion",
    "edit-categoria",
    "edit-tipo",
    "edit-contrato",
    "edit-experiencia",
    "edit-descripcion",
    "edit-requisitos",
  ];
  limpiarTodos(campos);
  let valido = true;

  const titulo = document.getElementById("edit-titulo").value.trim();
  const ubicacion = document.getElementById("edit-ubicacion").value.trim();
  const categoria = document.getElementById("edit-categoria").value;
  const tipo = document.getElementById("edit-tipo").value;
  const contrato = document.getElementById("edit-contrato").value;
  const experiencia = document.getElementById("edit-experiencia").value;
  const descripcion = document.getElementById("edit-descripcion").value.trim();
  const requisitos = document.getElementById("edit-requisitos").value.trim();

  if (!titulo) {
    mostrarError("edit-titulo", "El título es obligatorio");
    valido = false;
  }
  if (!ubicacion) {
    mostrarError("edit-ubicacion", "La ubicación es obligatoria");
    valido = false;
  }
  if (!categoria) {
    mostrarError("edit-categoria", "Selecciona una categoría");
    valido = false;
  }
  if (!tipo) {
    mostrarError("edit-tipo", "Selecciona el tipo de empleo");
    valido = false;
  }
  if (!contrato) {
    mostrarError("edit-contrato", "Selecciona el tipo de contrato");
    valido = false;
  }
  if (!experiencia) {
    mostrarError("edit-experiencia", "Selecciona el nivel de experiencia");
    valido = false;
  }
  if (!descripcion) {
    mostrarError("edit-descripcion", "La descripción es obligatoria");
    valido = false;
  }
  if (!requisitos) {
    mostrarError("edit-requisitos", "Los requisitos son obligatorios");
    valido = false;
  }

  if (!valido) return;

  try {
    const data = {
      titulo_empleo: titulo,
      ubicacion_empleo: ubicacion,
      categoria_empleo: categoria,
      tipo_empleo: tipo,
      tipo_contrato_empleo: contrato,
      salario_min_empleo:
        document.getElementById("edit-salario_min").value || null,
      salario_max_empleo:
        document.getElementById("edit-salario_max").value || null,
      nivel_experiencia_empleo: experiencia,
      descripcion_empleo: descripcion,
      requisitos_empleo: requisitos,
      beneficios_empleo: document
        .getElementById("edit-beneficios")
        .value.trim(),
    };

    const respuesta = await actualizarEmpleo(empleoEditandoId, data);
    if (respuesta.error) {
      alert(respuesta.error);
      return;
    }

    window.cerrarModalEditar();
    cargarEmpleos();
  } catch (error) {
    alert("Error al actualizar empleo");
  }
}

window.abrirEditar = async (id_empleo) => {
  empleoEditandoId = id_empleo;
  const { empleos } = await getEmpleos();
  const emp = empleos.find((e) => e.id_empleo === id_empleo);
  if (!emp) return;

  document.getElementById("edit-titulo").value = emp.titulo_empleo || "";
  document.getElementById("edit-ubicacion").value = emp.ubicacion_empleo || "";
  document.getElementById("edit-categoria").value = emp.categoria_empleo || "";
  document.getElementById("edit-tipo").value = emp.tipo_empleo || "";
  document.getElementById("edit-contrato").value =
    emp.tipo_contrato_empleo || "";
  document.getElementById("edit-salario_min").value =
    emp.salario_min_empleo || "";
  document.getElementById("edit-salario_max").value =
    emp.salario_max_empleo || "";
  document.getElementById("edit-experiencia").value =
    emp.nivel_experiencia_empleo || "";
  document.getElementById("edit-descripcion").value =
    emp.descripcion_empleo || "";
  document.getElementById("edit-requisitos").value =
    emp.requisitos_empleo || "";
  document.getElementById("edit-beneficios").value =
    emp.beneficios_empleo || "";

  window.abrirModalEditar();
};
