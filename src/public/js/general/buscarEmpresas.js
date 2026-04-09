import { getTodasLasEmpresas, getStatsEmpresas } from '../api/generalApi.js';

const filtros = {
    busqueda:  '',
    industria: '',
    tamano:    ''
};

let empresasTotales = [];
let paginaActual    = 1;
const POR_PAGINA    = 10;

document.addEventListener('DOMContentLoaded', () => {
    leerParamsURL();
    registrarEventos();
    cargarStats();
    buscar();
});

function leerParamsURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('busqueda'))  {
        filtros.busqueda = params.get('busqueda');
        document.getElementById('input-busqueda-empresa').value = filtros.busqueda;
    }
    if (params.get('industria')) {
        filtros.industria = params.get('industria');
        activarFiltroBtn('.filtro-industria-btn', filtros.industria);
    }
    if (params.get('tamano')) {
        filtros.tamano = params.get('tamano');
        activarFiltroBtn('.filtro-tamanio-btn', filtros.tamano);
    }
}

function registrarEventos() {
    let debounceTimer;
    document.getElementById('input-busqueda-empresa')
        ?.addEventListener('input', e => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                filtros.busqueda = e.target.value.trim();
                buscar();
            }, 350);
        });

    document.querySelectorAll('.filtro-industria-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filtros.industria = btn.dataset.value;
            activarFiltroBtn('.filtro-industria-btn', filtros.industria);
            buscar();
        });
    });

    document.querySelectorAll('.filtro-tamanio-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filtros.tamano = btn.dataset.value;
            activarFiltroBtn('.filtro-tamanio-btn', filtros.tamano);
            buscar();
        });
    });

    document.getElementById('btn-limpiar-empresas')
        ?.addEventListener('click', limpiarFiltros);
}

function activarFiltroBtn(selector, value) {
    document.querySelectorAll(selector).forEach(btn => {
        const isActive = btn.dataset.value === value;
        btn.style.background  = isActive ? '#eef5fb' : '';
        btn.style.color       = isActive ? 'var(--blue)' : '';
        btn.style.fontWeight  = isActive ? '600' : '';
    });
}

function limpiarFiltros() {
    filtros.busqueda  = '';
    filtros.industria = '';
    filtros.tamano    = '';

    document.getElementById('input-busqueda-empresa').value = '';
    activarFiltroBtn('.filtro-industria-btn', '');
    activarFiltroBtn('.filtro-tamanio-btn',   '');

    window.history.replaceState({}, '', '/buscar-empresas');
    buscar();
}

async function cargarStats() {
    try {
        const { stats } = await getStatsEmpresas();
        document.getElementById('stat-empresas').textContent   = stats.totalEmpresas;
        document.getElementById('stat-empleos').textContent    = stats.empleosActivos;
        document.getElementById('stat-industrias').textContent = stats.totalIndustrias;
    } catch (err) {
        console.error('Error cargando stats:', err);
    }
}

function construirFiltrosAPI() {
    return {
        busqueda:  filtros.busqueda  || undefined,
        industria: filtros.industria || undefined,
        tamano:    filtros.tamano    || undefined
    };
}

function filtrarEnCliente(empresas) {
    return empresas.filter(emp => {
        if (filtros.tamano && emp.tamano_empresa) {
            if (!emp.tamano_empresa.includes(filtros.tamano)) return false;
        }
        return true;
    });
}

function actualizarContadoresFiltros(empresas) {
    const porIndustria = {};
    empresas.forEach(emp => {
        if (!emp.industria_empresa) return;
        porIndustria[emp.industria_empresa] = (porIndustria[emp.industria_empresa] || 0) + 1;
    });
    document.querySelectorAll('[data-count]').forEach(el => {
        const key = el.dataset.count;
        el.textContent = porIndustria[key] ?? 0;
    });

    const porTamano = {};
    empresas.forEach(emp => {
        if (!emp.tamano_empresa) return;
        document.querySelectorAll('.filtro-tamanio-btn[data-value]').forEach(btn => {
            const val = btn.dataset.value;
            if (!val) return;
            if (emp.tamano_empresa.includes(val)) {
                porTamano[val] = (porTamano[val] || 0) + 1;
            }
        });
    });
    document.querySelectorAll('.filtro-tamanio-btn[data-value]').forEach(btn => {
        const val = btn.dataset.value;
        if (!val) return;
        const countEl = btn.querySelector('span:last-child');
        if (countEl) countEl.textContent = porTamano[val] ?? 0;
    });
}

async function buscar() {
    const params = new URLSearchParams();
    if (filtros.busqueda)  params.set('busqueda',  filtros.busqueda);
    if (filtros.industria) params.set('industria', filtros.industria);
    if (filtros.tamano)    params.set('tamano',    filtros.tamano);
    window.history.replaceState(
        {},
        '',
        '/buscar-empresas' + (params.toString() ? '?' + params.toString() : '')
    );

    mostrarCargando();
    try {
        const apiFiltros = {
            busqueda:  filtros.busqueda  || undefined,
            industria: filtros.industria || undefined
        };
        const { empresas } = await getTodasLasEmpresas(apiFiltros);
        empresasTotales = filtrarEnCliente(empresas || []);
        paginaActual    = 1;

        actualizarContadoresFiltros(empresas || []);

        renderPagina();
    } catch (err) {
        console.error('Error buscando empresas:', err);
        mostrarError();
    }
}

function renderPagina() {
    const lista        = document.getElementById('lista-empresas');
    const contador     = document.getElementById('contador-empresas');
    const total        = empresasTotales.length;
    const totalPaginas = Math.ceil(total / POR_PAGINA);
    const inicio       = (paginaActual - 1) * POR_PAGINA;
    const fin          = Math.min(inicio + POR_PAGINA, total);
    const pagina       = empresasTotales.slice(inicio, fin);

    contador.textContent = `${total} empresa${total !== 1 ? 's' : ''} encontrada${total !== 1 ? 's' : ''}`;

    if (!total) {
        lista.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-building fs-1 d-block mb-3" style="color:var(--blue);opacity:.4"></i>
                <p class="fw-semibold">No se encontraron empresas</p>
                <p class="small">Intenta con otros filtros o términos de búsqueda.</p>
                <button class="btn btn-outline-secondary btn-sm mt-2"
                    onclick="document.getElementById('btn-limpiar-empresas').click()">
                    Limpiar filtros
                </button>
            </div>`;
        return;
    }

    lista.innerHTML = pagina.map(emp => renderCard(emp)).join('');

    if (totalPaginas > 1) {
        const rango = generarRangoPaginas(paginaActual, totalPaginas);
        lista.innerHTML += `
        <nav class="d-flex justify-content-between align-items-center mt-4 pt-2 flex-wrap gap-2">
            <span class="text-muted small">
                Mostrando ${inicio + 1}–${fin} de ${total} empresas
            </span>
            <ul class="pagination pagination-sm mb-0">
                <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
                    <button class="page-link" onclick="cambiarPaginaEmp(${paginaActual - 1})">
                        <i class="bi bi-chevron-left"></i>
                    </button>
                </li>
                ${rango.map(p => p === '...'
                    ? `<li class="page-item disabled"><span class="page-link">…</span></li>`
                    : `<li class="page-item">
                           <button class="page-link"
                               onclick="cambiarPaginaEmp(${p})"
                               style="${p === paginaActual
                                   ? 'background:var(--blue);border-color:var(--blue);color:#fff;font-weight:600'
                                   : ''}">
                               ${p}
                           </button>
                       </li>`
                ).join('')}
                <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
                    <button class="page-link" onclick="cambiarPaginaEmp(${paginaActual + 1})">
                        <i class="bi bi-chevron-right"></i>
                    </button>
                </li>
            </ul>
        </nav>`;
    }
}

function generarRangoPaginas(actual, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (actual <= 4)         return [1, 2, 3, 4, 5, '...', total];
    if (actual >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total];
    return [1, '...', actual - 1, actual, actual + 1, '...', total];
}

window.cambiarPaginaEmp = function(pagina) {
    const totalPaginas = Math.ceil(empresasTotales.length / POR_PAGINA);
    if (pagina < 1 || pagina > totalPaginas) return;
    paginaActual = pagina;
    renderPagina();
    document.getElementById('lista-empresas')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function renderCard(emp) {
    const iniciales  = obtenerIniciales(emp.nombre_empresa);
    const industria  = emp.industria_empresa || '';
    const ubicacion  = emp.ubicacion_empresa || 'Ubicación no especificada';
    const tamano     = emp.tamano_empresa    || '';
    const desc       = emp.descripcion_empresa
        ? emp.descripcion_empresa.substring(0, 130) + (emp.descripcion_empresa.length > 130 ? '…' : '')
        : '';
    const empleosActivos = emp.empleos_activos || 0;

    return `
    <a href="/detalle-empresa?id=${emp.id_empresa}" class="text-decoration-none">
        <div class="bg-white border rounded-3 p-4" role="button"
             style="transition:box-shadow .15s,border-color .15s;"
             onmouseover="this.style.borderColor='var(--blue)';this.style.boxShadow='0 2px 12px rgba(107,155,217,.15)'"
             onmouseout="this.style.borderColor='';this.style.boxShadow=''">
            <div class="d-flex align-items-start gap-3">

                <!-- Logo / Iniciales -->
                <div class="rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center fw-bold text-white"
                     style="width:56px;height:56px;background:var(--blue);font-family:'Poppins',sans-serif;font-size:1rem">
                    ${iniciales}
                </div>

                <div class="flex-grow-1 min-w-0">
                    <div class="d-flex justify-content-between align-items-start gap-2">
                        <div>
                            <div class="fw-semibold mb-1" style="color:var(--blue);font-size:1rem">
                                ${emp.nombre_empresa}
                            </div>
                            ${industria
                                ? `<span class="badge rounded-pill fw-normal mb-2"
                                          style="background:var(--sky);color:#fff;font-size:.72rem">
                                       ${industria}
                                   </span>`
                                : ''}
                        </div>
                        <i class="bi bi-chevron-right text-muted flex-shrink-0 ms-2 mt-1"></i>
                    </div>

                    ${desc ? `<p class="small text-muted mb-2">${desc}</p>` : ''}

                    <div class="d-flex flex-wrap gap-3 text-muted small mb-2">
                        <span><i class="bi bi-geo-alt me-1"></i>${ubicacion}</span>
                        ${tamano
                            ? `<span><i class="bi bi-people me-1"></i>${tamano}</span>`
                            : ''}
                        <span><i class="bi bi-briefcase me-1"></i>
                            ${empleosActivos} empleo${empleosActivos !== 1 ? 's' : ''} activo${empleosActivos !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div class="d-flex gap-2 mt-2">
                        <span class="btn btn-sm rounded-2 fw-semibold px-3"
                              style="background:var(--blue);color:#fff;font-size:.78rem;pointer-events:none">
                            Ver perfil
                        </span>
                        <span class="btn btn-sm rounded-2 fw-semibold px-3"
                              style="background:transparent;border:1.5px solid #dde5ed;color:var(--dark);font-size:.78rem;pointer-events:none">
                            Ver empleos (${empleosActivos})
                        </span>
                    </div>
                </div>

            </div>
        </div>
    </a>`;
}

function obtenerIniciales(nombre = '') {
    return nombre
        .split(' ')
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase() || '')
        .join('');
}

function mostrarCargando() {
    document.getElementById('contador-empresas').textContent = 'Buscando…';
    document.getElementById('lista-empresas').innerHTML = `
        <div class="bg-white border rounded-3 p-4" style="opacity:.6">
            <div class="d-flex gap-3 align-items-start">
                <div class="rounded-3 flex-shrink-0"
                     style="background:#e8eef4;width:56px;height:56px"></div>
                <div class="flex-grow-1 pt-1">
                    <div class="mb-2" style="background:#e8eef4;height:14px;width:40%;border-radius:4px"></div>
                    <div class="mb-3" style="background:#e8eef4;height:11px;width:60%;border-radius:4px"></div>
                    <div style="background:#e8eef4;height:11px;width:80%;border-radius:4px"></div>
                </div>
            </div>
        </div>
        <div class="bg-white border rounded-3 p-4" style="opacity:.4">
            <div class="d-flex gap-3 align-items-start">
                <div class="rounded-3 flex-shrink-0"
                     style="background:#e8eef4;width:56px;height:56px"></div>
                <div class="flex-grow-1 pt-1">
                    <div class="mb-2" style="background:#e8eef4;height:14px;width:50%;border-radius:4px"></div>
                    <div class="mb-3" style="background:#e8eef4;height:11px;width:45%;border-radius:4px"></div>
                    <div style="background:#e8eef4;height:11px;width:70%;border-radius:4px"></div>
                </div>
            </div>
        </div>
        <div class="bg-white border rounded-3 p-4" style="opacity:.25">
            <div class="d-flex gap-3 align-items-start">
                <div class="rounded-3 flex-shrink-0"
                     style="background:#e8eef4;width:56px;height:56px"></div>
                <div class="flex-grow-1 pt-1">
                    <div class="mb-2" style="background:#e8eef4;height:14px;width:35%;border-radius:4px"></div>
                    <div class="mb-3" style="background:#e8eef4;height:11px;width:55%;border-radius:4px"></div>
                    <div style="background:#e8eef4;height:11px;width:65%;border-radius:4px"></div>
                </div>
            </div>
        </div>`;
}

function mostrarError() {
    document.getElementById('contador-empresas').textContent = 'Error al cargar';
    document.getElementById('lista-empresas').innerHTML = `
        <div class="text-center text-muted py-5">
            <i class="bi bi-exclamation-circle fs-1 d-block mb-3" style="color:var(--coral)"></i>
            <p>No se pudieron cargar las empresas. Por favor, recarga la página.</p>
        </div>`;
}