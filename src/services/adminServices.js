import supabase from '../db.js';

export { loginUsuario, verificarCorreo } from './empresaServices.js';

export const getAdminByUsuario = async (id_usuario) => {
    const { data, error } = await supabase
        .schema('tebuscan')
        .from('administrador')
        .select('*')
        .eq('id_usuario', id_usuario)
        .single();

    if (error) throw new Error(error.message);

    return data;
};