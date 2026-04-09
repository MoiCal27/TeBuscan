import * as generalService from '../services/generalServices.js';

// GET /api/general/empleos-destacados
export const getEmpleosDestacados = async (req, res, next) => {
    try {
        const empleos = await generalService.getEmpleosDestacados();
        res.json({ empleos });
    } catch (err) {
        next(err);
    }
};

// GET /api/general/empleos
export const getTodosLosEmpleos = async (req, res, next) => {
    try {
        const { categoria, experiencia, contrato, salario_min, salario_max, busqueda, ubicacion } = req.query;
        const empleos = await generalService.getTodosLosEmpleos({
            categoria, experiencia, contrato, salario_min, salario_max, busqueda, ubicacion
        });
        res.json({ empleos });
    } catch (err) {
        next(err);
    }
};

// GET /api/general/empleos/:id
export const getEmpleoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const empleo = await generalService.getEmpleoPorId(id);

        // Valoraciones y empleos similares en paralelo
        const [{ valoraciones, promedio, total }, similares] = await Promise.all([
            generalService.getValoracionesEmpresa(empleo.empresa.id_empresa),
            generalService.getEmpleosSimilares(id, empleo.categoria_empleo)
        ]);

        res.json({ empleo, valoraciones, promedioValoracion: promedio, totalValoraciones: total, similares });
    } catch (err) {
        next(err);
    }
};

// GET /api/general/stats
export const getStats = async (req, res, next) => {
    try {
        const stats = await generalService.getStatsGenerales();
        res.json({ stats });
    } catch (err) {
        next(err);
    }
};

// GET /api/general/categorias
export const getCategorias = async (req, res, next) => {
    try {
        const categorias = await generalService.getCategorias();
        res.json({ categorias });
    } catch (err) {
        next(err);
    }
};

// GET /api/general/recursos-destacados 
export const getRecursosDestacados = async (req, res, next) => {
    try {
        const recursos = await generalService.getRecursosDestacados();
        res.json({ recursos });
    } catch (err) {
        next(err);
    }
};

// GET /api/general/recursos
export const getTodosLosRecursos = async (req, res, next) => {
    try {
        const { busqueda, categoria } = req.query;
        const recursos = await generalService.getTodosLosRecursos({ busqueda, categoria });
        res.json({ recursos });
    } catch (err) {
        next(err);
    }
};

// GET /api/general/recursos/categorias
export const getCategoriasRecursos = async (req, res, next) => {
    try {
        const categorias = await generalService.getCategoriasRecursos();
        res.json({ categorias });
    } catch (err) {
        next(err);
    }
};

// GET /api/general/empresas 
export const getTodasLasEmpresas = async (req, res, next) => {
    try {
        const { busqueda, industria, tamano } = req.query;
        const empresas = await generalService.getTodasLasEmpresas({ busqueda, industria, tamano });
        res.json({ empresas });
    } catch (err) {
        next(err);
    }
};
 
// GET /api/general/empresas/stats
export const getStatsEmpresas = async (req, res, next) => {
    try {
        const stats = await generalService.getStatsEmpresas();
        res.json({ stats });
    } catch (err) {
        next(err);
    }
};
 
// GET /api/general/empresas/:id
export const getEmpresaPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
 
        // Empresa + empleos + valoraciones en paralelo
        const [empresa, empleos, { valoraciones, promedio, total, distribucion }] = await Promise.all([
            generalService.getEmpresaPorId(id),
            generalService.getEmpleosPorEmpresa(id),
            generalService.getValoracionesPorEmpresa(id)
        ]);
 
        res.json({
            empresa,
            empleos,
            valoraciones,
            promedioValoracion: promedio,
            totalValoraciones:  total,
            distribucionValoraciones: distribucion
        });
    } catch (err) {
        next(err);
    }
};