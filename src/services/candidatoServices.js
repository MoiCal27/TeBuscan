import supabase from '../db.js';

export { verificarCorreo,loginUsuario } from './empresaServices.js';

export const crearUsuarioCandidato = async (correo_usuario, password_usuario) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('usuario')
        .insert([{ correo_usuario, password_usuario, rol_usuario: 'candidato' }])
        .select('id_usuario')
        .single();
    if (error) throw new Error(error.message);
    return data;
};


export const crearCandidato = async (datos) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('candidato')
        .insert([datos])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};

export const getCandidatoByUsuario = async (id_usuario) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('candidato')
        .select('*')
        .eq('id_usuario', id_usuario)
        .single();
    if (error) throw new Error(error.message);
    return data;
};

export const actualizarCandidato = async (id_candidato, datos) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('candidato')
        .update({
            nombre_candidato: datos.nombre_candidato,
            apellido_candidato: datos.apellido_candidato,
            telefono_candidato: datos.telefono_candidato,
            ubicacion_candidato: datos.ubicacion_candidato,
            descripcion_candidato: datos.descripcion_candidato,
            curriculum: datos.curriculum
        })
        .eq('id_candidato', id_candidato)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};


export const getAplicacionesCandidato = async (id_candidato) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('aplicacion')
        .select(`
            id_aplicacion,
            fecha_aplicacion,
            mensaje_aplicacion,
            empleos (
                id_empleo,
                titulo_empleo,
                ubicacion_empleo,
                tipo_empleo,
                estado_empleo,
                empresa (
                    nombre_empresa,
                    logo_empresa
                )
            ),
            evaluacion_aplicacion (
                estado_aplicacion
            )
        `)
        .eq('id_candidato', id_candidato)
        .order('fecha_aplicacion', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

export const getEstadisticasCandidato = async (id_candidato) => {
    const { data: visitas, error: e1 } = await supabase
        .schema('tebuscan')
        .from('visitas')
        .select('id_visita', { count: 'exact' })
        .eq('id_candidato', id_candidato);
    if (e1) throw new Error(e1.message);

    const { data: aplicaciones, error: e2 } = await supabase
        .schema('tebuscan')
        .from('aplicacion')
        .select(`
            id_aplicacion,
            fecha_aplicacion,
            evaluacion_aplicacion (
                estado_aplicacion
            )
        `)
        .eq('id_candidato', id_candidato);
    if (e2) throw new Error(e2.message);

    const hoy = new Date();
    hoy.setDate(1); hoy.setHours(0, 0, 0, 0);

    const aplicacionesMes = aplicaciones?.filter(a =>
        new Date(a.fecha_aplicacion) >= hoy
    ).length || 0;

    const entrevistas = aplicaciones?.filter(a =>
        a.evaluacion_aplicacion?.[0]?.estado_aplicacion === 'Entrevista'
    ).length || 0;

    return {
        visitasPerfil: visitas?.length || 0,
        aplicacionesMes,
        entrevistas
    };
};

export const getAlertasCandidato = async (id_candidato) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('alerta')
        .select('*')
        .eq('id_candidato', id_candidato)
        .order('id_alerta', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

export const crearAlerta = async (datos) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('alerta')
        .insert([datos])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};

export const actualizarAlerta = async (id_alerta, datos) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('alerta')
        .update(datos)
        .eq('id_alerta', id_alerta)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};

export const eliminarAlerta = async (id_alerta) => {
    const { error } = await supabase
        .schema('tebuscan')
        .from('alerta')
        .delete()
        .eq('id_alerta', id_alerta);
    if (error) throw new Error(error.message);
    return true;
};

export const getNotificacionesCandidato = async (id_candidato) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('notificacion')
        .select('*')
        .eq('id_candidato', id_candidato)
        .order('fecha_notificacion', { ascending: false })
        .limit(20);
    if (error) throw new Error(error.message);
    return data;
};


export const marcarNotificacionesLeidas = async (id_candidato) => {
    const { error } = await supabase
        .schema('tebuscan')
        .from('notificacion')
        .update({ leida: true })
        .eq('id_candidato', id_candidato);
    if (error) throw new Error(error.message);
};

export const getValoracionesCandidato = async (id_candidato) => {
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
            empresa (
                id_empresa,
                nombre_empresa,
                logo_empresa
            )
        `)
        .eq('id_candidato', id_candidato)
        .order('fecha_valoracion', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

export const crearValoracion = async (datos) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('valoracion')
        .insert([datos])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};

export const actualizarValoracion = async (id_valoracion, datos) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('valoracion')
        .update(datos)
        .eq('id_valoracion', id_valoracion)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};

export const eliminarValoracion = async (id_valoracion) => {
    const { error } = await supabase
        .schema('tebuscan')
        .from('valoracion')
        .delete()
        .eq('id_valoracion', id_valoracion);
    if (error) throw new Error(error.message);
};

export const likeRecurso = async (id_recurso, incremento) => {
    const { data: recurso } = await supabase
        .schema('tebuscan')
        .from('recursos')
        .select('likes')
        .eq('id_recurso', id_recurso)
        .single();

    const { error } = await supabase
        .schema('tebuscan')
        .from('recursos')
        .update({ likes: (recurso.likes || 0) + incremento })
        .eq('id_recurso', id_recurso);

    if (error) throw new Error(error.message);
};

export const aplicarEmpleo = async (id_candidato, id_empleo, mensaje_aplicacion) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('aplicacion')
        .insert([{ id_candidato, id_empleo, mensaje_aplicacion }])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};