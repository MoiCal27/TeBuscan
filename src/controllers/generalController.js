import * as generalService from "../services/generalServices.js";

export const getEmpleosDestacados = async (req, res, next) => {
  try {
    const empleos = await generalService.getEmpleosDestacados();
    res.json({ empleos });
  } catch (err) {
    next(err);
  }
};

export const getTodosLosEmpleos = async (req, res, next) => {
  try {
    const {
      categoria,
      experiencia,
      contrato,
      salario_min,
      salario_max,
      busqueda,
      ubicacion,
    } = req.query;
    const empleos = await generalService.getTodosLosEmpleos({
      categoria,
      experiencia,
      contrato,
      salario_min,
      salario_max,
      busqueda,
      ubicacion,
    });
    res.json({ empleos });
  } catch (err) {
    next(err);
  }
};

export const getEmpleoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const empleo = await generalService.getEmpleoPorId(id);

    // Valoraciones y empleos similares en paralelo
    const [{ valoraciones, promedio, total }, similares] = await Promise.all([
      generalService.getValoracionesEmpresa(empleo.empresa.id_empresa),
      generalService.getEmpleosSimilares(id, empleo.categoria_empleo),
    ]);

    res.json({
      empleo,
      valoraciones,
      promedioValoracion: promedio,
      totalValoraciones: total,
      similares,
    });
  } catch (err) {
    next(err);
  }
};

export const getEstadisticas = async (req, res, next) => {
  try {
    const estadisticas = await generalService.getEstadisticasGenerales();
    res.json({ estadisticas });
  } catch (err) {
    next(err);
  }
};

export const getCategorias = async (req, res, next) => {
  try {
    const categorias = await generalService.getCategorias();
    res.json({ categorias });
  } catch (err) {
    next(err);
  }
};

export const getRecursosDestacados = async (req, res, next) => {
  try {
    const recursos = await generalService.getRecursosDestacados();
    res.json({ recursos });
  } catch (err) {
    next(err);
  }
};

export const getTodosLosRecursos = async (req, res, next) => {
  try {
    const { busqueda, categoria } = req.query;
    const recursos = await generalService.getTodosLosRecursos({
      busqueda,
      categoria,
    });
    res.json({ recursos });
  } catch (err) {
    next(err);
  }
};

export const getCategoriasRecursos = async (req, res, next) => {
  try {
    const categorias = await generalService.getCategoriasRecursos();
    res.json({ categorias });
  } catch (err) {
    next(err);
  }
};

export const getTodasLasEmpresas = async (req, res, next) => {
  try {
    const { busqueda, industria, tamano } = req.query;
    const empresas = await generalService.getTodasLasEmpresas({
      busqueda,
      industria,
      tamano,
    });
    res.json({ empresas });
  } catch (err) {
    next(err);
  }
};

export const getEstadisticasEmpresas = async (req, res, next) => {
  try {
    const estadisticas = await generalService.getEstadisticasEmpresas();
    res.json({ estadisticas });
  } catch (err) {
    next(err);
  }
};

export const getEmpresaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [empresa, empleos, { valoraciones, promedio, total, distribucion }] =
      await Promise.all([
        generalService.getEmpresaPorId(id),
        generalService.getEmpleosPorEmpresa(id),
        generalService.getValoracionesPorEmpresa(id),
      ]);

    res.json({
      empresa,
      empleos,
      valoraciones,
      promedioValoracion: promedio,
      totalValoraciones: total,
      distribucionValoraciones: distribucion,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// AÑADIR al final de generalController.js
// ─────────────────────────────────────────────────────────────

export const enviarMensajeContacto = async (req, res, next) => {
  try {
    const { nombre, correo, asunto, mensaje } = req.body;

    if (!nombre || !correo || !asunto || !mensaje) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios." });
    }

    const data = await generalService.enviarMensajeContacto({
      nombre,
      correo,
      asunto,
      mensaje,
    });
    res
      .status(201)
      .json({ ok: true, mensaje: "Mensaje enviado correctamente.", data });
  } catch (err) {
    next(err);
  }
};

export const getTodosLosMensajes = async (req, res, next) => {
  try {
    const mensajes = await generalService.getTodosLosMensajes();
    res.json({ mensajes });
  } catch (err) {
    next(err);
  }
};

export const marcarMensajeLeido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await generalService.marcarMensajeLeido(id);
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

export const eliminarMensaje = async (req, res, next) => {
  try {
    const { id } = req.params;
    await generalService.eliminarMensaje(id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
