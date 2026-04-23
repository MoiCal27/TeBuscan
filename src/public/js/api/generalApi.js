const API_URL = "/api/general";

export const getEmpleosDestacados = async () => {
  const res = await fetch(`${API_URL}/empleos-destacados`);
  return res.json();
};

export const getEstadisticas = async () => {
  const res = await fetch(`${API_URL}/estadisticas`);
  return res.json();
};

export const getCategorias = async () => {
  const res = await fetch(`${API_URL}/categorias`);
  return res.json();
};

export const getRecursosDestacados = async () => {
  const res = await fetch(`${API_URL}/recursos-destacados`);
  return res.json();
};

export const getTodosLosRecursos = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.busqueda) params.set("busqueda", filtros.busqueda);
  if (filtros.categoria) params.set("categoria", filtros.categoria);
  const res = await fetch(`${API_URL}/recursos?${params.toString()}`);
  return res.json();
};

export const getCategoriasRecursos = async () => {
  const res = await fetch(`${API_URL}/recursos/categorias`);
  return res.json();
};

export const getTodosLosEmpleos = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.busqueda) params.set("busqueda", filtros.busqueda);
  if (filtros.ubicacion) params.set("ubicacion", filtros.ubicacion);
  if (filtros.categoria) params.set("categoria", filtros.categoria);
  if (filtros.experiencia) params.set("experiencia", filtros.experiencia);
  if (filtros.contrato) params.set("contrato", filtros.contrato);
  if (filtros.salario_min) params.set("salario_min", filtros.salario_min);
  if (filtros.salario_max) params.set("salario_max", filtros.salario_max);

  const res = await fetch(`${API_URL}/empleos?${params.toString()}`);
  return res.json();
};

export const getEmpleoPorId = async (id) => {
  const res = await fetch(`${API_URL}/empleos/${id}`);
  return res.json();
};

export const getTodasLasEmpresas = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.busqueda) params.set("busqueda", filtros.busqueda);
  if (filtros.industria) params.set("industria", filtros.industria);
  if (filtros.tamano) params.set("tamano", filtros.tamano);

  const res = await fetch(`${API_URL}/empresas?${params.toString()}`);
  return res.json();
};

export const getEstadisticasEmpresas = async () => {
  const res = await fetch(`${API_URL}/empresas/estadisticas`);
  return res.json();
};

export const getEmpresaPorId = async (id) => {
  const res = await fetch(`${API_URL}/empresas/${id}`);
  return res.json();
};

export const enviarMensajeContacto = async ({
  nombre,
  correo,
  asunto,
  mensaje,
}) => {
  const res = await fetch(`${API_URL}/contacto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, correo, asunto, mensaje }),
  });
  return res.json();
};

export const getTodosLosMensajes = async () => {
  const res = await fetch(`${API_URL}/contacto`);
  return res.json();
};

export const marcarMensajeLeido = async (id) => {
  const res = await fetch(`${API_URL}/contacto/${id}/leido`, {
    method: "PATCH",
  });
  return res.json();
};

export const eliminarMensaje = async (id) => {
  const res = await fetch(`${API_URL}/contacto/${id}`, { method: "DELETE" });
  return res.json();
};
