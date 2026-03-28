import supabase from '../db.js';


export const verificarCorreo = async (correo_usuario) => {
    const { data } = await supabase
        .schema('tebuscan')
        .from('usuario')
        .select('id_usuario')
        .eq('correo_usuario', correo_usuario)
        .single();
    return data;
};

export const crearUsuario = async (correo_usuario, password_usuario) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('usuario')
        .insert([{ correo_usuario, password_usuario, rol_usuario: 'empresa' }])
        .select('id_usuario')
        .single();
    if (error) throw new Error(error.message);
    return data;
};


export const crearEmpresa = async (datosEmpresa) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('empresa')
        .insert([datosEmpresa])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};


export const loginUsuario = async (correo_usuario, password_usuario) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .rpc('login_usuario', { p_correo: correo_usuario, p_password: password_usuario });
    if (error) throw new Error(error.message);
    return data;
};


export const getEmpresaByUsuario = async (id_usuario) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('empresa')
        .select('*')
        .eq('id_usuario', id_usuario)
        .single();
    if (error) throw new Error(error.message);
    return data;
};

export const actualizarEmpresa = async (id_empresa, datos) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('empresa')
        .update({
            nombre_empresa: datos.nombre_empresa,
            nombre_contacto_empresa: datos.nombre_contacto_empresa,
            telefono_empresa: datos.telefono_empresa,
            ubicacion_empresa: datos.ubicacion_empresa,
            site_web_empresa: datos.site_web_empresa,
            descripcion_empresa: datos.descripcion_empresa,
            tamano_empresa: datos.tamano_empresa,
            industria_empresa: datos.industria_empresa,
            logo_empresa: datos.logo_empresa 
        })
        .eq('id_empresa', id_empresa)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};

export const getEmpleosEmpresa = async (id_empresa) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('empleos')
        .select('*')
        .eq('id_empresa', id_empresa)
        .order('creacion_empleo', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

export const crearEmpleo = async (datos) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('empleos')
        .insert([datos])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};

export const actualizarEmpleo = async (id_empleo, datos) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('empleos')
        .update(datos)
        .eq('id_empleo', id_empleo)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};