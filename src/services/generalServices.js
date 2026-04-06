import supabase from '../db.js';

// ── Empleos destacados (públicos, activos, últimos 6) ──────────────────────────
export const getEmpleosDestacados = async () => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('empleos')
        .select(`
            id_empleo,
            titulo_empleo,
            ubicacion_empleo,
            categoria_empleo,
            tipo_empleo,
            tipo_contrato_empleo,
            salario_min_empleo,
            salario_max_empleo,
            nivel_experiencia_empleo,
            creacion_empleo,
            empresa (
                id_empresa,
                nombre_empresa,
                logo_empresa,
                industria_empresa,
                ubicacion_empresa
            )
        `)
        .eq('estado_empleo', 'activo')
        .order('creacion_empleo', { ascending: false })
        .limit(6);

    if (error) throw new Error(error.message);
    return data;
};

// ── Todos los empleos activos (para buscar-empleos) ───────────────────────────
export const getTodosLosEmpleos = async ({ categoria, experiencia, contrato, salario_min, salario_max, busqueda, ubicacion } = {}) => {
    let query = supabase
        .schema('tebuscan')
        .from('empleos')
        .select(`
            id_empleo,
            titulo_empleo,
            ubicacion_empleo,
            categoria_empleo,
            tipo_empleo,
            tipo_contrato_empleo,
            salario_min_empleo,
            salario_max_empleo,
            nivel_experiencia_empleo,
            descripcion_empleo,
            creacion_empleo,
            empresa (
                id_empresa,
                nombre_empresa,
                logo_empresa
            )
        `)
        .eq('estado_empleo', 'activo')
        .order('creacion_empleo', { ascending: false });

    if (categoria)    query = query.eq('categoria_empleo', categoria);
    if (experiencia)  query = query.eq('nivel_experiencia_empleo', experiencia);
    if (contrato)     query = query.eq('tipo_contrato_empleo', contrato);
    if (salario_min)  query = query.gte('salario_min_empleo', salario_min);
    if (salario_max)  query = query.lte('salario_max_empleo', salario_max);
    if (busqueda)     query = query.ilike('titulo_empleo', `%${busqueda}%`);
    if (ubicacion)    query = query.ilike('ubicacion_empleo', `%${ubicacion}%`);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

// ── Detalle de un empleo por ID ───────────────────────────────────────────────
export const getEmpleoPorId = async (id_empleo) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('empleos')
        .select(`
            id_empleo,
            titulo_empleo,
            ubicacion_empleo,
            categoria_empleo,
            tipo_empleo,
            tipo_contrato_empleo,
            salario_min_empleo,
            salario_max_empleo,
            nivel_experiencia_empleo,
            descripcion_empleo,
            requisitos_empleo,
            beneficios_empleo,
            creacion_empleo,
            estado_empleo,
            empresa (
                id_empresa,
                nombre_empresa,
                logo_empresa,
                industria_empresa,
                tamano_empresa,
                ubicacion_empresa,
                descripcion_empresa,
                site_web_empresa
            )
        `)
        .eq('id_empleo', id_empleo)
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// ── Valoraciones de una empresa (para sidebar de detalle) ────────────────────
export const getValoracionesEmpresa = async (id_empresa) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('valoracion')
        .select(`
            id_valoracion,
            calificacion,
            comentario,
            fecha_valoracion,
            puesto,
            candidato (
                nombre_candidato,
                apellido_candidato
            )
        `)
        .eq('id_empresa', id_empresa)
        .order('fecha_valoracion', { ascending: false })
        .limit(5);

    if (error) throw new Error(error.message);

    const promedio = data && data.length > 0
        ? (data.reduce((acc, v) => acc + v.calificacion, 0) / data.length).toFixed(1)
        : 0;

    return { valoraciones: data, promedio, total: data?.length || 0 };
};

// ── Empleos similares (misma categoría, excluyendo el actual) ────────────────
export const getEmpleosSimilares = async (id_empleo, categoria_empleo) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('empleos')
        .select(`
            id_empleo,
            titulo_empleo,
            ubicacion_empleo,
            empresa (
                nombre_empresa
            )
        `)
        .eq('estado_empleo', 'activo')
        .eq('categoria_empleo', categoria_empleo)
        .neq('id_empleo', id_empleo)
        .limit(3);

    if (error) throw new Error(error.message);
    return data;
};

// ── Stats generales para la landing ──────────────────────────────────────────
export const getStatsGenerales = async () => {
    const { data: empleos, error: e1 } = await supabase
        .schema('tebuscan')
        .from('empleos')
        .select('id_empleo', { count: 'exact' })
        .eq('estado_empleo', 'activo');
    if (e1) throw new Error(e1.message);

    const { data: empresas, error: e2 } = await supabase
        .schema('tebuscan')
        .from('empresa')
        .select('id_empresa', { count: 'exact' });
    if (e2) throw new Error(e2.message);

    const { data: candidatos, error: e3 } = await supabase
        .schema('tebuscan')
        .from('candidato')
        .select('id_candidato', { count: 'exact' });
    if (e3) throw new Error(e3.message);

    // Aplicaciones del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const { data: aplicaciones, error: e4 } = await supabase
        .schema('tebuscan')
        .from('aplicacion')
        .select('id_aplicacion', { count: 'exact' })
        .gte('fecha_aplicacion', inicioMes.toISOString());
    if (e4) throw new Error(e4.message);

    return {
        empleosActivos:       empleos?.length    || 0,
        empresasRegistradas:  empresas?.length   || 0,
        candidatosActivos:    candidatos?.length || 0,
        contratacionesMes:    aplicaciones?.length || 0
    };
};

// ── Categorías con conteo de empleos activos ──────────────────────────────────
export const getCategorias = async () => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('empleos')
        .select('categoria_empleo')
        .eq('estado_empleo', 'activo');

    if (error) throw new Error(error.message);

    // Agrupar y contar
    const conteo = {};
    data.forEach(e => {
        const cat = e.categoria_empleo || 'Otros';
        conteo[cat] = (conteo[cat] || 0) + 1;
    });

    return Object.entries(conteo)
        .map(([nombre, total]) => ({ nombre, total }))
        .sort((a, b) => b.total - a.total);
};

// ── Recursos para la carrera (landing — últimos 3) ────────────────────────────
export const getRecursosDestacados = async () => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('recursos')
        .select(`
            id_recurso,
            titulo_recurso,
            descripcion,
            fecha_recurso,
            duracion_recurso,
            likes,
            autor (
                nombre_autor,
                rol_autor
            ),
            categoria (
                nombre_categoria,
                tipo
            )
        `)
        .order('fecha_recurso', { ascending: false })
        .limit(3);

    if (error) throw new Error(error.message);
    return data;
};