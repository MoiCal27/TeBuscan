import * as empresaService from '../services/empresaServices.js';
import supabase from '../db.js';

export const postRegistrarEmpresa = async (req, res, next) => {
    try {

        const {
            correo_usuario,
            password_usuario,
            nombre_empresa,
            nombre_contacto_empresa,
            telefono_empresa,
            ubicacion_empresa
        } = req.body;

        const existe = await empresaService.verificarCorreo(correo_usuario);

        if (existe) {
            return res.status(400).json({
                error: 'El correo ya está registrado'
            });
        }

        const nuevoUsuario = await empresaService.crearUsuario(
            correo_usuario,
            password_usuario
        );

        const nuevaEmpresa = await empresaService.crearEmpresa({
            nombre_empresa,
            nombre_contacto_empresa,
            telefono_empresa,
            ubicacion_empresa,
            id_usuario: nuevoUsuario.id_usuario
        });

        res.status(201).json({
            message: 'Empresa registrada exitosamente',
            empresa: nuevaEmpresa
        });

    } catch (err) {
        next(err);
    }
};


export const postLoginEmpresa = async (req, res, next) => {
    try {
        const { correo_usuario, password_usuario } = req.body;

        const resultado = await empresaService.loginUsuario(correo_usuario, password_usuario);

        if (!resultado || resultado.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const usuario = resultado[0];

        if (usuario.rol_usuario !== 'empresa') {
            return res.status(403).json({ error: 'Esta cuenta no es de empresa' });
        }

        const empresa = await empresaService.getEmpresaByUsuario(usuario.id_usuario);

        req.session.usuario = usuario;
        req.session.empresa = empresa;

        res.status(200).json({
            message: 'Login exitoso',
            usuario,
            empresa
        });

    } catch (err) {
        next(err);
    }
};


export const putActualizarEmpresa = async (req, res, next) => {
    try {
        if (!req.session.empresa) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }

        const id_empresa = req.session.empresa.id_empresa;
        const empresa = await empresaService.actualizarEmpresa(id_empresa, req.body);
        
        req.session.empresa = empresa;
        
        res.status(200).json({ message: 'Empresa actualizada', empresa });

    } catch (err) {
        next(err);
    }
};

export const getSesion = (req, res) => {
    if (!req.session.empresa) {
        return res.status(401).json({ error: 'No hay sesión activa' });
    }
    res.json({
        usuario: req.session.usuario,
        empresa: req.session.empresa
    });
};

export const getEmpleos = async (req, res, next) => {
    try {
        if (!req.session.empresa) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const empleos = await empresaService.getEmpleosEmpresa(req.session.empresa.id_empresa);
        res.json({ empleos });
    } catch (err) {
        next(err);
    }
};

export const postCrearEmpleo = async (req, res, next) => {
    try {
        if (!req.session.empresa) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const datos = {
            ...req.body,
            id_empresa: req.session.empresa.id_empresa,
            estado_empleo: 'activo'
        };
        const empleo = await empresaService.crearEmpleo(datos);
        res.status(201).json({ message: 'Empleo creado', empleo });
    } catch (err) {
        next(err);
    }
};

export const putActualizarEmpleo = async (req, res, next) => {
    try {
        if (!req.session.empresa) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const { id_empleo } = req.params;
        const empleo = await empresaService.actualizarEmpleo(id_empleo, req.body);
        res.json({ message: 'Empleo actualizado', empleo });
    } catch (err) {
        next(err);
    }
};