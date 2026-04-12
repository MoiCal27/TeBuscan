const API_URL = "http://localhost:3000/api/empresa";


export const registrarEmpresa = async (data) => {
  const response = await fetch(`${API_URL}/registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return await response.json();
};

export const loginEmpresa = async (data) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return await response.json();
};
export const getSesion = async () => {
    const response = await fetch(`${API_URL}/sesion`);
    return await response.json();
};

export const actualizarEmpresa = async (data) => {
    const response = await fetch(`${API_URL}/actualizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
};

export const getEmpleos = async () => {
    const response = await fetch(`${API_URL}/empleos`);
    return await response.json();
};

export const crearEmpleo = async (data) => {
    const response = await fetch(`${API_URL}/empleos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
};

export const actualizarEmpleo = async (id_empleo, data) => {
    const response = await fetch(`${API_URL}/empleos/${id_empleo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
};

export const getCandidatos = async () => {
    const res = await fetch('/api/empresa/candidatos');
    return res.json();
};

export const actualizarEstadoAplicacion = async (id_aplicacion, datos) => {
    const res = await fetch(`/api/empresa/candidatos/${id_aplicacion}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    return res.json();
};

export const getEstadisticas = async () => {
    const res = await fetch('/api/empresa/estadisticas');
    return res.json();
};

export const getForos = async (id_categoria = null) => {
    const url = id_categoria
        ? `/api/empresa/foros?id_categoria=${id_categoria}`
        : '/api/empresa/foros';
    const res = await fetch(url);
    return res.json();
};

export const getEstadisticasForo = async () => {
    const res = await fetch('/api/empresa/foros/estadisticas');
    return res.json();
};

export const crearForo = async (datos) => {
    const res = await fetch('/api/empresa/foros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    return res.json();
};

export const crearRespuesta = async (id_foro, contenido) => {
    const res = await fetch(`/api/empresa/foros/${id_foro}/respuestas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido })
    });
    return res.json();
};

export const incrementarVistas = async (id_foro) => {
    const res = await fetch(`/api/empresa/foros/${id_foro}/vistas`, {
        method: 'PUT'
    });
    return res.json();
};

 export const subirLogo = async (urlLogo) => {
    const res = await fetch(`${API_URL}/logo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url_logo: urlLogo })
    });
    return res.json();
};