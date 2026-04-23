import {
  getEstadisticas,
  getCategorias,
  getEmpleosDestacados,
  getRecursosDestacados,
} from "../api/generalApi.js";

document.addEventListener("DOMContentLoaded", () => {
  cargarEstadisticas();
  cargarCategorias();
  cargarEmpleosDestacados();
  cargarRecursos();
});

function tiempoTranscurrido(fechaISO) {
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
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `Desde ${fmt(min)}`;
  return `Hasta ${fmt(max)}`;
}

async function cargarEstadisticas() {
  try {
    const { estadisticas } = await getEstadisticas();
    const mapa = {
      "stat-empleos": estadisticas.empleosActivos,
      "stat-empresas": estadisticas.empresasRegistradas,
      "stat-candidatos": estadisticas.candidatosActivos,
      "stat-contrataciones": estadisticas.contratacionesMes,
    };
    Object.entries(mapa).forEach(([id, valor]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = Number(valor).toLocaleString("es-ES");
    });
  } catch (err) {
    console.error("Error cargando Estadisticas:", err);
  }
}

async function cargarCategorias() {
  try {
    const { categorias } = await getCategorias();
    const contenedor = document.getElementById("categorias-grid");
    if (!contenedor || !categorias?.length) return;

    contenedor.innerHTML = categorias
      .map(
        (cat) => `
            <div class="col">
                <div class="category-card border rounded-3 p-4 text-center bg-white h-100" role="button"
                     onclick="window.location='/buscar-empleos-candidato?categoria=${encodeURIComponent(cat.nombre)}'">
                    <div class="fw-semibold small">${cat.nombre}</div>
                    <div class="text-muted" style="font-size:0.8rem">
                        ${cat.total} empleo${cat.total !== 1 ? "s" : ""}
                    </div>
                </div>
            </div>
        `,
      )
      .join("");
  } catch (err) {
    console.error("Error cargando categorías:", err);
  }
}

async function cargarEmpleosDestacados() {
  const contenedor = document.getElementById("empleos-destacados-grid");
  try {
    const { empleos } = await getEmpleosDestacados();
    if (!contenedor) return;

    if (!empleos?.length) {
      contenedor.innerHTML = `<div class="col-12 text-center text-muted py-4">No hay empleos disponibles.</div>`;
      return;
    }

    contenedor.innerHTML = empleos
      .map((empleo) => {
        const salario = formatSalario(
          empleo.salario_min_empleo,
          empleo.salario_max_empleo,
        );
        const empresa = empleo.empresa?.nombre_empresa || "Empresa";
        const tiempo = tiempoTranscurrido(empleo.creacion_empleo);

        return `
            <div class="col-12 col-md-6 col-lg-4">
                <a href="/detalle-empleo-candidato?id=${empleo.id_empleo}" class="text-decoration-none">
                    <div class="border rounded-3 p-4 h-100 bg-white" role="button"
                         style="transition: border-color .15s, box-shadow .15s;"
                         onmouseover="this.style.borderColor='var(--blue)';this.style.boxShadow='0 2px 12px rgba(107,155,217,.15)'"
                         onmouseout="this.style.borderColor='';this.style.boxShadow=''">
                        <div class="d-flex align-items-start gap-2 mb-1">
                            <div class="job-title flex-grow-1">${empleo.titulo_empleo}</div>
                            <span class="badge-new">Nuevo</span>
                        </div>
                        <div class="fw-semibold small mb-3">${empresa}</div>
                        <div class="d-flex flex-column gap-1 mb-3 text-muted small">
                            <div><i class="bi bi-geo-alt me-1"></i>${empleo.ubicacion_empleo || "No especificada"}</div>
                            ${salario ? `<div><i class="bi bi-currency-dollar me-1"></i>${salario}</div>` : ""}
                            <div><i class="bi bi-clock me-1"></i>${empleo.tipo_empleo || "No especificado"}</div>
                        </div>
                        <div class="d-flex gap-2 flex-wrap">
                            ${empleo.nivel_experiencia_empleo ? `<span class="badge rounded-pill text-bg-light border fw-normal">${empleo.nivel_experiencia_empleo}</span>` : ""}
                            ${empleo.tipo_contrato_empleo ? `<span class="badge rounded-pill text-bg-light border fw-normal">${empleo.tipo_contrato_empleo}</span>` : ""}
                        </div>
                        <div class="mt-2 text-muted" style="font-size:.72rem">${tiempo}</div>
                    </div>
                </a>
            </div>`;
      })
      .join("");
  } catch (err) {
    console.error("Error cargando empleos:", err);
    if (contenedor)
      contenedor.innerHTML = `<div class="col-12 text-center text-muted py-4">Error al cargar empleos.</div>`;
  }
}

async function cargarRecursos() {
  const contenedor = document.getElementById("recursos-grid");
  try {
    const { recursos } = await getRecursosDestacados();
    if (!contenedor) return;

    if (!recursos?.length) {
      contenedor.innerHTML = `<div class="col-12 text-center text-muted py-4">No hay recursos disponibles.</div>`;
      return;
    }

    contenedor.innerHTML = recursos
      .map((r) => {
        const autor = r.autor?.nombre_autor || "TeBuscan";
        const categoria = r.categoria?.nombre_categoria || null;

        return `
            <div class="col-12 col-md-4">
                <div class="border rounded-3 p-4 h-100 bg-white"
                     style="transition: border-color .15s, box-shadow .15s;"
                     onmouseover="this.style.borderColor='var(--blue)';this.style.boxShadow='0 2px 12px rgba(107,155,217,.12)'"
                     onmouseout="this.style.borderColor='';this.style.boxShadow=''">
                    ${categoria ? `<span class="badge rounded-pill mb-2 fw-normal" style="background:var(--sky);color:#fff;font-size:.72rem">${categoria}</span>` : ""}
                    <h5 class="fw-semibold">${r.titulo_recurso}</h5>
                    <p class="text-muted small">${r.descripcion || ""}</p>
                    <div class="d-flex align-items-center justify-content-between mt-auto">
                        <a href="/recursos-candidato" class="small fw-semibold text-decoration-none" style="color:var(--blue)">Leer más →</a>
                        <div class="d-flex align-items-center gap-2 text-muted" style="font-size:.78rem">
                            ${r.duracion_recurso ? `<span><i class="bi bi-clock me-1"></i>${r.duracion_recurso}</span>` : ""}
                            ${r.likes != null ? `<span><i class="bi bi-heart me-1"></i>${r.likes}</span>` : ""}
                        </div>
                    </div>
                    <div class="mt-2 text-muted" style="font-size:.75rem">
                        <i class="bi bi-person me-1"></i>${autor}
                    </div>
                </div>
            </div>`;
      })
      .join("");
  } catch (err) {
    console.error("Error cargando recursos:", err);
    if (contenedor)
      contenedor.innerHTML = `<div class="col-12 text-center text-muted py-4">Error al cargar recursos.</div>`;
  }
}