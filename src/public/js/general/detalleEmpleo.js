// ============================================================
// src/public/js/general/detalleEmpleo.js
// ============================================================
import { getEmpleoPorId } from "../api/generalApi.js";

// ── Inicialización ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    mostrarError("No se especificó un empleo.");
    return;
  }

  cargarDetalle(id);
});

// ── Cargar detalle completo ───────────────────────────────────
async function cargarDetalle(id) {
  mostrarCargando();
  try {
    const data = await getEmpleoPorId(id);

    if (!data?.empleo) {
      mostrarError("No se encontró el empleo solicitado.");
      return;
    }

    renderHeader(data.empleo);
    renderDescripcion(data.empleo);
    renderRequisitos(data.empleo);
    renderBeneficios(data.empleo);
    renderValoraciones(
      data.valoraciones,
      data.promedioValoracion,
      data.totalValoraciones,
    );
    renderSidebarEmpresa(
      data.empleo,
      data.promedioValoracion,
      data.totalValoraciones,
    );
    renderSimilares(data.similares);

    // Actualizar título del tab
    document.title = `${data.empleo.titulo_empleo} – TeBuscan`;
  } catch (err) {
    console.error("Error cargando detalle:", err);
    mostrarError("Error al cargar el empleo. Por favor recarga la página.");
  }
}

// ── Helpers ───────────────────────────────────────────────────
function tiempoTranscurrido(fechaISO) {
  if (!fechaISO) return "Fecha desconocida";
  const dias = Math.floor(
    (new Date() - new Date(fechaISO)) / (1000 * 60 * 60 * 24),
  );
  if (dias === 0) return "Publicado hoy";
  if (dias === 1) return "Publicado hace 1 día";
  return `Publicado hace ${dias} días`;
}

function formatSalario(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => Number(n).toLocaleString("es-ES") + "€";
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `Desde ${fmt(min)}`;
  return `Hasta ${fmt(max)}`;
}

function estrellas(calificacion, total = 5) {
  const llenas = Math.round(calificacion);
  const vacias = total - llenas;
  return (
    "★".repeat(llenas) +
    `<span style="color:#e2e8f0">${"★".repeat(vacias)}</span>`
  );
}

// Divide un texto por saltos de línea, comas o puntos y coma
// y devuelve un array limpio de ítems
function parsearLista(texto) {
  if (!texto) return [];
  return texto
    .split(/[\n;,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ── Renders ───────────────────────────────────────────────────

function renderHeader(emp) {
  const salario = formatSalario(emp.salario_min_empleo, emp.salario_max_empleo);
  const tiempo = tiempoTranscurrido(emp.creacion_empleo);
  const empresa = emp.empresa?.nombre_empresa || "Empresa";

  // Título y empresa
  document.getElementById("job-titulo").textContent = emp.titulo_empleo;
  document.getElementById("job-empresa").textContent = empresa;
  document.getElementById("job-ubicacion").textContent =
    emp.ubicacion_empleo || "No especificada";
  document.getElementById("job-tiempo").textContent = tiempo;

  // Meta pills
  document.getElementById("job-salario").textContent =
    salario || "No especificado";
  document.getElementById("job-tipo").textContent =
    emp.tipo_empleo || "No especificado";
  document.getElementById("job-experiencia").textContent =
    emp.nivel_experiencia_empleo || "No especificado";
  document.getElementById("job-contrato").textContent =
    emp.tipo_contrato_empleo || "No especificado";

  // Badges
  const badgesEl = document.getElementById("job-badges");
  badgesEl.innerHTML = "";
  if (emp.categoria_empleo) {
    badgesEl.innerHTML += `<span class="badge-tech">${emp.categoria_empleo}</span>`;
  }
  if (emp.estado_empleo === "activo") {
    badgesEl.innerHTML += `<span class="badge-active">Contratación activa</span>`;
  }
}

function renderDescripcion(emp) {
  const el = document.getElementById("job-descripcion");
  if (!el) return;
  el.textContent = emp.descripcion_empleo || "Sin descripción disponible.";
}

function renderRequisitos(emp) {
  const el = document.getElementById("job-requisitos");
  const items = parsearLista(emp.requisitos_empleo);

  if (!el) return;

  if (!items.length) {
    el.innerHTML = "<li>Sin requisitos especificados.</li>";
    return;
  }
  el.innerHTML = items.map((r) => `<li>${r}</li>`).join("");
}

function renderBeneficios(emp) {
  const el = document.getElementById("job-beneficios");
  const items = parsearLista(emp.beneficios_empleo);

  if (!el) return;

  if (!items.length) {
    el.innerHTML =
      '<p class="text-muted small">Sin beneficios especificados.</p>';
    return;
  }
  el.innerHTML = items
    .map(
      (b) => `
        <div class="benefit-item">
            <i class="bi bi-check2"></i> ${b}
        </div>`,
    )
    .join("");
}

function renderValoraciones(valoraciones, promedio, total) {
  const resumenEl = document.getElementById("valoraciones-resumen");
  const listaEl = document.getElementById("valoraciones-lista");
  if (!resumenEl || !listaEl) return;

  // Resumen
  if (!total || total === 0) {
    resumenEl.innerHTML = `
            <div class="rating-summary">
                <div class="text-muted small">Esta empresa aún no tiene valoraciones.</div>
            </div>`;
    listaEl.innerHTML = "";
    return;
  }

  resumenEl.innerHTML = `
        <div class="rating-summary">
            <div class="stars-yellow fs-5">${estrellas(Math.round(promedio))}</div>
            <div>
                <span class="rating-num">${promedio}/5</span>
                <span style="font-size:.83rem;color:var(--dark);opacity:.65;margin-left:6px">(${total} valoraciones)</span>
            </div>
        </div>`;

  // Primeras 2 reseñas
  listaEl.innerHTML = valoraciones
    .slice(0, 2)
    .map((v) => {
      const nombre = v.candidato
        ? `${v.candidato.nombre_candidato} ${v.candidato.apellido_candidato}`
        : "Empleado anónimo";
      const fecha = v.fecha_valoracion
        ? tiempoTranscurrido(v.fecha_valoracion)
        : "";

      return `
        <div class="review-item">
            <div class="d-flex justify-content-between flex-wrap gap-1">
                <span class="reviewer-name">${nombre}</span>
                <span class="review-date">${fecha}</span>
            </div>
            <div class="stars-yellow" style="font-size:.88rem">${estrellas(v.calificacion)}</div>
            <p class="review-text">${v.comentario || ""}</p>
        </div>`;
    })
    .join("");
}

function renderSidebarEmpresa(emp, promedio, total) {
  const empresa = emp.empresa;
  if (!empresa) return;

  // Nombre
  const nameEl = document.getElementById("sidebar-empresa-nombre");
  if (nameEl) nameEl.textContent = empresa.nombre_empresa;

  // Estrellas y conteo
  const starsEl = document.getElementById("sidebar-empresa-estrellas");
  if (starsEl) {
    if (total > 0) {
      starsEl.innerHTML = `
                <span class="stars-yellow" style="font-size:.82rem">${estrellas(Math.round(promedio))}</span>
                <span style="font-size:.78rem;color:var(--dark);opacity:.6">(${total} valoraciones)</span>`;
    } else {
      starsEl.innerHTML = `<span style="font-size:.78rem;color:var(--dark);opacity:.5">Sin valoraciones</span>`;
    }
  }

  // Descripción
  const descEl = document.getElementById("sidebar-empresa-desc");
  if (descEl) descEl.textContent = empresa.descripcion_empresa || "";

  // Info rows
  const infoEl = document.getElementById("sidebar-empresa-info");
  if (infoEl) {
    infoEl.innerHTML = `
            ${empresa.industria_empresa ? `<div class="company-info-row"><strong>Industria:</strong> ${empresa.industria_empresa}</div>` : ""}
            ${empresa.tamano_empresa ? `<div class="company-info-row"><strong>Tamaño:</strong> ${empresa.tamano_empresa}</div>` : ""}
            ${empresa.ubicacion_empresa ? `<div class="company-info-row"><strong>Ubicación:</strong> ${empresa.ubicacion_empresa}</div>` : ""}
            ${empresa.site_web_empresa ? `<div class="company-info-row"><strong>Web:</strong> <a href="${empresa.site_web_empresa}" target="_blank" style="color:var(--blue)">${empresa.site_web_empresa}</a></div>` : ""}`;
  }

  // ── Botón "Ver perfil de empresa" ──────────────────────────
  const btnEl = document.getElementById("btn-ver-empresa");
  if (btnEl && empresa.id_empresa) {
    btnEl.href = `/detalle-empresa?id=${empresa.id_empresa}`;
  }
}

function renderSimilares(similares) {
  const el = document.getElementById("similares-lista");
  if (!el) return;

  if (!similares?.length) {
    el.innerHTML = `<p class="text-muted small">No hay empleos similares disponibles.</p>`;
    return;
  }

  el.innerHTML = similares
    .map(
      (s) => `
        <a href="/detalle-empleo?id=${s.id_empleo}" class="text-decoration-none">
            <div class="similar-item">
                <div class="similar-title">${s.titulo_empleo}</div>
                <div class="similar-company">${s.empresa?.nombre_empresa || ""}</div>
                <div class="similar-loc">
                    <i class="bi bi-geo-alt me-1"></i>${s.ubicacion_empleo || "No especificada"}
                </div>
            </div>
        </a>`,
    )
    .join("");
}

// ── Estados UI ─────────────────────────────────────────────────
function mostrarCargando() {
  document.getElementById("job-titulo").textContent = "Cargando…";
  document.getElementById("job-empresa").textContent = "";
  document.getElementById("job-ubicacion").textContent = "";
  document.getElementById("job-tiempo").textContent = "";
  document.getElementById("job-salario").textContent = "…";
  document.getElementById("job-tipo").textContent = "…";
  document.getElementById("job-experiencia").textContent = "…";
  document.getElementById("job-contrato").textContent = "…";
  document.getElementById("job-descripcion").textContent =
    "Cargando descripción…";
  document.getElementById("job-requisitos").innerHTML = "<li>Cargando…</li>";
  document.getElementById("job-beneficios").innerHTML = "";
}

function mostrarError(msg) {
  document.getElementById("job-titulo").textContent = msg || "Error";
  document.getElementById("job-descripcion").textContent = "";
  document.getElementById("job-requisitos").innerHTML = "";
  document.getElementById("job-beneficios").innerHTML = "";

  const contenedor = document.querySelector(".col-12.col-lg-8");
  if (contenedor) {
    contenedor.innerHTML = `
            <div class="detail-card text-center py-5">
                <i class="bi bi-exclamation-circle fs-1 d-block mb-3" style="color:var(--coral)"></i>
                <p class="fw-semibold">${msg}</p>
                <a href="/buscar-empleos" class="btn btn-outline-secondary mt-2">Volver al listado</a>
            </div>`;
  }
}
