import { getTodosLosRecursos, getCategoriasRecursos } from '../api/generalApi.js';

const ICONOS_CATEGORIA = {
    'entrevistas': 'bi-person',
    'curriculum':  'bi-file-earmark-text',
    'carrera':     'bi-graph-up-arrow',
    'videos':      'bi-camera-video',
    'default':     'bi-book'
};

const COLORES_CATEGORIA = {
    'entrevistas': 'var(--blue)',
    'curriculum':  'var(--coral)',
    'carrera':     'var(--sky)',
    'videos':      'var(--blue)',
    'default':     'var(--dark)'
};

let categoriaActiva = null;
let busquedaActual  = '';

document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
    cargarRecursos();
    registrarEventos();
});

function registrarEventos() {
    const inputBusqueda = document.getElementById('input-busqueda-recursos');
    inputBusqueda?.addEventListener('input', () => {
        busquedaActual = inputBusqueda.value.trim();
        cargarRecursos();
    });
}

async function cargarCategorias() {
    try {
        const { categorias } = await getCategoriasRecursos();
        const grid = document.getElementById('categorias-recursos-grid');
        if (!grid || !categorias?.length) return;

        grid.innerHTML = categorias.map(cat => {
            const key   = cat.nombre_categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
            const icono = ICONOS_CATEGORIA[key]  || ICONOS_CATEGORIA['default'];
            const color = COLORES_CATEGORIA[key] || COLORES_CATEGORIA['default'];

            return `
            <div class="col">
                <div class="bg-white border rounded-3 p-4 text-center categoria-btn"
                     role="button"
                     data-id="${cat.id_categoria}"
                     style="cursor:pointer;transition:border-color .15s,box-shadow .15s;"
                     onclick="filtrarCategoria(${cat.id_categoria}, this)">
                    <i class="bi ${icono} fs-2 mb-2 d-block" style="color:${color}"></i>
                    <div class="fw-semibold">${cat.nombre_categoria}</div>
                    <div class="text-muted small">${cat.total} recurso${cat.total !== 1 ? 's' : ''}</div>
                </div>
            </div>`;
        }).join('');
    } catch (err) {
        console.error('Error cargando categorías:', err);
    }
}

window.filtrarCategoria = function(id, el) {
    if (categoriaActiva === id) {
        categoriaActiva = null;
        document.querySelectorAll('.categoria-btn').forEach(b => {
            b.style.borderColor = '';
            b.style.boxShadow   = '';
            b.style.background  = '';
        });
    } else {
        categoriaActiva = id;
        document.querySelectorAll('.categoria-btn').forEach(b => {
            const activo = Number(b.dataset.id) === id;
            b.style.borderColor = activo ? 'var(--blue)' : '';
            b.style.boxShadow   = activo ? '0 2px 10px rgba(107,155,217,.2)' : '';
            b.style.background  = activo ? '#f0f7ff' : '';
        });
    }
    cargarRecursos();
};

async function cargarRecursos() {
    mostrarCargando();
    try {
        const { recursos } = await getTodosLosRecursos({
            busqueda:  busquedaActual  || undefined,
            categoria: categoriaActiva || undefined
        });
        renderRecursos(recursos || []);
    } catch (err) {
        console.error('Error cargando recursos:', err);
    }
}

function formatFecha(fechaISO) {
    if (!fechaISO) return '';
    const d = new Date(fechaISO);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function iconoPorTipo(tipo) {
    if (!tipo) return 'bi-file-earmark-text';
    const t = tipo.toLowerCase();
    if (t.includes('video'))    return 'bi-camera-video';
    if (t.includes('tutorial')) return 'bi-book';
    return 'bi-file-earmark-text';
}

function nombreTipo(categoria) {
    if (!categoria?.tipo) return 'Artículo';
    const t = categoria.tipo.toLowerCase();
    if (t.includes('video'))    return 'Video';
    if (t.includes('tutorial')) return 'Tutorial';
    return 'Artículo';
}

function renderRecursos(recursos) {
    const lista    = document.getElementById('recursos-lista');
    const contador = document.getElementById('contador-recursos');
    if (!lista) return;

    if (contador) {
        contador.textContent = `${recursos.length} recurso${recursos.length !== 1 ? 's' : ''} encontrado${recursos.length !== 1 ? 's' : ''}`;
    }

    if (!recursos.length) {
        lista.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-search fs-1 d-block mb-3" style="color:var(--blue);opacity:.4"></i>
                <p class="fw-semibold">No se encontraron recursos</p>
                <p class="small">Intenta con otros términos o selecciona otra categoría.</p>
            </div>`;
        return;
    }

    lista.innerHTML = recursos.map(r => {
        const autor     = r.autor?.nombre_autor   || 'TeBuscan';
        const catNombre = r.categoria?.nombre_categoria || '';
        const tipo      = nombreTipo(r.categoria);
        const icono     = iconoPorTipo(r.categoria?.tipo);
        const fecha     = formatFecha(r.fecha_recurso);

        return `
        <div class="bg-white border rounded-3 p-4"
             style="transition:border-color .15s,box-shadow .15s;"
             onmouseover="this.style.borderColor='var(--blue)';this.style.boxShadow='0 2px 10px rgba(107,155,217,.12)'"
             onmouseout="this.style.borderColor='';this.style.boxShadow=''">
            <div class="d-flex align-items-start gap-3">
                <div class="rounded-3 p-2 flex-shrink-0 d-flex align-items-center justify-content-center border"
                     style="width:48px;height:48px;background:var(--cream)">
                    <i class="bi ${icono}" style="color:var(--blue)"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-1">
                        <div>
                            <span class="fw-semibold me-2" style="color:var(--dark)">${r.titulo_recurso}</span>
                            <span class="text-muted small me-2">${tipo}</span>
                            ${catNombre ? `<span class="badge-new">${catNombre}</span>` : ''}
                        </div>
                    </div>
                    <div class="text-muted small mb-2">
                        <i class="bi bi-person me-1"></i>${autor}
                        ${r.duracion_recurso ? `<i class="bi bi-clock ms-2 me-1"></i>${r.duracion_recurso}` : ''}
                        ${fecha ? `<span class="ms-2">${fecha}</span>` : ''}
                        ${r.likes != null ? `<i class="bi bi-heart ms-2 me-1"></i>${r.likes}` : ''}
                    </div>
                    <p class="small text-muted mb-2">${r.descripcion || ''}</p>
                    <a href="/detalle-recurso?id=${r.id_recurso}"
                       class="small fw-semibold text-decoration-none"
                       style="color:var(--blue)">
                        Leer más →
                    </a>
                </div>
            </div>
        </div>`;
    }).join('');
}

function mostrarCargando() {
    const lista = document.getElementById('recursos-lista');
    if (!lista) return;
    lista.innerHTML = `
        <div class="bg-white border rounded-3 p-4" style="opacity:.5">
            <div class="d-flex gap-3">
                <div class="rounded-3 border flex-shrink-0" style="width:48px;height:48px;background:var(--cream)"></div>
                <div class="flex-grow-1 pt-1">
                    <div style="background:#e8eef4;height:14px;width:55%;border-radius:4px;margin-bottom:8px"></div>
                    <div style="background:#e8eef4;height:11px;width:35%;border-radius:4px"></div>
                </div>
            </div>
        </div>`;
}