import { switchProfileTab } from "../ui/uiHelpers.js";
import { mostrarError, limpiarTodos } from "../ui/validaciones.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {
  getSesion,
  actualizarCandidato,
  getAplicaciones,
  getEstadisticas,
  subirCV,
  getAlertas,
  crearAlerta,
  actualizarAlerta,
  eliminarAlerta,
  getValoraciones,
  crearValoracion,
  actualizarValoracion,
  eliminarValoracion,
} from "../api/candidatoApi.js";
import { iniciarNotificaciones } from "./notificaciones.js";
import { getTodasLasEmpresas } from "../api/generalApi.js";
iniciarNotificaciones();

const config = await fetch("/api/config").then((r) => r.json());
const supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
let { usuario, candidato } = await getSesion();

if (!candidato) {
  window.location.href = "/login";
}
document.getElementById("input-telefono").addEventListener("input", (e) => {
  let val = e.target.value.replace(/\D/g, "");
  if (val.length > 4) val = val.slice(0, 4) + "-" + val.slice(4, 8);
  e.target.value = val;
});
const nombreCompleto = `${candidato.nombre_candidato} ${candidato.apellido_candidato}`;
document.getElementById("input-nombre").value = nombreCompleto;
document.getElementById("input-correo").value = usuario.correo_usuario;
document.getElementById("input-telefono").value =
  candidato.telefono_candidato || "";
document.getElementById("input-ubicacion").value =
  candidato.ubicacion_candidato || "";
document.getElementById("input-descripcion").value =
  candidato.descripcion_candidato || "";

if (candidato.curriculum) {
  document.getElementById("cv-preview").style.display = "flex";
  const nombreCV = candidato.curriculum.split("/").pop();
  document.getElementById("cv-nombre").textContent = nombreCV;
  document.getElementById("cv-fecha").textContent = "CV subido";
  document.getElementById("cv-link").href = candidato.curriculum;
}

const { estadisticas } = await getEstadisticas();
document.getElementById("stat-visitas").textContent =
  estadisticas.visitasPerfil;
document.getElementById("stat-aplicaciones").textContent =
  estadisticas.aplicacionesMes;
document.getElementById("stat-entrevistas").textContent =
  estadisticas.entrevistas;

document.querySelectorAll(".profile-tab").forEach((tab) => {
  tab.addEventListener("click", function () {
    const tabName = this.textContent
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    switchProfileTab(tabName, this);
    if (tabName === "aplicaciones") cargarAplicaciones();
    if (tabName === "alertas") cargarAlertas();
    if (tabName === "valoraciones") cargarValoraciones();
  });
});

document
  .getElementById("btnGuardarCandidato")
  .addEventListener("click", async () => {
    limpiarTodos(["input-nombre", "input-telefono", "input-ubicacion"]);
    let valido = true;

    const nombre = document.getElementById("input-nombre").value.trim();
    const telefono = document.getElementById("input-telefono").value.trim();
    const ubicacion = document.getElementById("input-ubicacion").value.trim();

    if (!nombre) {
      mostrarError("input-nombre", "El nombre es obligatorio");
      valido = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
      mostrarError("input-nombre", "Solo se permiten letras");
      valido = false;
    }

    if (!telefono) {
      mostrarError("input-telefono", "El teléfono es obligatorio");
      valido = false;
    } else if (!/^[0-9]{4}-[0-9]{4}$/.test(telefono)) {
      mostrarError("input-telefono", "Formato: 0000-0000");
      valido = false;
    }

    if (!ubicacion) {
      mostrarError("input-ubicacion", "La ubicación es obligatoria");
      valido = false;
    }

    if (!valido) return;

    const partes = nombre.split(" ");
    const nombre_candidato = partes[0] || "";
    const apellido_candidato = partes.slice(1).join(" ") || "";

    const datos = {
      nombre_candidato,
      apellido_candidato,
      telefono_candidato: telefono,
      ubicacion_candidato: ubicacion,
      descripcion_candidato: document
        .getElementById("input-descripcion")
        .value.trim(),
    };

    const respuesta = await actualizarCandidato(datos);
    if (respuesta.error) {
      mostrarError("input-nombre", respuesta.error);
      return;
    }
    mostrarToast("Perfil actualizado exitosamente!");
  });

async function cargarAplicaciones() {
  const { aplicaciones } = await getAplicaciones();
  const lista = document.getElementById("lista-aplicaciones");

  if (!aplicaciones || aplicaciones.length === 0) {
    lista.innerHTML =
      '<p class="text-muted small">No tienes aplicaciones aún.</p>';
    return;
  }

  lista.innerHTML = aplicaciones
    .map((a) => {
      const estado =
        a.evaluacion_aplicacion?.[0]?.estado_aplicacion || "pendiente";
      const badgeClase =
        {
          Entrevista: "entrevista",
          Revisando: "revisando",
          Rechazado: "rechazado",
          Nuevo: "nuevo",
          Aceptado: "entrevista",
        }[estado] || "nuevo";

      const fecha = new Date(a.fecha_aplicacion).toLocaleDateString("es-ES");

      return `
        <div class="info-card pec-card">
            <div class="pec-row">
                <div class="d-flex align-items-start gap-3">
                    <div class="pec-avatar"><i class="bi bi-briefcase"></i></div>
                    <div class="pec-info">
                        <span class="pec-nombre">${a.empleos?.titulo_empleo || "Empleo"}</span>
                        <span class="pec-puesto">${a.empleos?.empresa?.nombre_empresa || ""}</span>
                        <div class="pec-meta"><i class="bi bi-geo-alt me-1"></i>${a.empleos?.ubicacion_empleo || ""}</div>
                        <div class="pec-meta"><span>Fecha: ${fecha}</span></div>
                    </div>
                </div>
                <div class="pec-actions">
                    <span class="pec-badge ${badgeClase}">${estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
                </div>
            </div>
        </div>`;
    })
    .join("");
}
document.getElementById("cv-link").addEventListener("click", (e) => {
  e.preventDefault();
  if (candidato.curriculum) {
    window.open(candidato.curriculum, "_blank");
  }
});
document.getElementById("cv-file").addEventListener("change", async (e) => {
  const archivo = e.target.files[0];
  if (!archivo) return;

  if (archivo.size > 5 * 1024 * 1024) {
    alert("El archivo no puede superar 5MB");
    return;
  }

  const tiposPermitidos = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!tiposPermitidos.includes(archivo.type)) {
    alert("Solo se permiten archivos PDF, DOC o DOCX");
    return;
  }

  try {
    const extension = archivo.name.split(".").pop();
    const nombreArchivo = `cv_${candidato.id_candidato}.${extension}`; // nombre fijo → reemplaza siempre

    const { error } = await supabaseClient.storage
      .from("curriculums")
      .upload(nombreArchivo, archivo, { upsert: true });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabaseClient.storage
      .from("curriculums")
      .getPublicUrl(nombreArchivo);

    await subirCV(urlData.publicUrl);
    candidato.curriculum = urlData.publicUrl;
    document.getElementById("cv-preview").style.display = "flex";
    document.getElementById("cv-nombre").textContent = archivo.name;
    document.getElementById("cv-link").href = urlData.publicUrl;
    document.getElementById("cv-fecha").textContent =
      `Subido el ${new Date().toLocaleDateString("es-ES")}`;
    mostrarToast("CV subido exitosamente!");
  } catch (err) {
    mostrarToast("Error al subir CV: " + err.message, "error");
  }
});

window.eliminarCV = () => {
  mostrarConfirm(
    "¿Estás seguro que deseas eliminar tu CV? Esta acción no se puede deshacer.",
    async () => {
      await actualizarCandidato({
        ...candidato,
        curriculum: null,
      });
      candidato.curriculum = null;
      document.getElementById("cv-preview").style.display = "none";
      document.getElementById("cv-file").value = "";
      document.getElementById("cv-link").href = "#";
      document.getElementById("cv-nombre").textContent = "";
      document.getElementById("cv-fecha").textContent = "";
      mostrarToast("CV eliminado correctamente");
    },
  );
};

// ALERTAS

let alertaEditandoId = null;

async function cargarAlertas() {
  try {
    const { alertas } = await getAlertas();
    const lista = document.getElementById("lista-alertas");
    if (!lista) return;

    if (!alertas || alertas.length === 0) {
      lista.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-bell-slash fs-1 d-block mb-3" style="color:var(--blue);opacity:.4"></i>
                    <p class="fw-semibold">No tienes alertas configuradas</p>
                    <p class="small">Crea una alerta para recibir notificaciones de empleos.</p>
                </div>`;
      return;
    }

    lista.innerHTML = alertas
      .map(
        (a) => `
            <div class="d-flex align-items-center gap-3 p-3 border rounded-3 mb-2"
                 style="background:#f8fbfd;">
                <div class="flex-shrink-0" style="color:var(--blue);font-size:1.2rem;">
                    <i class="bi bi-bell"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="fw-semibold small">${a.palabra_clave}</div>
                    <div class="text-muted small">
                        ${a.ubicacion ? a.ubicacion + " • " : ""}${a.frecuencia || ""}${a.tipo_empleo ? " • " + a.tipo_empleo : ""}
                    </div>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary btn-sm rounded-2"
                        style="font-size:.8rem;"
                        onclick="window.abrirEditarAlerta(${a.id_alerta})">
                        Editar
                    </button>
                    <button class="btn btn-outline-secondary btn-sm rounded-2" style="font-size:.8rem;"
                        onclick="window.confirmarEliminarAlerta(${a.id_alerta})">
                        Eliminar
                    </button>
                </div>
            </div>
        `,
      )
      .join("");
  } catch (err) {
    console.error("Error cargando alertas:", err);
  }
}

document.getElementById("btnCrearAlerta")?.addEventListener("click", () => {
  const ids = [
    "crear-palabra_clave",
    "crear-ubicacion",
    "crear-salario_minimo",
  ];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const frec = document.getElementById("crear-frecuencia");
  const tipo = document.getElementById("crear-tipo_empleo");
  if (frec) frec.value = "Diario";
  if (tipo) tipo.value = "";
  abrirModalCrearAlerta();
});

window.guardarNuevaAlerta = async function () {
  limpiarTodos(["crear-palabra_clave", "crear-ubicacion"]);
  let valido = true;

  const palabra_clave = document
    .getElementById("crear-palabra_clave")
    ?.value.trim();
  const ubicacion = document.getElementById("crear-ubicacion")?.value.trim();

  if (!palabra_clave) {
    mostrarError("crear-palabra_clave", "La palabra clave es obligatoria");
    valido = false;
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/.test(palabra_clave)) {
    mostrarError("crear-palabra_clave", "No se permiten caracteres especiales");
    valido = false;
  }

  if (ubicacion && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,]+$/.test(ubicacion)) {
    mostrarError("crear-ubicacion", "No se permiten caracteres especiales");
    valido = false;
  }

  if (!valido) return;

  const datos = {
    palabra_clave,
    ubicacion: ubicacion || null,
    frecuencia: document.getElementById("crear-frecuencia")?.value || "Diario",
    tipo_empleo: document.getElementById("crear-tipo_empleo")?.value || null,
    salario_minimo:
      document.getElementById("crear-salario_minimo")?.value || null,
  };

  try {
    const resp = await crearAlerta(datos);
    if (resp.error) {
      mostrarError("crear-palabra_clave", resp.error);
      return;
    }
    cerrarModalCrearAlerta();
    await cargarAlertas();
    mostrarToast("Alerta creada exitosamente!");
  } catch (err) {
    mostrarError("crear-palabra_clave", "Error al crear alerta");
  }
};

window.abrirEditarAlerta = async function (id_alerta) {
  try {
    const { alertas } = await getAlertas();
    const alerta = alertas.find((a) => a.id_alerta === id_alerta);
    if (!alerta) return;

    alertaEditandoId = id_alerta;
    document.getElementById("editar-palabra_clave").value =
      alerta.palabra_clave || "";
    document.getElementById("editar-ubicacion").value = alerta.ubicacion || "";
    document.getElementById("editar-frecuencia").value =
      alerta.frecuencia || "Diario";
    document.getElementById("editar-tipo_empleo").value =
      alerta.tipo_empleo || "";
    document.getElementById("editar-salario_minimo").value =
      alerta.salario_minimo || "";
    abrirModalEditarAlerta();
  } catch (err) {
    console.error("Error abriendo editar alerta:", err);
  }
};

window.guardarEdicionAlerta = async function () {
  limpiarTodos(["editar-palabra_clave", "editar-ubicacion"]);
  let valido = true;

  const palabra_clave = document
    .getElementById("editar-palabra_clave")
    ?.value.trim();
  const ubicacion = document.getElementById("editar-ubicacion")?.value.trim();

  if (!palabra_clave) {
    mostrarError("editar-palabra_clave", "La palabra clave es obligatoria");
    valido = false;
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/.test(palabra_clave)) {
    mostrarError(
      "editar-palabra_clave",
      "No se permiten caracteres especiales",
    );
    valido = false;
  }

  if (ubicacion && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,]+$/.test(ubicacion)) {
    mostrarError("editar-ubicacion", "No se permiten caracteres especiales");
    valido = false;
  }

  if (!valido) return;

  const datos = {
    palabra_clave,
    ubicacion: ubicacion || null,
    frecuencia: document.getElementById("editar-frecuencia")?.value || "Diario",
    tipo_empleo: document.getElementById("editar-tipo_empleo")?.value || null,
    salario_minimo:
      document.getElementById("editar-salario_minimo")?.value || null,
  };

  try {
    const resp = await actualizarAlerta(alertaEditandoId, datos);
    if (resp.error) {
      mostrarError("editar-palabra_clave", resp.error);
      return;
    }
    cerrarModalEditarAlerta();
    await cargarAlertas();
    mostrarToast("Alerta actualizada exitosamente!");
  } catch (err) {
    mostrarError("editar-palabra_clave", "Error al actualizar alerta");
  }
};

window.confirmarEliminarAlerta = function (id_alerta) {
  mostrarConfirmGeneral(
    "¿Estás seguro que deseas eliminar esta alerta?",
    async () => {
      try {
        await eliminarAlerta(id_alerta);
        await cargarAlertas();
        mostrarToast("Alerta eliminada correctamente");
      } catch (err) {
        alert("Error al eliminar alerta");
      }
    },
  );
};

// VALORACIONES

let valoracionEditandoId = null;

async function cargarValoraciones() {
  try {
    const { valoraciones } = await getValoraciones();
    const lista = document.getElementById("lista-valoraciones");
    if (!lista) return;

    if (!valoraciones || valoraciones.length === 0) {
      lista.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-star fs-1 d-block mb-3" style="color:var(--blue);opacity:.4"></i>
                    <p class="fw-semibold">No tienes valoraciones aún</p>
                    <p class="small">Valora las empresas donde has trabajado.</p>
                </div>`;
      return;
    }
    lista.innerHTML = valoraciones
      .map((v) => {
        const estrellas = Array.from(
          { length: 5 },
          (_, i) =>
            `<i class="bi ${i < Math.round(v.calificacion) ? "bi-star-fill" : "bi-star"}" style="color:#FDC700;font-size:1rem;"></i>`,
        ).join("");

        const fecha = new Date(v.fecha_valoracion).toLocaleDateString("es-ES");

        return `
        <div class="bg-white border rounded-3 p-4 mb-3">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="fw-bold" style="font-size:1rem;color:var(--dark);">${v.empresa?.nombre_empresa || ""}</div>
                    <div class="text-muted small">${fecha}</div>
                </div>
                <div class="d-flex gap-1">${estrellas}</div>
            </div>
            <p class="mt-2 mb-3" style="font-size:.9rem;color:var(--dark);">${v.comentario || ""}</p>
            <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary btn-sm rounded-2" style="font-size:.8rem;"
                    onclick="window.abrirEditarValoracion(${v.id_valoracion})">
                    Editar
                </button>
                <button class="btn btn-outline-secondary btn-sm rounded-2" style="font-size:.8rem;"
                    onclick="window.confirmarEliminarValoracion(${v.id_valoracion})">
                    Eliminar
                </button>
            </div>
        </div>`;
      })
      .join("");
  } catch (err) {
    console.error("Error cargando valoraciones:", err);
  }
}

function iniciarEstrellas(contenedorId, inputId) {
  const estrellas = document.querySelectorAll(`#${contenedorId} i`);
  const input = document.getElementById(inputId);

  estrellas.forEach((star) => {
    star.addEventListener("mouseover", () => {
      const val = parseInt(star.dataset.val);
      estrellas.forEach((s, i) => {
        s.className = i < val ? "bi bi-star-fill" : "bi bi-star";
      });
    });

    star.addEventListener("mouseout", () => {
      const current = parseInt(input.value) || 0;
      estrellas.forEach((s, i) => {
        s.className = i < current ? "bi bi-star-fill" : "bi bi-star";
      });
    });

    star.addEventListener("click", () => {
      input.value = star.dataset.val;
      const val = parseInt(star.dataset.val);
      estrellas.forEach((s, i) => {
        s.className = i < val ? "bi bi-star-fill" : "bi bi-star";
      });
    });
  });
}

async function cargarEmpresasSelect() {
  try {
    const { empresas } = await getTodasLasEmpresas();
    const select = document.getElementById("crear-val-empresa");
    if (!select || !empresas) return;
    select.innerHTML =
      '<option value="">Selecciona una empresa...</option>' +
      empresas
        .map(
          (e) => `<option value="${e.id_empresa}">${e.nombre_empresa}</option>`,
        )
        .join("");
  } catch (err) {
    console.error("Error cargando empresas:", err);
  }
}

document
  .getElementById("btnValorarEmpresa")
  ?.addEventListener("click", async () => {
    document.getElementById("crear-val-empresa").value = "";
    document.getElementById("crear-val-puesto").value = "";
    document.getElementById("crear-val-periodo").value = "";
    document.getElementById("crear-val-calificacion").value = "0";
    document
      .querySelectorAll("#crear-val-estrellas i")
      .forEach((s) => (s.className = "bi bi-star"));
    document.getElementById("crear-val-comentario").value = "";
    await cargarEmpresasSelect();
    iniciarEstrellas("crear-val-estrellas", "crear-val-calificacion");
    abrirModalCrearValoracion();
  });

window.guardarNuevaValoracion = async function () {
  limpiarTodos([
    "crear-val-empresa",
    "crear-val-puesto",
    "crear-val-periodo",
    "crear-val-calificacion",
    "crear-val-comentario",
  ]);
  let valido = true;

  const id_empresa = document.getElementById("crear-val-empresa")?.value;
  const puesto = document.getElementById("crear-val-puesto")?.value.trim();
  const periodo = document.getElementById("crear-val-periodo")?.value.trim();
  const calificacion = document.getElementById("crear-val-calificacion")?.value;
  const comentario = document
    .getElementById("crear-val-comentario")
    ?.value.trim();

  if (!id_empresa) {
    mostrarError("crear-val-empresa", "Selecciona una empresa");
    valido = false;
  }

  if (!puesto) {
    mostrarError("crear-val-puesto", "El puesto es obligatorio");
    valido = false;
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(puesto)) {
    mostrarError("crear-val-puesto", "Solo se permiten letras");
    valido = false;
  }

  if (periodo && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-]+$/.test(periodo)) {
    mostrarError("crear-val-periodo", "No se permiten caracteres especiales");
    valido = false;
  }

  if (!calificacion || calificacion === "0") {
    mostrarError("crear-val-calificacion", "Selecciona una calificación");
    valido = false;
  }

  if (!comentario) {
    mostrarError("crear-val-comentario", "La opinión es obligatoria");
    valido = false;
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:¿?¡!()\-'"]+$/.test(comentario)) {
    mostrarError(
      "crear-val-comentario",
      "No se permiten caracteres especiales",
    );
    valido = false;
  }

  if (!valido) return;

  const datos = {
    id_empresa: parseInt(id_empresa),
    puesto,
    periodo_trabajo: periodo || null,
    calificacion: parseFloat(calificacion),
    comentario,
  };

  try {
    const resp = await crearValoracion(datos);
    if (resp.error) {
      mostrarError("crear-val-empresa", resp.error);
      return;
    }
    cerrarModalCrearValoracion();
    await cargarValoraciones();
    mostrarToast("Valoración publicada exitosamente!");
  } catch (err) {
    mostrarError("crear-val-comentario", "Error al crear valoración");
  }
};

window.abrirEditarValoracion = async function (id_valoracion) {
  try {
    const { valoraciones } = await getValoraciones();
    const v = valoraciones.find((v) => v.id_valoracion === id_valoracion);
    if (!v) return;

    valoracionEditandoId = id_valoracion;
    document.getElementById("editar-val-empresa-nombre").value =
      v.empresa?.nombre_empresa || "";
    document.getElementById("editar-val-puesto").value = v.puesto || "";
    document.getElementById("editar-val-periodo").value =
      v.periodo_trabajo || "";
    document.getElementById("editar-val-calificacion").value =
      v.calificacion || 0;
    document.getElementById("editar-val-comentario").value = v.comentario || "";

    const cal = Math.round(v.calificacion);
    document.querySelectorAll("#editar-val-estrellas i").forEach((s, i) => {
      s.className = i < cal ? "bi bi-star-fill" : "bi bi-star";
    });

    iniciarEstrellas("editar-val-estrellas", "editar-val-calificacion");
    abrirModalEditarValoracion();
  } catch (err) {
    console.error("Error abriendo editar valoración:", err);
  }
};

window.guardarEdicionValoracion = async function () {
  limpiarTodos([
    "editar-val-puesto",
    "editar-val-periodo",
    "editar-val-calificacion",
    "editar-val-comentario",
  ]);
  let valido = true;

  const puesto = document.getElementById("editar-val-puesto")?.value.trim();
  const periodo = document.getElementById("editar-val-periodo")?.value.trim();
  const calificacion = document.getElementById(
    "editar-val-calificacion",
  )?.value;
  const comentario = document
    .getElementById("editar-val-comentario")
    ?.value.trim();

  if (!puesto) {
    mostrarError("editar-val-puesto", "El puesto es obligatorio");
    valido = false;
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(puesto)) {
    mostrarError("editar-val-puesto", "Solo se permiten letras");
    valido = false;
  }

  if (periodo && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-]+$/.test(periodo)) {
    mostrarError("editar-val-periodo", "No se permiten caracteres especiales");
    valido = false;
  }

  if (!calificacion || calificacion === "0") {
    mostrarError("editar-val-calificacion", "Selecciona una calificación");
    valido = false;
  }

  if (!comentario) {
    mostrarError("editar-val-comentario", "La opinión es obligatoria");
    valido = false;
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:¿?¡!()\-'"]+$/.test(comentario)) {
    mostrarError(
      "editar-val-comentario",
      "No se permiten caracteres especiales",
    );
    valido = false;
  }

  if (!valido) return;

  const datos = {
    puesto,
    periodo_trabajo: periodo || null,
    calificacion: parseFloat(calificacion),
    comentario,
  };

  try {
    const resp = await actualizarValoracion(valoracionEditandoId, datos);
    if (resp.error) {
      mostrarError("editar-val-puesto", resp.error);
      return;
    }
    cerrarModalEditarValoracion();
    await cargarValoraciones();
    mostrarToast("Valoración actualizada exitosamente!");
  } catch (err) {
    mostrarError("editar-val-comentario", "Error al actualizar valoración");
  }
};

window.confirmarEliminarValoracion = function (id_valoracion) {
  mostrarConfirmGeneral(
    "¿Estás seguro que deseas eliminar esta valoración?",
    async () => {
      try {
        await eliminarValoracion(id_valoracion);
        await cargarValoraciones();
        mostrarToast("Valoración eliminada correctamente");
      } catch (err) {
        alert("Error al eliminar valoración");
      }
    },
  );
};

function mostrarToast(mensaje, tipo = "success") {
  const toast = document.getElementById("toast");
  const icon = document.getElementById("toast-icon");
  const msg = document.getElementById("toast-msg");

  msg.textContent = mensaje;

  if (tipo === "success") {
    icon.className = "bi bi-check-circle-fill me-2";
    icon.style.color = "var(--blue)";
    toast.style.borderLeftColor = "var(--blue)";
  } else if (tipo === "error") {
    icon.className = "bi bi-x-circle-fill me-2";
    icon.style.color = "var(--coral)";
    toast.style.borderLeftColor = "var(--coral)";
  }

  toast.style.display = "flex";
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => (toast.style.display = "none"), 300);
  }, 3000);
}

function mostrarConfirm(mensaje, onAceptar) {
  const modal = document.getElementById("modal-confirm");
  modal.querySelector("p").textContent = mensaje;
  modal.style.display = "flex";

  document.getElementById("btn-aceptar-confirm").onclick = () => {
    modal.style.display = "none";
    onAceptar();
  };
  document.getElementById("btn-cancelar-confirm").onclick = () => {
    modal.style.display = "none";
  };
}

function mostrarConfirmGeneral(mensaje, onAceptar) {
  const modal = document.getElementById("modal-confirm-general");
  document.getElementById("modal-confirm-general-msg").textContent = mensaje;
  modal.style.display = "flex";

  document.getElementById("btn-aceptar-confirm-general").onclick = () => {
    modal.style.display = "none";
    onAceptar();
  };
  document.getElementById("btn-cancelar-confirm-general").onclick = () => {
    modal.style.display = "none";
  };
}
