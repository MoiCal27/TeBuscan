import { getForos, getEstadisticasForo, crearForo, crearRespuesta, incrementarVistas  } from '../api/empresaApi.js';
import { mostrarError, limpiarTodos } from '../ui/validaciones.js';

const CATEGORIAS = {
    'Entrevistas': 'entrevistas',
    'Curriculum':  'carrera',
    'Carrera':     'carrera',
    'Videos':      'carrera',
    'Empresas':    'empresas',
    'Salarios':    'salarios',
    'Networking':  'empresas',
    'Consejos':    'carrera'
};

const mapaCategorias = {};

function formatearFecha(fecha) {
    if (!fecha) return '';
    const d = new Date(fecha);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function nombreUsuario(usuario) {
    if (!usuario) return 'Usuario';
    return usuario.correo_usuario.split('@')[0];
}

function mostrarRespuestas(respuestas, id_foro) {
    const items = (respuestas || []).map(r => `
        <div class="foro-respuesta">
            <div class="foro-avatar foro-avatar-sm"><i class="bi bi-person"></i></div>
            <div>
                <div class="foro-resp-meta">
                    <strong>${nombreUsuario(r.usuario)}</strong>
                    <span>• ${formatearFecha(r.fecha_respuesta)}</span>
                </div>
                <p class="foro-resp-text">${r.contenido || ''}</p>
            </div>
        </div>
    `).join('');

    return `
        <div class="foro-respuestas-panel" style="display:none;">
            <div class="foro-respuestas mt-3">${items}</div>
            <textarea class="field-input mt-2" onclick="event.stopPropagation()"
                placeholder="Escribe tu respuesta..."
                id="resp-${id_foro}"></textarea>
            <span class="field-error" id="error-resp-${id_foro}"></span>
            <button class="btn-coral mt-2"
                onclick="event.stopPropagation(); enviarRespuesta(${id_foro})">
                Responder
            </button>
        </div>`;
}

function mostrarPublicaciones(foros) {
    const contenedor = document.getElementById('lista-foros');
    if (!contenedor) return;

    if (!foros || foros.length === 0) {
        contenedor.innerHTML = `
            <div class="foro-post-card text-center py-5">
                <i class="bi bi-chat-square" style="font-size:2rem;color:#b0c8dc;"></i>
                <p class="mt-3 text-muted" style="font-size:0.9rem;">No hay publicaciones aún</p>
            </div>`;
        return;
    }

    contenedor.innerHTML = foros.map(f => {
        const catNombre = f.categoria?.nombre_categoria || '';
        const badgeClass = CATEGORIAS[catNombre] || 'carrera';
        const respuestas = f.foro_respuesta || [];

        return `
        <div class="foro-post-card" onclick="mostrarPanelRespuestas(this)">
            <div class="d-flex gap-3">
                <div class="foro-avatar"><i class="bi bi-person"></i></div>
                <div class="flex-grow-1">
                    <div class="foro-post-title">${f.titulo_foro}</div>
                    <div class="foro-post-meta">
                        <span>${nombreUsuario(f.usuario)}</span>
                        <span class="foro-dot">•</span>
                        <span>${formatearFecha(f.fecha_foro)}</span>
                        <span class="foro-badge-cat ${badgeClass}">${catNombre}</span>
                    </div>
                    <p class="foro-post-preview">${f.descripcion_foro || ''}</p>
                    <div class="foro-post-footer">
                        <span><i class="bi bi-chat me-1"></i>${respuestas.length} respuestas</span>
                        <span><i class="bi bi-eye me-1"></i>${f.visualizaciones_foro || 0} vistas</span>
                    </div>
                    ${mostrarRespuestas(respuestas, f.id_foro)}
                </div>
            </div>
        </div>`;
    }).join('');
}

async function cargarForos(id_categoria = null) {
    try {
        const { foros } = await getForos(id_categoria);
        mostrarPublicaciones(foros);
        mostrarTemasPopulares(foros);
    } catch (error) {
        console.error('Error cargando foros:', error);
    }
}

async function cargarEstadisticas() {
    try {
        const { estadisticas } = await getEstadisticasForo();
        if (!estadisticas) return;
        document.getElementById('stat-foro-publicaciones').textContent =
            estadisticas.totalPublicaciones.toLocaleString();
        document.getElementById('stat-foro-miembros').textContent =
            estadisticas.miembrosActivos.toLocaleString();
        document.getElementById('stat-foro-hoy').textContent =
            estadisticas.hoy;
    } catch (error) {
        console.error('Error cargando estadísticas del foro:', error);
    }
}

function mostrarTemasPopulares(foros) {
    const contenedor = document.getElementById('temas-populares');
    if (!contenedor || !foros) return;

    const conteo = {};
    foros.forEach(f => {
        const cat = f.categoria?.nombre_categoria;
        if (cat) conteo[cat] = (conteo[cat] || 0) + 1;
    });

    const top = Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    contenedor.innerHTML = top.map(([cat]) =>
        `<span class="foro-tag">#${cat.toLowerCase().replace(/\s/g, '')}</span>`
    ).join('');
}

window.mostrarPanelRespuestas = function(card) {
    const panel = card.querySelector('.foro-respuestas-panel');
    if (!panel) return;
    const visible = panel.style.display !== 'none';
    document.querySelectorAll('.foro-respuestas-panel').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.foro-post-card').forEach(c => c.classList.remove('foro-post-card-open'));
    if (!visible) {
        panel.style.display = 'block';
        card.classList.add('foro-post-card-open');

        const textarea = card.querySelector('textarea[id^="resp-"]');
        const id_foro = textarea?.id.replace('resp-', '');
        if (!id_foro) return;

        incrementarVistas(id_foro).then(resultado => {
            if (resultado?.message === 'Vistas actualizadas') {
                const vistaSpan = card.querySelector('.foro-post-footer span:last-child');
                if (vistaSpan) {
                    const match = vistaSpan.textContent.match(/\d+/);
                    const actual = match ? parseInt(match[0]) : 0;
                    vistaSpan.innerHTML = `<i class="bi bi-eye me-1"></i>${actual + 1} vistas`;
                }
            }
        });
    }
};

window.enviarRespuesta = async function(id_foro) {
    const campoId = `resp-${id_foro}`;
    limpiarTodos([campoId]);
    let valido = true;

    const contenido = document.getElementById(campoId)?.value.trim();

    if (!contenido) {
        mostrarError(campoId, 'La respuesta no puede estar vacía');
        valido = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:¿?¡!()\-'"]+$/.test(contenido)) {
        mostrarError(campoId, 'No se permiten caracteres especiales');
        valido = false;
    }

    if (!valido) return;

    try {
        await crearRespuesta(id_foro, contenido);
        document.getElementById(campoId).value = '';
        await cargarForos();

        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed; bottom:24px; right:24px; z-index:9999;
            background:#fff; border-left:4px solid var(--blue);
            border-radius:8px; padding:14px 18px; box-shadow:0 4px 20px rgba(0,0,0,.12);
            font-size:.88rem; color:var(--dark); max-width:320px;
            display:flex; align-items:center; gap:10px;`;
        toast.innerHTML = `
            <i class="bi bi-clock" style="color:var(--blue);font-size:1.1rem;"></i>
            <div>
                <div class="fw-semibold">Respuesta enviada</div>
                <div style="opacity:.7">Tu respuesta está pendiente de aprobación por el administrador.</div>
            </div>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity .3s';
            setTimeout(() => toast.remove(), 300);
        }, 4000);

    } catch (error) {
        console.error('Error enviando respuesta:', error);
    }
};

window.mostrarFormularioPublicacion = function() {
    const panel = document.getElementById('panelNuevaPub');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
};

window.publicarForo = async function() {
    const campos = ['foro-titulo', 'foro-descripcion', 'foro-categoria'];
    limpiarTodos(campos);
    let valido = true;

    const titulo      = document.getElementById('foro-titulo')?.value.trim();
    const descripcion = document.getElementById('foro-descripcion')?.value.trim();
    const catNombre   = document.getElementById('foro-categoria')?.value;

    if (!titulo) {
        mostrarError('foro-titulo', 'El título es obligatorio');
        valido = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:¿?¡!()\-'"]+$/.test(titulo)) {
        mostrarError('foro-titulo', 'No se permiten caracteres especiales');
        valido = false;
    }

    if (!descripcion) {
        mostrarError('foro-descripcion', 'La descripción es obligatoria');
        valido = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:¿?¡!()\-'"]+$/.test(descripcion)) {
        mostrarError('foro-descripcion', 'No se permiten caracteres especiales');
        valido = false;
    }

    if (!catNombre) {
        mostrarError('foro-categoria', 'Selecciona una categoría');
        valido = false;
    }

    if (!valido) return;

    const id_categoria = mapaCategorias[catNombre] || null;

    try {
        await crearForo({ titulo_foro: titulo, descripcion_foro: descripcion, id_categoria });
        document.getElementById('foro-titulo').value      = '';
        document.getElementById('foro-descripcion').value = '';
        document.getElementById('foro-categoria').value   = '';
        mostrarFormularioPublicacion();
        await cargarForos();
        await cargarEstadisticas();

        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed; bottom:24px; right:24px; z-index:9999;
            background:#fff; border-left:4px solid var(--blue);
            border-radius:8px; padding:14px 18px; box-shadow:0 4px 20px rgba(0,0,0,.12);
            font-size:.88rem; color:var(--dark); max-width:320px;
            display:flex; align-items:center; gap:10px;`;
        toast.innerHTML = `
            <i class="bi bi-clock" style="color:var(--blue);font-size:1.1rem;"></i>
            <div>
                <div class="fw-semibold">Publicación enviada</div>
                <div style="opacity:.7">Tu publicación está pendiente de aprobación por el administrador.</div>
            </div>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity .3s';
            setTimeout(() => toast.remove(), 300);
        }, 4000);

    } catch (error) {
        console.error('Error publicando foro:', error);
    }
};

window.seleccionarCategoria = function(btn) {
    document.querySelectorAll('.foro-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.textContent.trim();
    const id_cat = cat === 'Todos' ? null : mapaCategorias[cat] || null;
    cargarForos(id_cat);
};

window.seleccionarOrden = function(btn) {
    document.querySelectorAll('.foro-ordenar-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const orden = btn.textContent.trim().toLowerCase();

    const cards = [...document.querySelectorAll('#lista-foros .foro-post-card')];
    const contenedor = document.getElementById('lista-foros');

    cards.sort((a, b) => {
        if (orden.includes('popular')) {
            const vistasA = parseInt(a.querySelector('.foro-post-footer span:last-child')?.textContent.match(/\d+/)?.[0] || 0);
            const vistasB = parseInt(b.querySelector('.foro-post-footer span:last-child')?.textContent.match(/\d+/)?.[0] || 0);
            return vistasB - vistasA;
        } else {
            const parsearFecha = (texto) => {
                const [dia, mes, anio] = texto.split('/').map(Number);
                return new Date(anio, mes - 1, dia);
            };
            const fechaA = a.querySelector('.foro-post-meta span:nth-child(3)')?.textContent.trim() || '';
            const fechaB = b.querySelector('.foro-post-meta span:nth-child(3)')?.textContent.trim() || '';
            return parsearFecha(fechaB) - parsearFecha(fechaA);
        }
    });

    cards.forEach(card => contenedor.appendChild(card));
};

document.querySelector('.foro-search-input').addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.foro-post-card').forEach(card => {
        const titulo = card.querySelector('.foro-post-title')?.textContent.toLowerCase() || '';
        const preview = card.querySelector('.foro-post-preview')?.textContent.toLowerCase() || '';
        card.style.display = (titulo.includes(texto) || preview.includes(texto)) ? 'block' : 'none';
    });
});

document.querySelectorAll('.foro-cat-btn').forEach(btn => {
    const nombre = btn.textContent.trim();
    const mapaIds = {
        'Entrevistas': 1,
        'Curriculum': 2,
        'Carrera': 3,
        'Videos': 4,
        'Empresas': 5,
        'Salarios': 6,
        'Networking': 7,
        'Consejos': 8
    };
    if (mapaIds[nombre]) mapaCategorias[nombre] = mapaIds[nombre];
});

cargarForos();
cargarEstadisticas();