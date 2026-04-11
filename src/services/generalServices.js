import supabase from '../db.js';

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

export const getEstadisticasGenerales = async () => {
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

export const getCategorias = async () => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('empleos')
        .select('categoria_empleo')
        .eq('estado_empleo', 'activo');

    if (error) throw new Error(error.message);

    const conteo = {};
    data.forEach(e => {
        const cat = e.categoria_empleo || 'Otros';
        conteo[cat] = (conteo[cat] || 0) + 1;
    });

    return Object.entries(conteo)
        .map(([nombre, total]) => ({ nombre, total }))
        .sort((a, b) => b.total - a.total);
};

export const getTodosLosRecursos = async ({ busqueda, categoria } = {}) => {
    let query = supabase
        .schema('tebuscan')
        .from('recursos')
        .select(`
            id_recurso,
            titulo_recurso,
            descripcion,
            contenido,
            fecha_recurso,
            duracion_recurso,
            likes,
            autor (
                nombre_autor,
                rol_autor
            ),
            categoria (
                id_categoria,
                nombre_categoria,
                tipo
            )
        `)
        .order('fecha_recurso', { ascending: false });

    if (busqueda)  query = query.ilike('titulo_recurso', `%${busqueda}%`);
    if (categoria) query = query.eq('id_categoria', categoria);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

export const getCategoriasRecursos = async () => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('recursos')
        .select(`
            id_recurso,
            categoria (
                id_categoria,
                nombre_categoria,
                tipo
            )
        `);

    if (error) throw new Error(error.message);

    const conteo = {};
    data.forEach(r => {
        if (!r.categoria) return;
        const key   = r.categoria.id_categoria;
        const nombre = r.categoria.nombre_categoria;
        const tipo   = r.categoria.tipo;
        if (!conteo[key]) conteo[key] = { id_categoria: key, nombre_categoria: nombre, tipo, total: 0 };
        conteo[key].total++;
    });

    return Object.values(conteo).sort((a, b) => b.total - a.total);
};
 
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


export const getTodasLasEmpresas = async ({ busqueda, industria, tamano } = {}) => {
    let query = supabase
        .schema('tebuscan')
        .from('empresa')
        .select(`
            id_empresa,
            nombre_empresa,
            ubicacion_empresa,
            industria_empresa,
            logo_empresa,
            site_web_empresa,
            tamano_empresa,
            descripcion_empresa,
            empleos (
                id_empleo,
                estado_empleo
            )
        `)
        .order('nombre_empresa', { ascending: true });
 
    if (busqueda) query = query.ilike('nombre_empresa', `%${busqueda}%`);
    if (industria) query = query.eq('industria_empresa', industria);
    if (tamano)    query = query.eq('tamano_empresa', tamano);
 
    const { data, error } = await query;
    if (error) throw new Error(error.message);
 
    return data.map(emp => ({
        ...emp,
        empleos_activos: (emp.empleos || []).filter(e => e.estado_empleo === 'activo').length,
        empleos: undefined
    }));
};
 
export const getEstadisticasEmpresas = async () => {
    const { data: empresas, error: e1 } = await supabase
        .schema('tebuscan')
        .from('empresa')
        .select('id_empresa');
    if (e1) throw new Error(e1.message);

    const { data: empleos, error: e2 } = await supabase
        .schema('tebuscan')
        .from('empleos')
        .select('id_empleo')
        .eq('estado_empleo', 'activo');
    if (e2) throw new Error(e2.message);
 
    const { data: industrias, error: e3 } = await supabase
        .schema('tebuscan')
        .from('empresa')
        .select('industria_empresa');
    if (e3) throw new Error(e3.message);
 
    const industriasUnicas = new Set(
        industrias.map(e => e.industria_empresa).filter(Boolean)
    );
 
    return {
        totalEmpresas:   empresas?.length        || 0,
        empleosActivos:  empleos?.length         || 0,
        totalIndustrias: industriasUnicas.size   || 0
    };
};

export const getEmpresaPorId = async (id_empresa) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('empresa')
        .select(`
            id_empresa,
            nombre_empresa,
            ubicacion_empresa,
            industria_empresa,
            logo_empresa,
            site_web_empresa,
            tamano_empresa,
            descripcion_empresa
        `)
        .eq('id_empresa', id_empresa)
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const getEmpleosPorEmpresa = async (id_empresa) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('empleos')
        .select(`
            id_empleo,
            titulo_empleo,
            ubicacion_empleo,
            tipo_empleo,
            tipo_contrato_empleo,
            salario_min_empleo,
            salario_max_empleo,
            nivel_experiencia_empleo,
            descripcion_empleo,
            creacion_empleo
        `)
        .eq('id_empresa', id_empresa)
        .eq('estado_empleo', 'activo')
        .order('creacion_empleo', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
};

export const getValoracionesPorEmpresa = async (id_empresa) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('valoracion')
        .select(`
            id_valoracion,
            puesto,
            periodo_trabajo,
            calificacion,
            comentario,
            fecha_valoracion,
            candidato (
                nombre_candidato,
                apellido_candidato
            )
        `)
        .eq('id_empresa', id_empresa)
        .order('fecha_valoracion', { ascending: false });

    if (error) throw new Error(error.message);

    const total = data?.length || 0;
    const promedio = total > 0
        ? (data.reduce((acc, v) => acc + Number(v.calificacion), 0) / total).toFixed(1)
        : 0;

    const distribucion = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.forEach(v => {
        const estrella = Math.round(Number(v.calificacion));
        if (distribucion[estrella] !== undefined) distribucion[estrella]++;
    });

    return { valoraciones: data, promedio, total, distribucion };
};