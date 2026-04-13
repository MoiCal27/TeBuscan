import { getEmpresaPorId } from '../api/generalApi.js';

let empresaData      = null;
let empleosData      = [];
let valoracionesData = [];

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id     = params.get('id');
    const tab    = params.get('tab');

    if (!id) {
        mostrarError('No se especificó una empresa.');
        return;
    }

    cargarEmpresa(id, tab);
    registrarTabs();
});

async function cargarEmpresa(id, tabInicial) {
    try {
        const data = await getEmpresaPorId(id);

        empresaData      = data.empresa;
        empleosData      = data.empleos      || [];
        valoracionesData = data.valoraciones || [];

        const promedio     = data.promedioValoracion       || 0;
        const total        = data.totalValoraciones        || 0;
        const distribucion = data.distribucionValoraciones || { 5:0, 4:0, 3:0, 2:0, 1:0 };

        renderHeader(empresaData, promedio, total);
        renderTabAcerca(empresaData);
        renderTabEmpleos(empleosData, id);
        renderTabValoraciones(valoracionesData, promedio, total, distribucion);

        document.getElementById('tab-empleos-label').textContent =
            `Empleos (${empleosData.length})`;

        // Si viene con ?tab=empleos lo abre directamente
        if (tabInicial === 'empleos') {
            const btnEmpleos = document.querySelector('[data-tab="empleos"]');
            if (btnEmpleos) cambiarTab('empleos');
        }

    } catch (err) {
        console.error('Error cargando empresa:', err);
        mostrarError('No se pudo cargar la empresa.');
    }
}

function renderHeader(emp, promedio, total) {
    const iniciales = obtenerIniciales(emp.nombre_empresa);

    document.getElementById('empresa-iniciales').textContent  = iniciales;
    document.getElementById('empresa-nombre').textContent     = emp.nombre_empresa;
    document.getElementById('empresa-desc').textContent       = emp.descripcion_empresa || '';
    document.getElementById('empresa-ubicacion').textContent  = emp.ubicacion_empresa   || '–';
    document.getElementById('empresa-tamano').textContent     = emp.tamano_empresa      || '–';
    document.getElementById('empresa-industria').textContent  = emp.industria_empresa   || '–';

    if (total > 0) {
        document.getElementById('empresa-rating').textContent =
            `⭐ ${promedio} (${total} valoracion${total !== 1 ? 'es' : ''})`;
    } else {
        document.getElementById('empresa-rating').textContent = 'Sin valoraciones aún';
        document.getElementById('empresa-rating').style.color = 'rgba(255,255,255,.7)';
    }

    document.title = `TeBuscan Admin - ${emp.nombre_empresa}`;
}

function renderTabAcerca(emp) {
    const el = document.getElementById('pane-acerca');

    const desc = emp.descripcion_empresa
        ? `<p class="mb-0" style="line-height:1.75;color:var(--dark)">${emp.descripcion_empresa}</p>`
        : `<p class="text-muted small mb-0">Esta empresa aún no ha añadido una descripción.</p>`;

    const sitio = emp.site_web_empresa
        ? `<div class="d-flex align-items-center gap-2 mt-3">
               <i class="bi bi-globe" style="color:var(--blue)"></i>
               <a href="${emp.site_web_empresa}" target="_blank" rel="noopener"
                  class="small text-decoration-none" style="color:var(--blue)">
                   ${emp.site_web_empresa}
               </a>
           </div>`
        : '';

    el.innerHTML = `
        <div class="row g-4">
            <div class="col-12 col-lg-8">
                <div class="bg-white border rounded-3 p-4">
                    <h6 class="fw-bold mb-3">Sobre ${emp.nombre_empresa}</h6>
                    ${desc}
                    ${sitio}
                </div>
            </div>
            <div class="col-12 col-lg-4">
                <div class="bg-white border rounded-3 p-4">
                    <h6 class="fw-bold mb-3">Información</h6>
                    <div class="d-flex flex-column gap-3">
                        <div>
                            <div class="text-muted small mb-1">Industria</div>
                            <div class="fw-semibold small">${emp.industria_empresa || '–'}</div>
                        </div>
                        <div>
                            <div class="text-muted small mb-1">Tamaño de empresa</div>
                            <div class="fw-semibold small">${emp.tamano_empresa || '–'}</div>
                        </div>
                        <div>
                            <div class="text-muted small mb-1">Ubicación</div>
                            <div class="fw-semibold small">${emp.ubicacion_empresa || '–'}</div>
                        </div>
                        <div>
                            <div class="text-muted small mb-1">Empleos activos</div>
                            <div class="fw-semibold small">${empleosData.length} vacante${empleosData.length !== 1 ? 's' : ''}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

function renderTabEmpleos(empleos, idEmpresa) {
    const el = document.getElementById('pane-empleos');

    if (!empleos.length) {
        el.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-briefcase fs-1 d-block mb-3" style="color:var(--blue);opacity:.4"></i>
                <p class="fw-semibold">No hay empleos activos en este momento</p>
            </div>`;
        return;
    }

    el.innerHTML = `
        <div class="d-flex flex-column gap-3">
            ${empleos.map(emp => renderCardEmpleo(emp, idEmpresa)).join('')}
        </div>`;
}

function renderCardEmpleo(emp, idEmpresa) {
    const salario = formatSalario(emp.salario_min_empleo, emp.salario_max_empleo);
    const fecha   = new Date(emp.creacion_empleo).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'numeric', year: 'numeric'
    });
    const desc = emp.descripcion_empleo
        ? emp.descripcion_empleo.substring(0, 120) + (emp.descripcion_empleo.length > 120 ? '…' : '')
        : '';

    return `
    <div class="bg-white border rounded-3 p-4"
         style="transition:border-color .15s"
         onmouseover="this.style.borderColor='var(--blue)'"
         onmouseout="this.style.borderColor=''">
        <div class="d-flex justify-content-between align-items-start gap-3">
            <div class="flex-grow-1">
                <div class="fw-semibold mb-1" style="color:var(--blue);font-size:.97rem">
                    ${emp.titulo_empleo}
                </div>
                <div class="d-flex flex-wrap gap-3 text-muted small mb-2">
                    <span><i class="bi bi-geo-alt me-1"></i>${emp.ubicacion_empleo || '–'}</span>
                    ${emp.tipo_empleo ? `<span><i class="bi bi-clock me-1"></i>${emp.tipo_empleo}</span>` : ''}
                    <span><i class="bi bi-calendar3 me-1"></i>Publicado ${fecha}</span>
                </div>
                ${desc ? `<p class="small text-muted mb-2">${desc}</p>` : ''}
                <div class="d-flex flex-wrap gap-2 mt-2">
                    ${salario ? `<span class="badge rounded-pill fw-normal" style="background:var(--coral);color:#fff;font-size:.75rem">${salario}</span>` : ''}
                    ${emp.nivel_experiencia_empleo ? `<span class="badge rounded-pill text-bg-light border fw-normal small">${emp.nivel_experiencia_empleo}</span>` : ''}
                    ${emp.tipo_contrato_empleo ? `<span class="badge rounded-pill text-bg-light border fw-normal small">${emp.tipo_contrato_empleo}</span>` : ''}
                </div>
            </div>
            <a href="/detalle-empleo-admin?id=${emp.id_empleo}&empresa=${idEmpresa}"
               class="btn btn-sm rounded-2 fw-semibold flex-shrink-0"
               style="background:var(--coral);color:#fff;font-size:.82rem;white-space:nowrap">
                Ver empleo
            </a>
        </div>
    </div>`;
}

function renderTabValoraciones(valoraciones, promedio, total, distribucion) {
    const el = document.getElementById('pane-valoraciones');

    if (!total) {
        el.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-star fs-1 d-block mb-3" style="color:var(--blue);opacity:.4"></i>
                <p class="fw-semibold">Sin valoraciones todavía</p>
            </div>`;
        return;
    }

    const maxCount = Math.max(...Object.values(distribucion), 1);
    const barras = [5, 4, 3, 2, 1].map(n => {
        const count = distribucion[n] || 0;
        const pct   = Math.round((count / maxCount) * 100);
        return `
        <div class="d-flex align-items-center gap-2 mb-1">
            <span class="text-muted small" style="width:14px">${n}</span>
            <i class="bi bi-star-fill" style="color:#FDC700;font-size:.7rem"></i>
            <div class="flex-grow-1 rounded" style="background:#e8eef4;height:8px">
                <div class="rounded" style="background:#FDC700;height:8px;width:${pct}%;transition:width .4s"></div>
            </div>
            <span class="text-muted small" style="width:22px;text-align:right">${count}</span>
        </div>`;
    }).join('');

    const cards = valoraciones.map(v => {
        const nombre = v.candidato
            ? `${v.candidato.nombre_candidato} ${v.candidato.apellido_candidato}`
            : 'Candidato anónimo';
        const estrellas = renderEstrellas(Number(v.calificacion));
        const fecha = new Date(v.fecha_valoracion).toLocaleDateString('es-ES', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        return `
        <div class="bg-white border rounded-3 p-4">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <div class="fw-semibold small">${nombre}</div>
                    <div class="text-muted small">${v.puesto || ''}${v.periodo_trabajo ? ' · ' + v.periodo_trabajo : ''}</div>
                </div>
                <div class="d-flex gap-1">${estrellas}</div>
            </div>
            <p class="small mb-2" style="color:var(--dark)">${v.comentario || ''}</p>
            <div class="text-muted small">${fecha}</div>
        </div>`;
    }).join('');

    el.innerHTML = `
        <div class="row g-4">
            <div class="col-12 col-lg-4">
                <div class="bg-white border rounded-3 p-4">
                    <h6 class="fw-bold mb-3">Distribución de valoraciones</h6>
                    ${barras}
                    <div class="text-center mt-3 pt-2" style="border-top:1px solid #e8eef4">
                        <div class="fw-bold" style="font-size:2rem;font-family:'Poppins',sans-serif;color:var(--dark)">${promedio}</div>
                        <div class="d-flex justify-content-center gap-1 my-1">${renderEstrellas(Number(promedio))}</div>
                        <div class="text-muted small">Basado en ${total} valoracion${total !== 1 ? 'es' : ''}</div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-lg-8">
                <div class="d-flex flex-column gap-3">${cards}</div>
            </div>
        </div>`;
}

function registrarTabs() {
    document.querySelectorAll('.empresa-tab').forEach(btn => {
        btn.addEventListener('click', () => cambiarTab(btn.dataset.tab));
    });
}

function cambiarTab(tab) {
    document.querySelectorAll('.empresa-tab').forEach(btn => {
        const isActive = btn.dataset.tab === tab;
        btn.style.borderBottom = isActive ? '2px solid var(--blue)' : '2px solid transparent';
        btn.style.color        = isActive ? 'var(--blue)'           : 'var(--dark)';
        btn.style.fontWeight   = isActive ? '600'                   : '400';
    });
    document.querySelectorAll('.empresa-pane').forEach(pane => {
        pane.style.display = pane.id === `pane-${tab}` ? 'block' : 'none';
    });
}

function obtenerIniciales(nombre = '') {
    return nombre.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
}

function renderEstrellas(calificacion) {
    return [1, 2, 3, 4, 5].map(i => {
        const icon = i <= Math.round(calificacion) ? 'bi-star-fill' : 'bi-star';
        return `<i class="bi ${icon}" style="color:#FDC700;font-size:.85rem"></i>`;
    }).join('');
}

function formatSalario(min, max) {
    if (!min && !max) return null;
    const fmt = n => Number(n).toLocaleString('es-ES') + '€';
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `Desde ${fmt(min)}`;
    return `Hasta ${fmt(max)}`;
}

function mostrarError(msg) {
    document.getElementById('empresa-header').innerHTML = `
        <div class="container py-4 text-white">
            <p><i class="bi bi-exclamation-circle me-2"></i>${msg}</p>
            <a href="/panel-admin" class="text-white small">← Volver al panel</a>
        </div>`;
}