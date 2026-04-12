import { getTodosLosRecursos } from '../api/generalApi.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    if (!id) { window.location.href = '/recursos-candidato'; return; }

    try {
        const { recursos } = await getTodosLosRecursos();
        const recurso = recursos.find(r => r.id_recurso === id);
        if (!recurso) { window.location.href = '/recursos-candidato'; return; }

        // Tipo y badge
        const tipo = recurso.categoria?.tipo || 'recurso';
        const catNombre = recurso.categoria?.nombre_categoria || '';
        document.getElementById('recurso-tipo-badge').innerHTML = `
            <span class="badge rounded-pill fw-normal" style="background:var(--cream);color:var(--dark);border:1px solid #dde5ed;font-size:.82rem;">
                Artículo
            </span>
            ${catNombre ? `<span class="badge-new">${catNombre}</span>` : ''}`;

        // Título
        document.getElementById('recurso-titulo').textContent = recurso.titulo_recurso;
        document.title = `TeBuscan - ${recurso.titulo_recurso}`;

        // Meta
        const fecha = recurso.fecha_recurso
            ? new Date(recurso.fecha_recurso).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })
            : '';
        document.getElementById('recurso-meta').innerHTML = `
            <span><i class="bi bi-person me-1"></i>${recurso.autor?.nombre_autor || 'TeBuscan'}</span>
            ${fecha ? `<span><i class="bi bi-calendar3 me-1"></i>${fecha}</span>` : ''}
            ${recurso.duracion_recurso ? `<span><i class="bi bi-clock me-1"></i>${recurso.duracion_recurso}</span>` : ''}`;

        // Descripción
        document.getElementById('recurso-descripcion').textContent = recurso.descripcion || '';

        // Likes
        let likesActual = recurso.likes ?? 0;
        let yaLikeo = localStorage.getItem(`like_recurso_${id}`) === 'true';

        document.getElementById('recurso-likes').innerHTML = `
            <button id="btn-like" onclick="toggleLike()" style="
                background:none;border:none;cursor:pointer;
                display:flex;align-items:center;gap:6px;
                color:${yaLikeo ? 'var(--blue)' : 'var(--dark)'};
                font-size:.95rem;padding:0;">
                <i class="bi ${yaLikeo ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}" style="font-size:1.1rem;"></i>
                <span id="likes-count">${likesActual}</span>
            </button>`;

        window.toggleLike = async function() {
            yaLikeo = !yaLikeo;
            likesActual = yaLikeo ? likesActual + 1 : likesActual - 1;
            localStorage.setItem(`like_recurso_${id}`, yaLikeo);

            document.getElementById('likes-count').textContent = likesActual;
            const btn = document.getElementById('btn-like');
            btn.style.color = yaLikeo ? 'var(--blue)' : 'var(--dark)';
            btn.querySelector('i').className = `bi ${yaLikeo ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}`;

            await fetch(`/api/candidato/recursos/${id}/like`,  {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ incremento: yaLikeo ? 1 : -1 })
            });
        };

        
        const contenido = recurso.contenido || '';

        if (contenido.includes('youtube.com/embed') || contenido.includes('youtu.be')) {
            document.getElementById('recurso-contenido').innerHTML = `
                <div class="ratio ratio-16x9">
                    <iframe src="${contenido}" 
                        title="${recurso.titulo_recurso}"
                        allowfullscreen
                        style="border-radius:12px;border:none;">
                    </iframe>
                </div>`;
        } else {
            const lineas = contenido.split('\n').filter(l => l.trim());
            let html = '';
            let enLista = false;
            let esPrimero = true;

            lineas.forEach(l => {
                if (l.startsWith('- ')) {
                    if (!enLista) { html += '<ul style="padding-left:20px;margin-bottom:12px;">'; enLista = true; }
                    html += `<li style="margin-bottom:6px;color:var(--dark);font-size:.95rem;">${l.replace('- ', '')}</li>`;
                } else {
                    if (enLista) { html += '</ul>'; enLista = false; }
                    const esTitulo = /^(Introducción|Conclusión|\d+\.)/.test(l.trim());
                    if (esTitulo) {
                        const marginTop = esPrimero ? '0' : '28px';
                        html += `<h2 style="font-size:1.25rem;font-weight:700;color:var(--dark);margin:${marginTop} 0 10px;font-family:'Poppins',sans-serif;">${l}</h2>`;
                        esPrimero = false;
                    } else {
                        html += `<p style="margin-bottom:14px;color:var(--dark);font-size:.95rem;line-height:1.7;">${l}</p>`;
                    }
                }
            });

            if (enLista) html += '</ul>';
            document.getElementById('recurso-contenido').innerHTML = html;
        }

        // Autor
        const autor = recurso.autor;
        if (autor) {
            document.getElementById('autor-inicial').textContent = autor.nombre_autor?.charAt(0) || '?';
            document.getElementById('autor-nombre').textContent = autor.nombre_autor || '';
            document.getElementById('autor-rol').textContent = autor.rol_autor || '';
            document.getElementById('autor-desc').textContent = autor.descripcion || '';
        }

        // Recursos relacionados (misma categoría)
        const relacionados = recursos
            .filter(r => r.id_recurso !== id && r.categoria?.id_categoria === recurso.categoria?.id_categoria)
            .slice(0, 3);

        const iconos = { 'bi-camera-video': 'bi-camera-video', default: 'bi-file-earmark-text' };

        document.getElementById('recursos-relacionados').innerHTML = relacionados.length
            ? relacionados.map(r => `
                <a href="/detalle-recurso?id=${r.id_recurso}" class="text-decoration-none d-flex align-items-center gap-2"
                   style="color:var(--dark);">
                    <div class="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 border"
                         style="width:36px;height:36px;background:var(--cream)">
                        <i class="bi bi-file-earmark-text" style="color:var(--blue);font-size:.8rem;"></i>
                    </div>
                    <div>
                        <div class="fw-semibold" style="font-size:.85rem;">${r.titulo_recurso}</div>
                        ${r.duracion_recurso ? `<div class="text-muted" style="font-size:.78rem;">${r.duracion_recurso}</div>` : ''}
                    </div>
                </a>`).join('')
            : '<p class="text-muted small">No hay recursos relacionados.</p>';

    } catch (err) {
        console.error('Error cargando recurso:', err);
        window.location.href = '/recursos-candidato';
    }
});