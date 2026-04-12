import { switchProfileTab } from '../ui/uiHelpers.js';
import { mostrarError, limpiarTodos } from '../ui/validaciones.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getSesion, actualizarCandidato, getAplicaciones, getEstadisticas, subirCV } from '../api/candidatoApi.js';

const config = await fetch('/api/config').then(r => r.json());
const supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
let { usuario, candidato } = await getSesion();

if (!candidato) {
    window.location.href = '/login';
}
document.getElementById('input-telefono').addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4) + '-' + val.slice(4, 8);
    e.target.value = val;
});
const nombreCompleto = `${candidato.nombre_candidato} ${candidato.apellido_candidato}`;
document.getElementById('input-nombre').value = nombreCompleto;
document.getElementById('input-correo').value = usuario.correo_usuario;
document.getElementById('input-telefono').value = candidato.telefono_candidato || '';
document.getElementById('input-ubicacion').value = candidato.ubicacion_candidato || '';
document.getElementById('input-descripcion').value = candidato.descripcion_candidato || '';

if (candidato.curriculum) {
    document.getElementById('cv-preview').style.display = 'flex';
    const nombreCV = candidato.curriculum.split('/').pop();
    document.getElementById('cv-nombre').textContent = nombreCV;
    document.getElementById('cv-fecha').textContent = 'CV subido';
    document.getElementById('cv-link').href = candidato.curriculum; 
}

const { estadisticas } = await getEstadisticas();
document.getElementById('stat-visitas').textContent = estadisticas.visitasPerfil;
document.getElementById('stat-aplicaciones').textContent = estadisticas.aplicacionesMes;
document.getElementById('stat-entrevistas').textContent = estadisticas.entrevistas;

document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', function () {
        const tabName = this.textContent.trim().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        switchProfileTab(tabName, this);
        if (tabName === 'aplicaciones') cargarAplicaciones();
    });
});

document.getElementById('btnGuardarCandidato').addEventListener('click', async () => {
    limpiarTodos(['input-nombre', 'input-telefono', 'input-ubicacion']);
    let valido = true;

    const nombre = document.getElementById('input-nombre').value.trim();
    const telefono = document.getElementById('input-telefono').value.trim();
    const ubicacion = document.getElementById('input-ubicacion').value.trim();

    if (!nombre) {
        mostrarError('input-nombre', 'El nombre es obligatorio'); valido = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
        mostrarError('input-nombre', 'Solo se permiten letras'); valido = false;
    }

    if (!telefono) {
        mostrarError('input-telefono', 'El teléfono es obligatorio'); valido = false;
    } else if (!/^[0-9]{4}-[0-9]{4}$/.test(telefono)) {
        mostrarError('input-telefono', 'Formato: 0000-0000'); valido = false;
    }

    if (!ubicacion) {
        mostrarError('input-ubicacion', 'La ubicación es obligatoria'); valido = false;
    }

    if (!valido) return;

    const partes = nombre.split(' ');
    const nombre_candidato = partes[0] || '';
    const apellido_candidato = partes.slice(1).join(' ') || '';

    const datos = {
        nombre_candidato,
        apellido_candidato,
        telefono_candidato: telefono,
        ubicacion_candidato: ubicacion,
        descripcion_candidato: document.getElementById('input-descripcion').value.trim()
    };

    const respuesta = await actualizarCandidato(datos);
    if (respuesta.error) {
        mostrarError('input-nombre', respuesta.error);
        return;
    }
    mostrarToast('Perfil actualizado exitosamente!');
});


async function cargarAplicaciones() {
    const { aplicaciones } = await getAplicaciones();
    const lista = document.getElementById('lista-aplicaciones');

    if (!aplicaciones || aplicaciones.length === 0) {
        lista.innerHTML = '<p class="text-muted small">No tienes aplicaciones aún.</p>';
        return;
    }

    lista.innerHTML = aplicaciones.map(a => {
        const estado = a.evaluacion_aplicacion?.[0]?.estado_aplicacion || 'pendiente';
        const badgeClase = {
                'Entrevista': 'entrevista',
                'Revisando': 'revisando',
                'Rechazado': 'rechazado',
                'Nuevo': 'nuevo',
                'Aceptado': 'entrevista'
            }[estado] || 'nuevo';

        const fecha = new Date(a.fecha_aplicacion).toLocaleDateString('es-ES');

        return `
        <div class="info-card pec-card">
            <div class="pec-row">
                <div class="d-flex align-items-start gap-3">
                    <div class="pec-avatar"><i class="bi bi-briefcase"></i></div>
                    <div class="pec-info">
                        <span class="pec-nombre">${a.empleos?.titulo_empleo || 'Empleo'}</span>
                        <span class="pec-puesto">${a.empleos?.empresa?.nombre_empresa || ''}</span>
                        <div class="pec-meta"><i class="bi bi-geo-alt me-1"></i>${a.empleos?.ubicacion_empleo || ''}</div>
                        <div class="pec-meta"><span>Fecha: ${fecha}</span></div>
                    </div>
                </div>
                <div class="pec-actions">
                    <span class="pec-badge ${badgeClase}">${estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
                </div>
            </div>
        </div>`;
    }).join('');
}
document.getElementById('cv-link').addEventListener('click', (e) => {
    e.preventDefault();
    if (candidato.curriculum) {
        window.open(candidato.curriculum, '_blank');
    }
});
document.getElementById('cv-file').addEventListener('change', async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (archivo.size > 5 * 1024 * 1024) {
        alert('El archivo no puede superar 5MB'); return;
    }

    const tiposPermitidos = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!tiposPermitidos.includes(archivo.type)) {
        alert('Solo se permiten archivos PDF, DOC o DOCX'); return;
    }

    try {
        const extension = archivo.name.split('.').pop();
        const nombreArchivo = `cv_${candidato.id_candidato}.${extension}`; // nombre fijo → reemplaza siempre

        const { error } = await supabaseClient
            .storage
            .from('curriculums')
            .upload(nombreArchivo, archivo, { upsert: true });

        if (error) throw new Error(error.message);

        const { data: urlData } = supabaseClient
            .storage
            .from('curriculums')
            .getPublicUrl(nombreArchivo);

        await subirCV(urlData.publicUrl);
        candidato.curriculum = urlData.publicUrl;
        document.getElementById('cv-preview').style.display = 'flex';
        document.getElementById('cv-nombre').textContent = archivo.name;
        document.getElementById('cv-link').href = urlData.publicUrl;
        document.getElementById('cv-fecha').textContent = `Subido el ${new Date().toLocaleDateString('es-ES')}`;
        mostrarToast('CV subido exitosamente!');
    } catch (err) {
        mostrarToast('Error al subir CV: ' + err.message, 'error');
    }
});

window.eliminarCV = () => {
    mostrarConfirm('¿Estás seguro que deseas eliminar tu CV? Esta acción no se puede deshacer.', async () => {
        await actualizarCandidato({
            ...candidato,
            curriculum: null
        });
        candidato.curriculum = null;
        document.getElementById('cv-preview').style.display = 'none';
        document.getElementById('cv-file').value = '';
        document.getElementById('cv-link').href = '#';
        document.getElementById('cv-nombre').textContent = '';
        document.getElementById('cv-fecha').textContent = '';
        mostrarToast('CV eliminado correctamente');
    });
};

function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toast-icon');
    const msg = document.getElementById('toast-msg');

    msg.textContent = mensaje;

    if (tipo === 'success') {
        icon.className = 'bi bi-check-circle-fill me-2';
        icon.style.color = 'var(--blue)';
        toast.style.borderLeftColor = 'var(--blue)';
    } else if (tipo === 'error') {
        icon.className = 'bi bi-x-circle-fill me-2';
        icon.style.color = 'var(--coral)';
        toast.style.borderLeftColor = 'var(--coral)';
    }

    toast.style.display = 'flex';
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.style.display = 'none', 300);
    }, 3000);
}

function mostrarConfirm(mensaje, onAceptar) {
    const modal = document.getElementById('modal-confirm');
    modal.querySelector('p').textContent = mensaje;
    modal.style.display = 'flex';

    document.getElementById('btn-aceptar-confirm').onclick = () => {
        modal.style.display = 'none';
        onAceptar();
    };
    document.getElementById('btn-cancelar-confirm').onclick = () => {
        modal.style.display = 'none';
    };
}