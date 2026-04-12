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