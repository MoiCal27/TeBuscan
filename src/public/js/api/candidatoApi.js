const API_URL = '/api/candidato';

export const registrarCandidato = async (data) => {
    const res = await fetch(`${API_URL}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const loginCandidato = async (data) => {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const getSesion = async () => {
    const res = await fetch(`${API_URL}/sesion`);
    return res.json();
};

export const actualizarCandidato = async (data) => {
    const res = await fetch('/api/candidato/actualizar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const getAplicaciones = async () => {
    const res = await fetch('/api/candidato/aplicaciones');
    return res.json();
};

export const getEstadisticas = async () => {
    const res = await fetch('/api/candidato/estadisticas');
    return res.json();
};

export const subirCV = async (urlCV) => {
    const res = await fetch('/api/candidato/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url_cv: urlCV })
    });
    return res.json();
};

export const getAlertas = async () => {
    const res = await fetch('/api/candidato/alertas');
    return res.json();
};

export const crearAlerta = async (data) => {
    const res = await fetch('/api/candidato/alertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const actualizarAlerta = async (id_alerta, data) => {
    const res = await fetch(`/api/candidato/alertas/${id_alerta}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const eliminarAlerta = async (id_alerta) => {
    const res = await fetch(`/api/candidato/alertas/${id_alerta}`, {
        method: 'DELETE'
    });
    return res.json();
};

export const getNotificaciones = async () => {
    const res = await fetch('/api/candidato/notificaciones');
    return res.json();
};

export const marcarNotificacionesLeidas = async () => {
    const res = await fetch('/api/candidato/notificaciones/leer', { method: 'PUT' });
    return res.json();
};

export const getValoraciones = async () => {
    const res = await fetch('/api/candidato/valoraciones');
    return res.json();
};

export const crearValoracion = async (data) => {
    const res = await fetch('/api/candidato/valoraciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const actualizarValoracion = async (id_valoracion, data) => {
    const res = await fetch(`/api/candidato/valoraciones/${id_valoracion}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const eliminarValoracion = async (id_valoracion) => {
    const res = await fetch(`/api/candidato/valoraciones/${id_valoracion}`, {
        method: 'DELETE'
    });
    return res.json();
};