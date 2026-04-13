const API_ADMIN = '/api/admin';
const API_CANDIDATO = '/api/candidato';

let todosLosUsuarios = [];
let usuarioActual = null;

// ── CARGAR STATS ──────────────────────────────────────────
async function obtenerEstadisticasPanel() {
    try {
        const res = await fetch(`${API_ADMIN}/stats`);
        const { stats } = await res.json();
        if (!stats) return;
        document.getElementById('stat-usuarios').textContent = stats.totalUsuarios ?? '-';
        document.getElementById('stat-empresas').textContent = stats.totalEmpresas ?? '-';
        document.getElementById('stat-empleos').textContent  = stats.totalEmpleos  ?? '-';
        document.getElementById('stat-foros').textContent    = stats.totalForos    ?? '-';
    } catch (err) {
        console.error('Error cargando stats:', err);
    }
}

// ── CARGAR USUARIOS ───────────────────────────────────────
async function cargarUsuarios() {
    try {
        const res = await fetch(`${API_ADMIN}/usuarios`);
        const { usuarios } = await res.json();
        todosLosUsuarios = usuarios || [];
        mostrarUsuariosEnTabla(todosLosUsuarios);
    } catch (err) {
        console.error('Error cargando usuarios:', err);
        document.getElementById('tabla-usuarios').innerHTML =
            '<tr><td colspan="5" class="text-center text-muted py-4">Error al cargar usuarios</td></tr>';
    }
}

function mostrarUsuariosEnTabla(usuarios) {
    const tbody = document.getElementById('tabla-usuarios');

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5">No se encontraron usuarios</td></tr>';
        return;
    }

    tbody.innerHTML = usuarios.map(u => {
        const nombre = u.candidato
            ? `${u.candidato.nombre_candidato} ${u.candidato.apellido_candidato}`
            : u.correo_usuario;

        const fecha = new Date(u.registro_usuario).toLocaleDateString('es-ES');
        const estadoBadge = generarEtiquetaEstado(u.candidato?.estado_candidato || (u.activo ? 'activo' : 'inactivo'));

        return `
        <tr style="border-top:1px solid #f0f4f8;">
            <td class="px-4 py-3">
                <div class="d-flex align-items-center gap-3">
                    <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style="width:36px;height:36px;background:#E5E7EB;">
                        <i class="bi bi-people" style="color:#4A5565;font-size:.9rem;"></i>
                    </div>
                    <span class="fw-semibold" style="font-size:.9rem;color:#526578;">${nombre}</span>
                </div>
            </td>
            <td class="px-4 py-3 text-muted" style="font-size:.88rem;">${u.correo_usuario}</td>
            <td class="px-4 py-3 text-muted" style="font-size:.88rem;">${fecha}</td>
            <td class="px-4 py-3">${estadoBadge}</td>
            <td class="px-4 py-3">
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary btn-sm rounded-2" style="font-size:.8rem;"
                        onclick="verUsuario(${u.id_usuario})">Ver</button>
                    <button class="btn btn-outline-secondary btn-sm rounded-2" style="font-size:.8rem;"
                        onclick="editarUsuario(${u.id_usuario})">Editar</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function generarEtiquetaEstado(estado) {
    const mapa = {
        'activo':   { color: '#6B9BD9', label: 'Activo' },
        'inactivo': { color: '#EF4444', label: 'Inactivo' }
    };
    const s = mapa[estado] || { color: '#9aabba', label: estado };
    return `<span class="badge" style="background:${s.color};color:#fff;font-size:.78rem;padding:5px 12px;">${s.label}</span>`;
}

// ── VER USUARIO ───────────────────────────────────────────
window.verUsuario = function(id_usuario) {
    const u = todosLosUsuarios.find(u => u.id_usuario === id_usuario);
    if (!u) return;
    usuarioActual = u;

    const nombre = u.candidato
        ? `${u.candidato.nombre_candidato} ${u.candidato.apellido_candidato}`
        : u.correo_usuario;

    const estado = u.candidato?.estado_candidato || (u.activo ? 'activo' : 'inactivo');
    const fecha = new Date(u.registro_usuario).toLocaleDateString('es-ES');

    document.getElementById('modal-ver-nombre').textContent = nombre;
    document.getElementById('modal-ver-badge').innerHTML = generarEtiquetaEstado(estado);
    document.getElementById('modal-ver-email').textContent = u.correo_usuario;
    document.getElementById('modal-ver-registro').textContent = `Registrado: ${fecha}`;
    document.getElementById('modal-ver-aplicaciones').textContent = u.candidato?._aplicaciones ?? '-';
    document.getElementById('modal-ver-perfil').textContent = u.candidato?.curriculum ? '85%' : '40%';

    // Marcar el estado actual en los botones
    document.querySelectorAll('#modalVerUsuario .pec-btn-estado').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.estado === estado);
    });

    abrirModalVerUsuario();
};

window.redirigirAEdicion = function() {
    cerrarModalVerUsuario();
    setTimeout(() => {
        if (usuarioActual) editarUsuario(usuarioActual.id_usuario);
    }, 200);
};

// ── EDITAR USUARIO ────────────────────────────────────────
window.editarUsuario = function(id_usuario) {
    const u = todosLosUsuarios.find(u => u.id_usuario === id_usuario);
    if (!u) return;
    usuarioActual = u;

    const nombre = u.candidato
        ? `${u.candidato.nombre_candidato} ${u.candidato.apellido_candidato}`
        : u.correo_usuario;

    const estado = u.candidato?.estado_candidato || (u.activo ? 'activo' : 'inactivo');
    const fecha = new Date(u.registro_usuario).toLocaleDateString('es-ES');

    document.getElementById('modal-edit-nombre').textContent = nombre;
    document.getElementById('modal-edit-badge').innerHTML = generarEtiquetaEstado(estado);
    document.getElementById('modal-edit-email').textContent = u.correo_usuario;
    document.getElementById('modal-edit-registro').textContent = `Registrado: ${fecha}`;
    document.getElementById('modal-edit-aplicaciones').textContent = u.candidato?._aplicaciones ?? '-';
    document.getElementById('modal-edit-perfil').textContent = u.candidato?.curriculum ? '85%' : '40%';

    document.querySelectorAll('#modalEditarUsuario .pec-btn-estado').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.estado === estado);
    });

    abrirModalEditarUsuario();
};

window.guardarCambiosUsuario = async function() {
    if (!usuarioActual) return;

    const estadoBtn = document.querySelector('#modalEditarUsuario .pec-btn-estado.active');
    const nuevoEstado = estadoBtn?.dataset.estado || 'activo';

    try {
        const res = await fetch(`${API_ADMIN}/usuarios/${usuarioActual.id_usuario}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        const data = await res.json();
        if (data.error) { alert(data.error); return; }

        cerrarModalEditarUsuario();
        await cargarUsuarios();
    } catch (err) {
        alert('Error al actualizar usuario');
    }
};

// ── BUSCADOR ──────────────────────────────────────────────
document.getElementById('input-buscar-usuario')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtrados = todosLosUsuarios.filter(u => {
        const nombre = u.candidato
            ? `${u.candidato.nombre_candidato} ${u.candidato.apellido_candidato}`.toLowerCase()
            : '';
        return nombre.includes(q) || u.correo_usuario.toLowerCase().includes(q);
    });
    mostrarUsuariosEnTabla(filtrados);
});

// ── EXPORTAR PDF ──────────────────────────────────────────
window.exportarUsuariosPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('TeBuscan - Reporte de Usuarios', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, 14, 28);

    doc.setTextColor(0);
    doc.setFontSize(9);

    const headers = ['Usuario', 'Email', 'Fecha registro', 'Estado'];
    const colWidths = [55, 65, 35, 25];
    let y = 40;

    // Header tabla
    doc.setFillColor(238, 244, 251);
    doc.rect(14, y - 5, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    let x = 14;
    headers.forEach((h, i) => {
        doc.text(h, x + 2, y);
        x += colWidths[i];
    });

    y += 8;
    doc.setFont('helvetica', 'normal');

    todosLosUsuarios.forEach((u, idx) => {
        if (y > 270) { doc.addPage(); y = 20; }

        if (idx % 2 === 0) {
            doc.setFillColor(248, 251, 253);
            doc.rect(14, y - 5, 182, 8, 'F');
        }

        const nombre = u.candidato
            ? `${u.candidato.nombre_candidato} ${u.candidato.apellido_candidato}`
            : u.correo_usuario;
        const fecha = new Date(u.registro_usuario).toLocaleDateString('es-ES');
        const estadoRaw = u.candidato?.estado_candidato || (u.activo ? 'activo' : 'inactivo'); // ← faltaba esta
        const mapaEstado = { 'activo': 'Activo', 'inactivo': 'Inactivo' };
        const estado = mapaEstado[estadoRaw] || estadoRaw;

        x = 14;
        const fila = [nombre, u.correo_usuario, fecha, estado];
        fila.forEach((val, i) => {
            doc.text(String(val || '-').substring(0, 25), x + 2, y);
            x += colWidths[i];
        });

        y += 8;
    });

    doc.save('usuarios_tebuscan.pdf');
};

// ── INIT ──────────────────────────────────────────────────
obtenerEstadisticasPanel();
cargarUsuarios();

// ── EMPRESAS ──────────────────────────────────────────────
let todasLasEmpresas = [];
let empresaActual = null;

async function cargarEmpresas() {
    try {
        const res = await fetch(`${API_ADMIN}/empresas`);
        const { empresas } = await res.json();
        todasLasEmpresas = empresas || [];
        mostrarEmpresasEnLista(todasLasEmpresas);
    } catch (err) {
        console.error('Error cargando empresas:', err);
        document.getElementById('lista-empresas').innerHTML =
            '<p class="text-center text-muted py-4">Error al cargar empresas</p>';
    }
}

function mostrarEmpresasEnLista(empresas) {
    const lista = document.getElementById('lista-empresas');

    if (!empresas || empresas.length === 0) {
        lista.innerHTML = '<p class="text-center text-muted py-5">No se encontraron empresas</p>';
        return;
    }

    lista.innerHTML = empresas.map(e => `
        <div class="d-flex align-items-center justify-content-between p-3 border rounded-3 mb-2"
             style="background:#fff;">
            <div class="d-flex align-items-center gap-3">
                <div class="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                     style="width:44px;height:44px;background:#F0F5FB;">
                    <i class="bi bi-building" style="color:#6B9BD9;font-size:1.1rem;"></i>
                </div>
                <div>
                    <div class="fw-semibold" style="font-size:.9rem;color:#526578;">${e.nombre_empresa}</div>
                    <div class="text-muted small">${e.industria_empresa || '-'} • ${e.tamano_empresa || '-'}</div>
                </div>
            </div>
            <div class="d-flex align-items-center gap-3">
                <div class="text-end">
                    <div class="d-flex align-items-center gap-1">
                        <i class="bi bi-activity" style="color:#FDC700;font-size:.9rem;"></i>
                        <span class="fw-bold small">${e._promedio ?? '-'}</span>
                    </div>
                    <div class="text-muted" style="font-size:.75rem;">${e._totalValoraciones ?? 0} valoraciones</div>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary btn-sm rounded-2" style="font-size:.8rem;"
                        onclick="verEmpresa(${e.id_empresa})">Ver</button>
                    <button class="btn btn-outline-secondary btn-sm rounded-2" style="font-size:.8rem;"
                        onclick="editarEmpresa(${e.id_empresa})">Editar</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ── VER EMPRESA ───────────────────────────────────────────
window.verEmpresa = function(id_empresa) {
    const e = todasLasEmpresas.find(e => e.id_empresa === id_empresa);
    if (!e) return;
    empresaActual = e;

    document.getElementById('modal-ver-emp-nombre').textContent = e.nombre_empresa;
    document.getElementById('modal-ver-emp-rating').textContent = e._promedio ?? '-';
    document.getElementById('modal-ver-emp-valoraciones').textContent = `(${e._totalValoraciones ?? 0} valoraciones)`;
    document.getElementById('modal-ver-emp-industria').textContent = e.industria_empresa || '-';
    document.getElementById('modal-ver-emp-tamano').textContent = e.tamano_empresa || '-';
    document.getElementById('modal-ver-emp-ubicacion').textContent = e.ubicacion_empresa || '-';
    document.getElementById('modal-ver-emp-descripcion').textContent = e.descripcion_empresa || '';
    document.getElementById('modal-ver-emp-empleos').textContent = e._empleosActivos ?? 0;
    document.getElementById('modal-ver-emp-candidatos').textContent = e._totalCandidatos ?? 0;
    document.getElementById('modal-ver-emp-total-val').textContent = e._totalValoraciones ?? 0;
    document.getElementById('modal-ver-emp-ultima-oferta').textContent = e._ultimaOferta ?? '-';
    document.getElementById('modal-ver-emp-ultimo-contratado').textContent = e._ultimoContratado ?? '-';
    document.getElementById('modal-ver-emp-creacion').textContent = e._creacion ?? '-';
    

    abrirModalVerEmpresa();
};

window.pasarAEditarEmpresa = function() {
    cerrarModalVerEmpresa();
    setTimeout(() => {
        if (empresaActual) editarEmpresa(empresaActual.id_empresa);
    }, 200);
};

// ── EDITAR EMPRESA ────────────────────────────────────────
window.editarEmpresa = function(id_empresa) {
    const e = todasLasEmpresas.find(e => e.id_empresa === id_empresa);
    if (!e) return;
    empresaActual = e;

    document.getElementById('modal-edit-emp-nombre').textContent = e.nombre_empresa;
    document.getElementById('modal-edit-emp-rating').textContent = e._promedio ?? '-';
    document.getElementById('modal-edit-emp-valoraciones').textContent = `(${e._totalValoraciones ?? 0} valoraciones)`;
    document.getElementById('modal-edit-emp-industria').textContent = e.industria_empresa || '-';
    document.getElementById('modal-edit-emp-tamano').textContent = e.tamano_empresa || '-';
    document.getElementById('modal-edit-emp-ubicacion').textContent = e.ubicacion_empresa || '-';
    document.getElementById('modal-edit-emp-descripcion').textContent = e.descripcion_empresa || '';
    document.getElementById('modal-edit-emp-empleos').textContent = e._empleosActivos ?? 0;
    document.getElementById('modal-edit-emp-candidatos').textContent = e._totalCandidatos ?? 0;
    document.getElementById('modal-edit-emp-total-val').textContent = e._totalValoraciones ?? 0;
    document.getElementById('modal-edit-emp-ultima-oferta').textContent = e._ultimaOferta ?? '-';
    document.getElementById('modal-edit-emp-ultimo-contratado').textContent = e._ultimoContratado ?? '-';
    document.getElementById('modal-edit-emp-creacion').textContent = e._creacion ?? '-';
    
    const estado = e._estado || 'activo';
    document.querySelectorAll('#modalEditarEmpresa .pec-btn-estado').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.estado === estado);
    });

    abrirModalEditarEmpresa();
};

window.guardarCambiosEmpresa = async function() {
    if (!empresaActual) return;

    const estadoBtn = document.querySelector('#modalEditarEmpresa .pec-btn-estado.active');
    const nuevoEstado = estadoBtn?.dataset.estado || 'activo';

    try {
        const res = await fetch(`${API_ADMIN}/empresas/${empresaActual.id_empresa}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        const data = await res.json();
        if (data.error) { alert(data.error); return; }

        cerrarModalEditarEmpresa();
        await cargarEmpresas();
    } catch (err) {
        alert('Error al actualizar empresa');
    }
};

// ── BUSCADOR EMPRESAS ─────────────────────────────────────
document.getElementById('input-buscar-empresa')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtradas = todasLasEmpresas.filter(emp =>
        emp.nombre_empresa?.toLowerCase().includes(q) ||
        emp.industria_empresa?.toLowerCase().includes(q)
    );
    mostrarEmpresasEnLista(filtradas);
});

// ── EXPORTAR PDF EMPRESAS ─────────────────────────────────
window.exportarEmpresasPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('TeBuscan - Reporte de Empresas', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, 14, 28);

    doc.setTextColor(0);
    doc.setFontSize(9);

    const headers = ['Empresa', 'Industria', 'Tamaño', 'Empleos', 'Estado'];
    const colWidths = [55, 45, 35, 22, 25];
    let y = 40;

    doc.setFillColor(238, 244, 251);
    doc.rect(14, y - 5, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    let x = 14;
    headers.forEach((h, i) => {
        doc.text(h, x + 2, y);
        x += colWidths[i];
    });

    y += 8;
    doc.setFont('helvetica', 'normal');

    todasLasEmpresas.forEach((e, idx) => {
        if (y > 270) { doc.addPage(); y = 20; }

        if (idx % 2 === 0) {
            doc.setFillColor(248, 251, 253);
            doc.rect(14, y - 5, 182, 8, 'F');
        }

        const estadoRaw = e._estado || 'activo';
        const mapaEstado = { 'activo': 'Activo', 'inactivo': 'Inactivo' };
        const estado = mapaEstado[estadoRaw] || estadoRaw;

        x = 14;
        const fila = [
            e.nombre_empresa,
            e.industria_empresa || '-',
            e.tamano_empresa || '-',
            String(e._empleosActivos ?? 0),
            estado
        ];
        fila.forEach((val, i) => {
            doc.text(String(val || '-').substring(0, 22), x + 2, y);
            x += colWidths[i];
        });

        y += 8;
    });

    doc.save('empresas_tebuscan.pdf');
};

// ── TABS ──────────────────────────────────────────────────
window.switchAdminTab = function(tab, el) {
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane-content').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('pane-' + tab).classList.add('active');
    if (tab === 'empresas') cargarEmpresas();
};