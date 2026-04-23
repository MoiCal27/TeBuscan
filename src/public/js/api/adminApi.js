const API_URL = "/api/admin";

export const loginAdmin = async (data) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getUsuarios = async () => {
  const res = await fetch(`${API_URL}/usuarios`);
  return res.json();
};

export const actualizarEstadoUsuario = async (id_usuario, estado) => {
  const res = await fetch(`${API_URL}/usuarios/${id_usuario}/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  return res.json();
};

export const getEmpresas = async () => {
  const res = await fetch(`${API_URL}/empresas`);
  return res.json();
};

export const actualizarEstadoEmpresa = async (id_empresa, estado) => {
  const res = await fetch(`${API_URL}/empresas/${id_empresa}/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  return res.json();
};

export const getVacantes = async () => {
  const res = await fetch(`${API_URL}/vacantes`);
  return res.json();
};

export const actualizarEstadoVacante = async (id_empleo, estado) => {
  const res = await fetch(`${API_URL}/vacantes/${id_empleo}/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  return res.json();
};

export const getForos = async () => {
  const res = await fetch(`${API_URL}/foros`);
  return res.json();
};

export const actualizarEstadoForo = async (id_foro, estado) => {
  const res = await fetch(`${API_URL}/foros/${id_foro}/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  return res.json();
};

export const eliminarForo = async (id_foro) => {
  const res = await fetch(`${API_URL}/foros/${id_foro}`, { method: "DELETE" });
  return res.json();
};

export const actualizarEstadoRespuesta = async (id_respuesta, estado) => {
  const res = await fetch(`${API_URL}/respuestas/${id_respuesta}/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
  return res.json();
};

export const eliminarRespuesta = async (id_respuesta) => {
  const res = await fetch(`${API_URL}/respuestas/${id_respuesta}`, {
    method: "DELETE",
  });
  return res.json();
};

export const getResumenPlataforma = async () => {
  const res = await fetch(`${API_URL}/stats`);
  return res.json();
};

export const getEstadisticas = async () => {
  const res = await fetch(`${API_URL}/estadisticas`);
  return res.json();
};
