export function mostrarError(id, mensaje) {
    const wrap = document.getElementById('wrap-' + id);
    const campo = document.getElementById(id);
    const error = document.getElementById('error-' + id);
    if (wrap) { wrap.classList.add('error'); wrap.classList.remove('success'); }
    if (campo) { campo.classList.add('error'); campo.classList.remove('success'); }
    if (error) { error.textContent = mensaje; error.classList.add('visible'); }
}

export function limpiarError(id) {
    const wrap = document.getElementById('wrap-' + id);
    const campo = document.getElementById(id);
    const error = document.getElementById('error-' + id);
    if (wrap) { wrap.classList.remove('error'); wrap.classList.add('success'); }
    if (campo) { campo.classList.remove('error'); campo.classList.add('success'); }
    if (error) { error.classList.remove('visible'); }
}

export function limpiarTodos(ids) {
    ids.forEach(id => limpiarError(id));
}