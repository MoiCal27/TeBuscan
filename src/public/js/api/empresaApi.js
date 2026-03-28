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
