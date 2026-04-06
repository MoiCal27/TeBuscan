// ============================================================
// src/public/js/general/buscarEmpleos.js
// ============================================================
import { getTodosLosEmpleos } from '../api/generalApi.js';

// ── Estado global ─────────────────────────────────────────────
const filtros = {
    busqueda:    '',
    ubicacion:   '',
    categorias:  [],
    experiencia: [],
    contratos:   [],
    salario_min: null,
    salario_max: null
};

let empleosTotales = [];
let paginaActual   = 1;
const POR_PAGINA   = 10;

// ── Inicialización ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    leerParamsURL();
    registrarEventos();
    buscar();
});

// ── Leer parámetros de la URL (viene del hero de la landing) ──
function leerParamsURL() {
    const params = new URLSearchParams(window.location.search);

    if (params.get('busqueda')) {
        filtros.busqueda = params.get('busqueda');
        document.getElementById('input-busqueda').value = filtros.busqueda;
    }
    if (params.get('ubicacion')) {
        filtros.ubicacion = params.get('ubicacion');
        document.getElementById('input-ubicacion').value = filtros.ubicacion;
    }
    if (params.get('categoria')) {
        const cat = params.get('categoria');
        filtros.categorias = [cat];
        document.querySelectorAll('.filtro-categoria').forEach(cb => {
            if (cb.value === cat) cb.checked = true;
        });
    }
}

// ── Registrar eventos ─────────────────────────────────────────
function registrarEventos() {
    // Botón buscar
    document.getElementById('btn-buscar')
        ?.addEventListener('click', aplicarBusqueda);

    // Enter en los inputs
    ['input-busqueda', 'input-ubicacion'].forEach(id => {
        document.getElementById(id)?.addEventListener('keydown', e => {
            if (e.key === 'Enter') aplicarBusqueda();
        });
    });

    // Checkboxes — categoría
    document.querySelectorAll('.filtro-categoria').forEach(cb => {
        cb.addEventListener('change', () => {
            filtros.categorias = [...document.querySelectorAll('.filtro-categoria:checked')]
                .map(c => c.value);
            buscar();
        });
    });

    // Checkboxes — experiencia
    document.querySelectorAll('.filtro-experiencia').forEach(cb => {
        cb.addEventListener('change', () => {
            filtros.experiencia = [...document.querySelectorAll('.filtro-experiencia:checked')]
                .map(c => c.value);
            buscar();
        });
    });

    // Checkboxes — contrato
    document.querySelectorAll('.filtro-contrato').forEach(cb => {
        cb.addEventListener('change', () => {
            filtros.contratos = [...document.querySelectorAll('.filtro-contrato:checked')]
                .map(c => c.value);
            buscar();
        });
    });

    // Checkboxes — salario
    document.querySelectorAll('.filtro-salario').forEach(cb => {
        cb.addEventListener('change', () => {
            const checked = [...document.querySelectorAll('.filtro-salario:checked')];
            if (!checked.length) {
                filtros.salario_min = null;
                filtros.salario_max = null;
            } else {
                filtros.salario_min = Math.min(...checked.map(c => Number(c.dataset.min || 0)));
                filtros.salario_max = Math.max(...checked.map(c => Number(c.dataset.max || 999999)));
            }
            buscar();
        });
    });

    // Limpiar filtros
    document.getElementById('btn-limpiar')?.addEventListener('click', limpiarFiltros);
}

// ── Aplicar búsqueda desde los inputs ────────────────────────
function aplicarBusqueda() {
    filtros.busqueda  = document.getElementById('input-busqueda').value.trim();
    filtros.ubicacion = document.getElementById('input-ubicacion').value.trim();
    buscar();
}

// ── Limpiar filtros ───────────────────────────────────────────
function limpiarFiltros() {
    filtros.busqueda    = '';
    filtros.ubicacion   = '';
    filtros.categorias  = [];
    filtros.experiencia = [];
    filtros.contratos   = [];
    filtros.salario_min = null;
    filtros.salario_max = null;

    document.getElementById('input-busqueda').value  = '';
    document.getElementById('input-ubicacion').value = '';
    document.querySelectorAll(
        '.filtro-categoria, .filtro-experiencia, .filtro-contrato, .filtro-salario'
    ).forEach(cb => cb.checked = false);

    window.history.replaceState({}, '', '/buscar-empleos');
    buscar();
}

// ── Construir filtros para la API ─────────────────────────────
function construirFiltrosAPI() {
    return {
        busqueda:    filtros.busqueda        || undefined,
        ubicacion:   filtros.ubicacion       || undefined,
        categoria:   filtros.categorias[0]   || undefined,
        experiencia: filtros.experiencia[0]  || undefined,
        contrato:    filtros.contratos[0]    || undefined,
        salario_min: filtros.salario_min     || undefined,
        salario_max: filtros.salario_max     || undefined
    };
}

// ── Filtrado en cliente (múltiples checkboxes) ────────────────
function filtrarEnCliente(empleos) {
    return empleos.filter(emp => {
        if (filtros.categorias.length > 1 &&
            !filtros.categorias.includes(emp.categoria_empleo)) return false;
        if (filtros.experiencia.length > 1 &&
            !filtros.experiencia.includes(emp.nivel_experiencia_empleo)) return false;
        if (filtros.contratos.length > 1 &&
            !filtros.contratos.includes(emp.tipo_contrato_empleo)) return false;
        return true;
    });
}

// ── Buscar ────────────────────────────────────────────────────
async function buscar() {
    // Persistir búsqueda en URL
    const params = new URLSearchParams();
    if (filtros.busqueda)  params.set('busqueda',  filtros.busqueda);
    if (filtros.ubicacion) params.set('ubicacion', filtros.ubicacion);
    window.history.replaceState(
        {},
        '',
        '/buscar-empleos' + (params.toString() ? '?' + params.toString() : '')
    );

    mostrarCargando();
    try {
        const { empleos } = await getTodosLosEmpleos(construirFiltrosAPI());
        empleosTotales = filtrarEnCliente(empleos || []);
        paginaActual   = 1;
        renderPagina();
    } catch (err) {
        console.error('Error buscando empleos:', err);
        mostrarError();
    }
}

// ── Paginación ────────────────────────────────────────────────
function renderPagina() {
    const lista        = document.getElementById('lista-empleos');
    const contador     = document.getElementById('contador-empleos');
    const total        = empleosTotales.length;
    const totalPaginas = Math.ceil(total / POR_PAGINA);
    const inicio       = (paginaActual - 1) * POR_PAGINA;
    const fin          = Math.min(inicio + POR_PAGINA, total);
    const pagina       = empleosTotales.slice(inicio, fin);

    contador.textContent = `${total} empleo${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`;

    if (!total) {
        lista.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-search fs-1 d-block mb-3" style="color:var(--blue);opacity:.4"></i>
                <p class="fw-semibold">No se encontraron empleos</p>
                <p class="small">Intenta con otros filtros o términos de búsqueda.</p>
                <button class="btn btn-outline-secondary btn-sm mt-2"
                    onclick="document.getElementById('btn-limpiar').click()">
                    Limpiar filtros
                </button>
            </div>`;
        return;
    }

    // Cards de la página actual
    lista.innerHTML = pagina.map(emp => renderCard(emp)).join('');

    // Paginador solo si hay más de una página
    if (totalPaginas > 1) {
        const rango = generarRangoPaginas(paginaActual, totalPaginas);

        lista.innerHTML += `
        <nav class="d-flex justify-content-between align-items-center mt-4 pt-2 flex-wrap gap-2">
            <span class="text-muted small">
                Mostrando ${inicio + 1}–${fin} de ${total} empleos
            </span>
            <ul class="pagination pagination-sm mb-0">
                <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
                    <button class="page-link" onclick="cambiarPagina(${paginaActual - 1})">
                        <i class="bi bi-chevron-left"></i>
                    </button>
                </li>
                ${rango.map(p => p === '...'
                    ? `<li class="page-item disabled"><span class="page-link">…</span></li>`
                    : `<li class="page-item">
                           <button class="page-link"
                               onclick="cambiarPagina(${p})"
                               style="${p === paginaActual
                                   ? 'background:var(--blue);border-color:var(--blue);color:#fff;font-weight:600'
                                   : ''}">
                               ${p}
                           </button>
                       </li>`
                ).join('')}
                <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
                    <button class="page-link" onclick="cambiarPagina(${paginaActual + 1})">
                        <i class="bi bi-chevron-right"></i>
                    </button>
                </li>
            </ul>
        </nav>`;
    }
}

// Rango inteligente de páginas: máx 7 botones visibles
function generarRangoPaginas(actual, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    if (actual <= 4)        return [1, 2, 3, 4, 5, '...', total];
    if (actual >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total];
    return [1, '...', actual - 1, actual, actual + 1, '...', total];
}

// Global para los onclick del paginador
window.cambiarPagina = function(pagina) {
    const totalPaginas = Math.ceil(empleosTotales.length / POR_PAGINA);
    if (pagina < 1 || pagina > totalPaginas) return;
    paginaActual = pagina;
    renderPagina();
    document.getElementById('lista-empleos')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ── Render de una card ────────────────────────────────────────
function renderCard(emp) {
    const salario = formatSalario(emp.salario_min_empleo, emp.salario_max_empleo);
    const empresa = emp.empresa?.nombre_empresa || 'Empresa';
    const tiempo  = tiempoTranscurrido(emp.creacion_empleo);
    const desc    = emp.descripcion_empleo
        ? emp.descripcion_empleo.substring(0, 120) + (emp.descripcion_empleo.length > 120 ? '…' : '')
        : '';

    return `
    <a href="/detalle-empleo?id=${emp.id_empleo}" class="text-decoration-none">
        <div class="bg-white border rounded-3 p-4" role="button"
             style="transition:box-shadow .15s,border-color .15s;"
             onmouseover="this.style.borderColor='var(--blue)';this.style.boxShadow='0 2px 12px rgba(107,155,217,.15)'"
             onmouseout="this.style.borderColor='';this.style.boxShadow=''">
            <div class="d-flex align-items-start gap-3">
                <div class="rounded-3 p-2 flex-shrink-0 d-flex align-items-center justify-content-center"
                     style="background:var(--sky);width:52px;height:52px">
                    <i class="bi bi-building text-white fs-4"></i>
                </div>
                <div class="flex-grow-1 min-w-0">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <div class="job-title fs-6 mb-1">${emp.titulo_empleo}</div>
                            <div class="fw-semibold small text-dark mb-2">${empresa}</div>
                        </div>
                        <i class="bi bi-chevron-right text-muted flex-shrink-0 ms-2"></i>
                    </div>
                    <div class="d-flex flex-wrap gap-3 text-muted small mb-2">
                        <span><i class="bi bi-geo-alt me-1"></i>${emp.ubicacion_empleo || 'No especificada'}</span>
                        ${salario ? `<span><i class="bi bi-currency-dollar me-1"></i>${salario}</span>` : ''}
                        ${emp.tipo_empleo ? `<span><i class="bi bi-clock me-1"></i>${emp.tipo_empleo}</span>` : ''}
                        ${emp.nivel_experiencia_empleo ? `<span><i class="bi bi-briefcase me-1"></i>${emp.nivel_experiencia_empleo}</span>` : ''}
                    </div>
                    ${desc ? `<p class="small text-muted mb-2">${desc}</p>` : ''}
                    <div class="d-flex flex-wrap gap-2 align-items-center">
                        ${emp.categoria_empleo
                            ? `<span class="badge rounded-pill text-bg-light border fw-normal">${emp.categoria_empleo}</span>`
                            : ''}
                        ${emp.tipo_contrato_empleo
                            ? `<span class="badge rounded-pill text-bg-light border fw-normal">${emp.tipo_contrato_empleo}</span>`
                            : ''}
                        <span class="badge-new">${tiempo}</span>
                    </div>
                </div>
            </div>
        </div>
    </a>`;
}

// ── Helpers ───────────────────────────────────────────────────
function tiempoTranscurrido(fechaISO) {
    const dias = Math.floor((new Date() - new Date(fechaISO)) / (1000 * 60 * 60 * 24));
    if (dias === 0) return 'Publicado hoy';
    if (dias === 1) return 'Publicado hace 1 día';
    return `Publicado hace ${dias} días`;
}

function formatSalario(min, max) {
    if (!min && !max) return null;
    const fmt = n => Number(n).toLocaleString('es-ES') + '€';
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `Desde ${fmt(min)}`;
    return `Hasta ${fmt(max)}`;
}

// ── Estados UI ────────────────────────────────────────────────
function mostrarCargando() {
    document.getElementById('contador-empleos').textContent = 'Buscando…';
    document.getElementById('lista-empleos').innerHTML = `
        <div class="bg-white border rounded-3 p-4" style="opacity:.5">
            <div class="d-flex gap-3">
                <div class="rounded-3 flex-shrink-0"
                     style="background:var(--sky);width:52px;height:52px"></div>
                <div class="flex-grow-1 pt-1">
                    <div class="mb-2" style="background:#e8eef4;height:14px;width:55%;border-radius:4px"></div>
                    <div style="background:#e8eef4;height:11px;width:35%;border-radius:4px"></div>
                </div>
            </div>
        </div>
        <div class="bg-white border rounded-3 p-4" style="opacity:.3">
            <div class="d-flex gap-3">
                <div class="rounded-3 flex-shrink-0"
                     style="background:var(--sky);width:52px;height:52px"></div>
                <div class="flex-grow-1 pt-1">
                    <div class="mb-2" style="background:#e8eef4;height:14px;width:45%;border-radius:4px"></div>
                    <div style="background:#e8eef4;height:11px;width:30%;border-radius:4px"></div>
                </div>
            </div>
        </div>`;
}

function mostrarError() {
    document.getElementById('contador-empleos').textContent = 'Error al cargar';
    document.getElementById('lista-empleos').innerHTML = `
        <div class="text-center text-muted py-5">
            <i class="bi bi-exclamation-circle fs-1 d-block mb-3" style="color:var(--coral)"></i>
            <p>No se pudieron cargar los empleos. Por favor, recarga la página.</p>
        </div>`;
}