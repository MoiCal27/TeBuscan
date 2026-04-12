import * as adminService from '../services/adminServices.js';

export const postLoginAdmin = async (req, res, next) => {
    try {
        const { correo_usuario, password_usuario } = req.body;

        const resultado = await adminService.loginUsuario(
            correo_usuario,
            password_usuario
        );

        if (!resultado || resultado.length === 0) {
            return res.status(401).json({
                error: 'Correo o contraseña incorrectos'
            });
        }

        const usuario = resultado[0];

        if (usuario.rol_usuario !== 'administrador') {
            return res.status(403).json({
                error: 'Esta cuenta no es de administrador'
            });
        }

        const admin = await adminService.getAdminByUsuario(
            usuario.id_usuario
        );

        req.session.usuario = usuario;
        req.session.admin = admin;

        res.status(200).json({
            message: 'Login admin exitoso',
            usuario,
            admin
        });

    } catch (err) {
        next(err);
    }
};

export const getSesion = (req, res) => {
    if (!req.session.candidato) {
        return res.status(401).json({ error: 'No hay sesión activa' });
    }
    res.json({ usuario: req.session.usuario, candidato: req.session.candidato });
};