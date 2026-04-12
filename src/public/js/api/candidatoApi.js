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