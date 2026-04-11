import { getCandidatos, actualizarEstadoAplicacion } from '../api/empresaApi.js';

function formatearFecha(fecha) {
    if (!fecha) return '';
    const d = new Date(fecha);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function getClaseEstado(estado) {
    const mapa = {
        'Nuevo': 'nuevo',
        'Revisando': 'revisando',
        'Entrevista': 'entrevista',
        'Aceptado': 'entrevista',
        'Rechazado': 'rechazado'
    };
    return mapa[estado] || 'nuevo';
}

function mostrarListaCandidatos(candidatos) {
    const contenedor = document.getElementById('lista-candidatos');
    if (!contenedor) return;

    if (!candidatos || candidatos.length === 0) {
        contenedor.innerHTML = `
            <div class="info-card text-center py-5">
                <i class="bi bi-people" style="font-size:2rem; color:#b0c8dc;"></i>
                <p class="mt-3 text-muted" style="font-size:0.9rem;">No hay candidatos aún</p>
            </div>`;
        return;
    }

    contenedor.innerHTML = candidatos.map(apl => {
        const c = apl.candidato;
        const evaluacion = apl.evaluacion_aplicacion?.[0] || {};
        const estado = evaluacion.estado_aplicacion || 'Nuevo';
        const titulo = apl.empleos?.titulo_empleo || '';
        const nombreCompleto = `${c.nombre_candidato} ${c.apellido_candidato}`;
        const tituloProfesional = c.candidato_x_titulo?.[0]?.titulo?.nombre_titulo || '';
        const badgeClass = getClaseEstado(estado);

        return `
        <div class="info-card pec-card">
            <div class="pec-row">
                <div class="d-flex align-items-start gap-3">
                    <div class="pec-avatar"><i class="bi bi-people"></i></div>
                    <div class="pec-info">
                        <span class="pec-nombre">${nombreCompleto}</span>
                        <span class="pec-puesto">${tituloProfesional}</span>
                        <div class="pec-meta"><span>Aplicó para: <strong>${titulo}</strong></span></div>
                        <div class="pec-meta"><span>Fecha: ${formatearFecha(apl.fecha_aplicacion)}</span></div>
                    </div>
                </div>
                <div class="pec-actions">
                    <span class="pec-badge ${badgeClass}">${estado}</span>
                    <button class="pec-btn-ver"
                        onclick="abrirModalCandidatoData(${JSON.stringify(apl).replace(/"/g, '&quot;')})">
                        Ver perfil
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

export async function cargarCandidatos() {
    try {
        const { candidatos } = await getCandidatos();
        mostrarListaCandidatos(candidatos);
    } catch (error) {
        console.error('Error cargando candidatos:', error);
    }
}

window.abrirModalCandidatoData = function(apl) {
    const c = apl.candidato;
    const evaluacion = apl.evaluacion_aplicacion?.[0] || {};
    const estado = evaluacion.estado_aplicacion || 'Nuevo';
    const nombreCompleto = `${c.nombre_candidato} ${c.apellido_candidato}`;
    const tituloProfesional = c.candidato_x_titulo?.[0]?.titulo?.nombre_titulo || 'Sin título';

    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

    setTxt('modal-cand-nombre', nombreCompleto);
    setTxt('modal-cand-titulo', tituloProfesional);
    setTxt('modal-cand-puesto', apl.empleos?.titulo_empleo || '');
    setTxt('modal-cand-ubicacion', c.ubicacion_candidato || '');
    setTxt('modal-cand-telefono', c.telefono_candidato || '');
    setTxt('modal-cand-descripcion', c.descripcion_candidato || '');
    setTxt('modal-cand-cv', c.curriculum || 'Sin CV');
    setVal('modal-cand-notas', evaluacion.notas_internas || '');

    document.querySelectorAll('.pec-btn-estado').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.estado === estado);
    });

    const modal = document.getElementById('modalVerCandidato');
    if (modal) modal.dataset.idAplicacion = apl.id_aplicacion;

    abrirModalCandidato();
};

window.cambiarEstado = function(btn) {
    document.querySelectorAll('.pec-btn-estado').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

window.guardarEstadoCandidato = async function() {
    const modal = document.getElementById('modalVerCandidato');
    const id_aplicacion = modal?.dataset.idAplicacion;
    if (!id_aplicacion) return;

    const estadoBtn = document.querySelector('.pec-btn-estado.active');
    const estado_aplicacion = estadoBtn?.dataset.estado || 'Nuevo';
    const notas_internas = document.getElementById('modal-cand-notas')?.value || '';

    try {
        await actualizarEstadoAplicacion(id_aplicacion, { estado_aplicacion, notas_internas });
        cerrarModalCandidato();
        await cargarCandidatos();
    } catch (error) {
        console.error('Error actualizando estado:', error);
    }
};