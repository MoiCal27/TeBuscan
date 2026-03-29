import { getSesion, actualizarEmpresa } from '../api/empresaApi.js';
import { switchProfileTab } from '../ui/uiHelpers.js';
import { cargarEmpleos, guardarNuevoEmpleo, guardarEdicionEmpleo } from './empleosEmpresa.js';
import { mostrarError, limpiarTodos } from '../ui/validaciones.js';
import { cargarCandidatos } from './candidatosEmpresa.js';
import { cargarEstadisticas } from './estadisticasEmpresa.js';

let chartInstance = null;

function initChart() {
    if (chartInstance) return;
    const ctx = document.getElementById('chartAplicaciones');
    if (!ctx) return;
 
    const style     = getComputedStyle(document.documentElement);
    const blue      = style.getPropertyValue('--blue').trim();
    const blueFade  = style.getPropertyValue('--chart-blue-fade').trim();
    const gridLine  = style.getPropertyValue('--chart-grid').trim();
    const tickColor = style.getPropertyValue('--chart-tick').trim();
 
    const grafico = window._chartData || { labels: ['Ene','Feb','Mar','Abr','May','Jun'], data: [0,0,0,0,0,0] };
 
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: grafico.labels,
            datasets: [{
                data: grafico.data,
                borderColor: blue,
                backgroundColor: blueFade,
                borderWidth: 2,
                pointBackgroundColor: '#fff',
                pointBorderColor: blue,
                pointBorderWidth: 2,
                pointRadius: 5,
                tension: 0.4,
                fill: true,
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { color: gridLine, borderDash: [4, 4] },
                    ticks: { color: tickColor, font: { size: 12 } },
                    border: { display: false }
                },
                y: {
                    min: 0,
                    grid: { color: gridLine, borderDash: [4, 4] },
                    ticks: { color: tickColor, font: { size: 12 }, stepSize: 1 },
                    border: { display: false }
                }
            }
        }
    });
}
async function recargarEstadisticas() {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
  
    await cargarEstadisticas();
    setTimeout(initChart, 50);
}

window.initChart = initChart;

window.switchTab = switchProfileTab;
window.irAEmpleos = () => {
    const tab = document.querySelectorAll('.profile-tab')[1];
    switchProfileTab('empleos', tab);
};
window.irAPerfil = () => {
    const tab = document.querySelectorAll('.profile-tab')[0];
    switchProfileTab('perfil', tab);
    window.scrollTo(0, 0);
};
window.guardarNuevoEmpleo = guardarNuevoEmpleo;
window.guardarEdicionEmpleo = guardarEdicionEmpleo;
window.guardarEstadoCandidato = guardarEstadoCandidato;
window.recargarEstadisticas = recargarEstadisticas;

let logoSeleccionado = null;

async function cargarPerfil() {
    try {
        const { empresa, usuario } = await getSesion();
        if (!empresa) { window.location.href = '/login-empresa'; return; }

        document.getElementById('input-nombre_empresa').value = empresa.nombre_empresa || '';
        document.getElementById('input-nombre_contacto').value = empresa.nombre_contacto_empresa || '';
        document.getElementById('input-correo').value = usuario.correo_usuario || '';
        document.getElementById('input-telefono').value = empresa.telefono_empresa || '';
        document.getElementById('input-ubicacion').value = empresa.ubicacion_empresa || '';
        document.getElementById('input-site_web').value = empresa.site_web_empresa || '';
        document.getElementById('input-descripcion').value = empresa.descripcion_empresa || '';
        document.getElementById('input-industria').value = empresa.industria_empresa || '';

        const selectTamano = document.getElementById('input-tamano');
        if (empresa.tamano_empresa) selectTamano.value = empresa.tamano_empresa;

        if (empresa.logo_empresa) {
            const preview = document.getElementById('preview-logo');
            preview.src = empresa.logo_empresa;
            preview.style.display = 'block';
            logoSeleccionado = empresa.logo_empresa;
        }

    } catch (error) {
        window.location.href = '/login-empresa';
    }
}

document.getElementById('btnGuardarCambios').addEventListener('click', async () => {
    limpiarTodos([
        'input-nombre_empresa', 'input-nombre_contacto', 'input-industria',
        'input-telefono', 'input-ubicacion', 'input-site_web', 'input-tamano', 'input-descripcion'
    ]);
    let valido = true;

    const nombre_empresa = document.getElementById('input-nombre_empresa').value.trim();
    const nombre_contacto = document.getElementById('input-nombre_contacto').value.trim();
    const industria = document.getElementById('input-industria').value.trim();
    const telefono = document.getElementById('input-telefono').value.trim();
    const ubicacion = document.getElementById('input-ubicacion').value.trim();
    const site_web = document.getElementById('input-site_web').value.trim();
    const tamano = document.getElementById('input-tamano').value;
    const descripcion = document.getElementById('input-descripcion').value.trim();

    if (!nombre_empresa) { mostrarError('input-nombre_empresa', 'El nombre es obligatorio'); valido = false; }
    if (!nombre_contacto) {
        mostrarError('input-nombre_contacto', 'El contacto es obligatorio'); valido = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre_contacto)) {
        mostrarError('input-nombre_contacto', 'Solo se permiten letras'); valido = false;
    }
    if (!industria) { mostrarError('input-industria', 'La industria es obligatoria'); valido = false; }
    if (!telefono) {
        mostrarError('input-telefono', 'El teléfono es obligatorio'); valido = false;
    } else if (!/^[0-9]{4}-[0-9]{4}$/.test(telefono)) {
        mostrarError('input-telefono', 'Formato inválido, ej: 7777-7777'); valido = false;
    }
    if (!ubicacion) { mostrarError('input-ubicacion', 'La ubicación es obligatoria'); valido = false; }
    if (!site_web) { mostrarError('input-site_web', 'El sitio web es obligatorio'); valido = false; }
    if (!tamano) { mostrarError('input-tamano', 'Selecciona el tamaño de la empresa'); valido = false; }
    if (!descripcion) { mostrarError('input-descripcion', 'La descripción es obligatoria'); valido = false; }

    if (!valido) return;

    try {
        const data = {
            nombre_empresa, nombre_contacto_empresa: nombre_contacto,
            industria_empresa: industria, telefono_empresa: telefono,
            ubicacion_empresa: ubicacion, site_web_empresa: site_web,
            tamano_empresa: tamano, descripcion_empresa: descripcion,
            logo_empresa: logoSeleccionado
        };
        const respuesta = await actualizarEmpresa(data);
        if (respuesta.error) { mostrarError('input-nombre_empresa', respuesta.error); return; }
    } catch (error) {
        alert('Error al guardar cambios');
    }
});
document.getElementById('logo-file').addEventListener('change', (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    logoSeleccionado = `logos/${archivo.name}`;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const preview = document.getElementById('preview-logo');
        preview.src = ev.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(archivo);
});
document.getElementById('input-telefono').addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) {
        val = val.slice(0, 4) + '-' + val.slice(4, 8);
    }
    e.target.value = val;
});


cargarPerfil();
cargarEmpleos();
cargarCandidatos();
cargarEstadisticas();