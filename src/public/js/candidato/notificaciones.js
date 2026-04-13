import { getNotificaciones, marcarNotificacionesLeidas } from '../api/candidatoApi.js';

function tiempoNotif(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const diff = ahora - fecha;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora mismo';
    if (mins < 60) return `Hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs} h`;
    const dias = Math.floor(hrs / 24);
    return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
}

async function cargarNotificaciones() {
    try {
        const { notificaciones } = await getNotificaciones();
        const lista = document.getElementById('lista-notificaciones');
        const badge = document.getElementById('notif-badge');
        if (!lista) return;

        const noLeidas = (notificaciones || []).filter(n => !n.leida).length;
        if (badge) {
            badge.textContent = noLeidas > 9 ? '9+' : noLeidas;
            badge.style.display = noLeidas > 0 ? 'flex' : 'none';
        }

        if (!notificaciones || notificaciones.length === 0) {
            lista.innerHTML = `
                <div class="text-center text-muted py-5" style="padding:24px;">
                    <i class="bi bi-bell-slash fs-2 d-block mb-2" style="color:#b0c8dc;"></i>
                    <p style="font-size:.85rem;">No tienes notificaciones</p>
                </div>`;
            return;
        }

        const iconosTipo = {
            'aplicacion': 'bi-briefcase',
            'alerta':     'bi-bell',
            'mensaje':    'bi-chat',
            'sistema':    'bi-info-circle'
        };

        lista.innerHTML = notificaciones.map(n => {
            const icono = iconosTipo[n.tipo] || 'bi-bell';
            const tiempo = tiempoNotif(n.fecha_notificacion);
            return `
            <div class="notif-item"
                 data-id="${n.id_notificacion}"
                 data-empleo-id="${n.id_empleo || ''}"
                 data-leida="${n.leida}"
                 style="padding:14px 20px;border-bottom:1px solid #f0f4f8;display:flex;gap:12px;align-items:flex-start;
                        background:${n.leida ? '#fff' : '#f0f7ff'};cursor:pointer;">
                <div style="width:36px;height:36px;border-radius:50%;background:${n.leida ? '#eef2f7' : '#dbeafe'};
                             display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="bi ${icono}" style="color:var(--blue);font-size:.9rem;"></i>
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:.88rem;font-weight:${n.leida ? '400' : '600'};color:var(--dark);">
                        ${n.titulo}
                    </div>
                    <div style="font-size:.8rem;color:#9aabba;margin-top:2px;">${n.descripcion || ''}</div>
                    <div style="font-size:.75rem;color:#b0bec8;margin-top:4px;">${tiempo}</div>
                </div>
                ${!n.leida
                    ? '<div style="width:10px;height:10px;border-radius:50%;background:var(--blue);flex-shrink:0;margin-top:4px;"></div>'
                    : '<div style="width:10px;"></div>'}
            </div>`;
        }).join('');

        lista.querySelectorAll('.notif-item').forEach(el => {
            el.addEventListener('click', async (e) => {
                e.stopPropagation();

                if (el.dataset.leida === 'false') {
                    el.style.background = '#fff';
                    el.dataset.leida = 'true';
                    const dot = el.querySelector('div[style*="border-radius:50%"]:last-child');
                    if (dot) dot.style.background = 'transparent';
                    await marcarNotificacionesLeidas();
                    await cargarNotificaciones();
                }

                const empleo = el.dataset.empleoId;
                if (empleo && empleo !== '' && empleo !== 'null') {
                    const panel = document.getElementById('panel-notificaciones');
                    if (panel) panel.style.display = 'none';
                    setTimeout(() => {
                        window.location.href = `/detalle-empleo-candidato?id=${empleo}`;
                    }, 50);
                }
            });
        });

    } catch (err) {
        console.error('Error cargando notificaciones:', err);
    }
}

export function iniciarNotificaciones() {
    fetch('/modal-notificaciones')
        .then(r => r.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);

            document.getElementById('btn-notificaciones')?.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const panel = document.getElementById('panel-notificaciones');
                if (!panel) return;
                const visible = panel.style.display !== 'none';
                panel.style.display = visible ? 'none' : 'block';
                if (!visible) cargarNotificaciones();
            });

            document.addEventListener('click', (e) => {
                const panel = document.getElementById('panel-notificaciones');
                const btn = document.getElementById('btn-notificaciones');
                if (panel && panel.style.display !== 'none' &&
                    !panel.contains(e.target) && !btn?.contains(e.target)) {
                    panel.style.display = 'none';
                }
            });

            document.getElementById('btn-marcar-leidas')?.addEventListener('click', async (e) => {
                e.preventDefault();
                await marcarNotificacionesLeidas();
                await cargarNotificaciones();
            });

            cargarNotificaciones();
        });
}