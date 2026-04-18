import { getTodosLosMensajes, marcarMensajeLeido, eliminarMensaje } from '../api/generalApi.js';

let mensajesTotales = [];
let filtroActual    = 'todos';
let busqueda        = '';

document.addEventListener('DOMContentLoaded', () => {
    cargarMensajes();
    registrarEventos();
});

function registrarEventos() {
    document.querySelectorAll('.filtro-estado').forEach(btn => {
        btn.addEventListener('click', () => {
            filtroActual = btn.dataset.valor;
            activarFiltroBtnEstado(filtroActual);
            renderLista();
        });
    });

    let debounce;
    document.getElementById('input-buscar-mensaje')
        ?.addEventListener('input', e => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                busqueda = e.target.value.trim().toLowerCase();
                renderLista();
            }, 300);
        });
}

function activarFiltroBtnEstado(valor) {
    document.querySelectorAll('.filtro-estado').forEach(btn => {
        const activo = btn.dataset.valor === valor;
        btn.style.background = activo ? '#eef5fb' : 'transparent';
        btn.style.color      = activo ? 'var(--blue)' : '';
        btn.style.fontWeight = activo ? '600' : '400';
        btn.style.border     = activo ? 'none' : '1.5px solid #dde5ed';
    });
}

async function cargarMensajes() {
    try {
        const { mensajes } = await getTodosLosMensajes();
        mensajesTotales = mensajes || [];
        actualizarStats();
        renderLista();
    } catch (err) {
        console.error('Error cargando mensajes:', err);
        mostrarError();
    }
}

function actualizarStats() {
    const total    = mensajesTotales.length;
    const noLeidos = mensajesTotales.filter(m => !m.leido_contacto).length;

    document.getElementById('stat-total').textContent     = total;
    document.getElementById('stat-no-leidos').textContent = noLeidos;

    const badge = document.getElementById('badge-no-leidos');
    if (noLeidos > 0) {
        badge.textContent   = noLeidos;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function filtrarMensajes() {
    return mensajesTotales.filter(m => {
        if (filtroActual === 'leidos'    &&  m.leido_contacto) return true;
        if (filtroActual === 'no-leidos' && !m.leido_contacto) return true;
        if (filtroActual === 'todos') return true;
        return false;
    }).filter(m => {
        if (!busqueda) return true;
        return (
            m.nombre_contacto?.toLowerCase().includes(busqueda)  ||
            m.correo_contacto?.toLowerCase().includes(busqueda)  ||
            m.asunto_contacto?.toLowerCase().includes(busqueda)  ||
            m.mensaje_contacto?.toLowerCase().includes(busqueda)
        );
    });
}

function renderLista() {
    const lista    = document.getElementById('lista-mensajes');
    const contador = document.getElementById('contador-mensajes');
    const visibles = filtrarMensajes();

    contador.textContent = `${visibles.length} mensaje${visibles.length !== 1 ? 's' : ''}`;

    if (!visibles.length) {
        lista.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-envelope fs-1 d-block mb-3" style="color:var(--blue);opacity:.4"></i>
                <p class="fw-semibold">No hay mensajes</p>
                <p class="small">No se encontraron mensajes con los filtros actuales.</p>
            </div>`;
        return;
    }

    lista.innerHTML = visibles.map(m => renderCard(m)).join('');
}

function renderCard(m) {
    const fecha = new Date(m.fecha_contacto).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    const noLeido   = !m.leido_contacto;
    const iniciales = m.nombre_contacto
        ?.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('') || '?';

    return `
    <div class="bg-white border rounded-3 p-4 mensaje-card"
         id="msg-${m.id_contacto}"
         style="${noLeido ? 'border-left:4px solid var(--coral) !important' : ''}">
        <div class="d-flex align-items-start gap-3">

            <div class="rounded-3 d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                 style="width:44px;height:44px;background:${noLeido ? 'var(--coral)' : 'var(--blue)'};
                        font-family:'Poppins',sans-serif;font-size:.85rem">
                ${iniciales}
            </div>

            <div class="flex-grow-1 min-w-0">
                <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <div>
                        <span class="fw-semibold" style="color:var(--dark)">${m.nombre_contacto}</span>
                        ${noLeido
                            ? `<span class="badge rounded-pill ms-2"
                                    style="background:var(--coral);color:#fff;font-size:.65rem">
                                   Nuevo
                               </span>`
                            : ''}
                    </div>
                    <span class="text-muted small flex-shrink-0">${fecha}</span>
                </div>

                <!-- Correo visible para que el admin lo copie manualmente -->
                <div class="mb-1">
                    <span class="small" style="color:var(--blue)">
                        <i class="bi bi-envelope me-1"></i>${m.correo_contacto}
                    </span>
                </div>

                <div class="fw-semibold small mb-2" style="color:var(--dark)">
                    <i class="bi bi-chat-left-text me-1 text-muted"></i>${m.asunto_contacto}
                </div>

                <p class="small text-muted mb-3" style="line-height:1.6">
                    ${m.mensaje_contacto}
                </p>

                <div class="d-flex gap-2 flex-wrap align-items-center">
                    ${noLeido
                        ? `<button class="btn btn-sm rounded-2 fw-semibold"
                                   style="background:transparent;border:1.5px solid #dde5ed;color:var(--dark);font-size:.78rem"
                                   onclick="accionMarcarLeido(${m.id_contacto})">
                               <i class="bi bi-check2 me-1"></i>Marcar como leído
                           </button>`
                        : `<span class="small text-muted d-flex align-items-center gap-1">
                               <i class="bi bi-check2-all" style="color:var(--blue)"></i>Leído
                           </span>`}
                    <button class="btn btn-sm rounded-2 fw-semibold ms-auto"
                            style="background:transparent;border:1.5px solid #f8d7da;color:#dc3545;font-size:.78rem"
                            onclick="accionEliminar(${m.id_contacto})">
                        <i class="bi bi-trash me-1"></i>Eliminar
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

window.accionMarcarLeido = async function(id) {
    try {
        await marcarMensajeLeido(id);
        const idx = mensajesTotales.findIndex(m => m.id_contacto === id);
        if (idx !== -1) mensajesTotales[idx].leido_contacto = true;
        actualizarStats();
        renderLista();
    } catch (err) {
        console.error('Error marcando como leído:', err);
    }
};

window.accionEliminar = async function(id) {
    if (!confirm('¿Seguro que quieres eliminar este mensaje? Esta acción no se puede deshacer.')) return;
    try {
        await eliminarMensaje(id);
        mensajesTotales = mensajesTotales.filter(m => m.id_contacto !== id);
        actualizarStats();
        renderLista();
    } catch (err) {
        console.error('Error eliminando mensaje:', err);
    }
};

function mostrarError() {
    document.getElementById('lista-mensajes').innerHTML = `
        <div class="text-center text-muted py-5">
            <i class="bi bi-exclamation-circle fs-1 d-block mb-3" style="color:var(--coral)"></i>
            <p>No se pudieron cargar los mensajes. Por favor, recarga la página.</p>
        </div>`;
}