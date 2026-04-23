import { getEmpleoPorId } from "../api/generalApi.js";

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const empresa = params.get("empresa");

  const btnVolver = document.getElementById("btn-volver");
  if (btnVolver && empresa) {
    btnVolver.href = `/detalle-empresa-admin?id=${empresa}&tab=empleos`;
  }

  if (!id) {
    mostrarError("No se especificó un empleo.");
    return;
  }

  cargarDetalle(id);
});

async function cargarDetalle(id) {
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

    document.title = `${data.empleo.titulo_empleo} – TeBuscan Admin`;
  } catch (err) {
    console.error("Error cargando detalle:", err);
    mostrarError("Error al cargar el empleo.");
  }
}

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
  return (
    "★".repeat(llenas) +
    `<span style="color:#e2e8f0">${"★".repeat(total - llenas)}</span>`
  );
}

function parsearLista(texto) {
  if (!texto) return [];
  return texto
    .split(/[\n;,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function renderHeader(emp) {
  const salario = formatSalario(emp.salario_min_empleo, emp.salario_max_empleo);

  document.getElementById("job-titulo").textContent = emp.titulo_empleo;
  document.getElementById("job-empresa").textContent =
    emp.empresa?.nombre_empresa || "";
  document.getElementById("job-ubicacion").textContent =
    emp.ubicacion_empleo || "No especificada";
  document.getElementById("job-tiempo").textContent = tiempoTranscurrido(
    emp.creacion_empleo,
  );
  document.getElementById("job-salario").textContent =
    salario || "No especificado";
  document.getElementById("job-tipo").textContent =
    emp.tipo_empleo || "No especificado";
  document.getElementById("job-experiencia").textContent =
    emp.nivel_experiencia_empleo || "No especificado";
  document.getElementById("job-contrato").textContent =
    emp.tipo_contrato_empleo || "No especificado";

  const badgesEl = document.getElementById("job-badges");
  badgesEl.innerHTML = "";
  if (emp.categoria_empleo)
    badgesEl.innerHTML += `<span class="badge-tech">${emp.categoria_empleo}</span>`;
  if (emp.estado_empleo === "activo")
    badgesEl.innerHTML += `<span class="badge-active">Contratación activa</span>`;
}

function renderDescripcion(emp) {
  const el = document.getElementById("job-descripcion");
  if (el)
    el.textContent = emp.descripcion_empleo || "Sin descripción disponible.";
}

function renderRequisitos(emp) {
  const el = document.getElementById("job-requisitos");
  const items = parsearLista(emp.requisitos_empleo);
  if (!el) return;
  el.innerHTML = items.length
    ? items.map((r) => `<li>${r}</li>`).join("")
    : "<li>Sin requisitos especificados.</li>";
}

function renderBeneficios(emp) {
  const el = document.getElementById("job-beneficios");
  const items = parsearLista(emp.beneficios_empleo);
  if (!el) return;
  el.innerHTML = items.length
    ? items
        .map(
          (b) =>
            `<div class="benefit-item"><i class="bi bi-check2"></i> ${b}</div>`,
        )
        .join("")
    : '<p class="text-muted small">Sin beneficios especificados.</p>';
}

function renderValoraciones(valoraciones, promedio, total) {
  const resumenEl = document.getElementById("valoraciones-resumen");
  const listaEl = document.getElementById("valoraciones-lista");
  if (!resumenEl || !listaEl) return;

  if (!total) {
    resumenEl.innerHTML = `<div class="rating-summary"><div class="text-muted small">Esta empresa aún no tiene valoraciones.</div></div>`;
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

  listaEl.innerHTML = valoraciones
    .slice(0, 2)
    .map((v) => {
      const nombre = v.candidato
        ? `${v.candidato.nombre_candidato} ${v.candidato.apellido_candidato}`
        : "Empleado anónimo";
      return `
        <div class="review-item">
            <div class="d-flex justify-content-between flex-wrap gap-1">
                <span class="reviewer-name">${nombre}</span>
                <span class="review-date">${tiempoTranscurrido(v.fecha_valoracion)}</span>
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

  const nameEl = document.getElementById("sidebar-empresa-nombre");
  if (nameEl) nameEl.textContent = empresa.nombre_empresa;

  const starsEl = document.getElementById("sidebar-empresa-estrellas");
  if (starsEl) {
    starsEl.innerHTML =
      total > 0
        ? `<span class="stars-yellow" style="font-size:.82rem">${estrellas(Math.round(promedio))}</span>
               <span style="font-size:.78rem;color:var(--dark);opacity:.6">(${total} valoraciones)</span>`
        : `<span style="font-size:.78rem;color:var(--dark);opacity:.5">Sin valoraciones</span>`;
  }

  const descEl = document.getElementById("sidebar-empresa-desc");
  if (descEl) descEl.textContent = empresa.descripcion_empresa || "";

  const infoEl = document.getElementById("sidebar-empresa-info");
  if (infoEl) {
    infoEl.innerHTML = `
            ${empresa.industria_empresa ? `<div class="company-info-row"><strong>Industria:</strong> ${empresa.industria_empresa}</div>` : ""}
            ${empresa.tamano_empresa ? `<div class="company-info-row"><strong>Tamaño:</strong> ${empresa.tamano_empresa}</div>` : ""}
            ${empresa.ubicacion_empresa ? `<div class="company-info-row"><strong>Ubicación:</strong> ${empresa.ubicacion_empresa}</div>` : ""}`;
  }

  const btnEl = document.getElementById("btn-ver-empresa");
  if (btnEl && empresa.id_empresa) {
    btnEl.href = `/detalle-empresa-admin?id=${empresa.id_empresa}`;
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
        <a href="/detalle-empleo-admin?id=${s.id_empleo}" class="text-decoration-none">
            <div class="similar-item">
                <div class="similar-title">${s.titulo_empleo}</div>
                <div class="similar-company">${s.empresa?.nombre_empresa || ""}</div>
                <div class="similar-loc"><i class="bi bi-geo-alt me-1"></i>${s.ubicacion_empleo || "No especificada"}</div>
            </div>
        </a>`,
    )
    .join("");
}

function mostrarError(msg) {
  const contenedor = document.querySelector(".col-12.col-lg-8");
  if (contenedor) {
    contenedor.innerHTML = `
            <div class="detail-card text-center py-5">
                <i class="bi bi-exclamation-circle fs-1 d-block mb-3" style="color:var(--coral)"></i>
                <p class="fw-semibold">${msg}</p>
                <a href="/panel-admin" class="btn btn-outline-secondary mt-2">Volver al panel</a>
            </div>`;
  }
}
