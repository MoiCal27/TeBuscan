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

export const getResumenPlataforma = async (req, res, next) => {
    try {
        const stats = await adminService.getConteoPlataforma();
        res.json({ stats });
    } catch (err) { next(err); }
};

export const getUsuarios = async (req, res, next) => {
    try {
        const usuarios = await adminService.getUsuarios();
        res.json({ usuarios });
    } catch (err) { next(err); }
};

export const putEstadoUsuario = async (req, res, next) => {
    try {
        const { id_usuario } = req.params;
        const { estado } = req.body;
        await adminService.actualizarEstadoUsuario(id_usuario, estado);
        res.json({ ok: true });
    } catch (err) { next(err); }
};

export const getEmpresas = async (req, res, next) => {
    try {
        const empresas = await adminService.getEmpresas();
        res.json({ empresas });
    } catch (err) { next(err); }
};

export const putEstadoEmpresa = async (req, res, next) => {
    try {
        const { id_empresa } = req.params;
        const { estado } = req.body;
        await adminService.actualizarEstadoEmpresa(id_empresa, estado);
        res.json({ ok: true });
    } catch (err) { next(err); }
};

export const getVacantes = async (req, res, next) => {
    try {
        const vacantes = await adminService.getVacantes();
        res.json({ vacantes });
    } catch (err) { next(err); }
};

export const putEstadoEmpleo = async (req, res, next) => {
    try {
        const { id_empleo } = req.params;
        const { estado } = req.body;
        await adminService.actualizarEstadoEmpleo(id_empleo, estado);
        res.json({ ok: true });
    } catch (err) { next(err); }
};