import { getEstadisticas } from '../api/empresaApi.js';


function renderEstrellas(calificacion) {
    const llenas = Math.round(calificacion);
    let html = '';
    for (let i = 0; i < 5; i++) {
        html += i < llenas
            ? '<i class="bi bi-star-fill"></i>'
            : '<i class="bi bi-star"></i>';
    }
    return html;
}

function renderValoraciones(valoraciones) {
    const contenedor = document.getElementById('contenedor-valoraciones');
    if (!contenedor) return;

    const header = `<div class="info-card-header mb-3"><h5>Valoraciones recientes</h5></div>`;

    if (!valoraciones || valoraciones.length === 0) {
        contenedor.innerHTML = header + `
            <div class="text-center py-4">
                <i class="bi bi-star" style="font-size:2rem; color:#b0c8dc;"></i>
                <p class="mt-3 text-muted" style="font-size:0.9rem;">No hay valoraciones aún</p>
            </div>`;
        return;
    }

    const items = valoraciones.map(v => {
        const nombre = v.candidato
            ? `${v.candidato.nombre_candidato} ${v.candidato.apellido_candidato}`
            : 'Candidato';
        return `
        <div class="est-review">
            <div class="est-review-header">
                <span class="est-review-user">${nombre}</span>
                <span class="est-stars">${renderEstrellas(v.calificacion)}</span>
            </div>
            <p class="est-review-text">${v.comentario || ''}</p>
        </div>`;
    }).join('');

    contenedor.innerHTML = header + items;
}

export async function cargarEstadisticas() {
    try {
        const { estadisticas } = await getEstadisticas();
        if (!estadisticas) return;

        document.getElementById('stat-empleos-activos').textContent = estadisticas.empleosActivos;
        document.getElementById('stat-total-aplicaciones').textContent = estadisticas.totalAplicaciones;
        document.getElementById('stat-visitas').textContent = estadisticas.visitasPerfil.toLocaleString();
        document.getElementById('stat-valoracion').textContent = estadisticas.valoracionPromedio;
        document.getElementById('stat-total-valoraciones').textContent = `${estadisticas.totalValoraciones} opiniones`;

        window._chartData = estadisticas.grafico;

        renderValoraciones(estadisticas.valoracionesRecientes);

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}