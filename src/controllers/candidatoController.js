import * as candidatoService from '../services/candidatoServices.js';


export const postRegistrarCandidato = async (req, res, next) => {
    try {
        const { correo_usuario, password_usuario, nombre_candidato,
                apellido_candidato, telefono_candidato } = req.body;

        const existe = await candidatoService.verificarCorreo(correo_usuario);
        if (existe) return res.status(400).json({ error: 'El correo ya está registrado' });

        const nuevoUsuario = await candidatoService.crearUsuarioCandidato(correo_usuario, password_usuario);

        const nuevoCandidato = await candidatoService.crearCandidato({
            nombre_candidato,
            apellido_candidato,
            telefono_candidato,
            id_usuario: nuevoUsuario.id_usuario
        });

        res.status(201).json({ message: 'Candidato registrado exitosamente', candidato: nuevoCandidato });
    } catch (err) {
        next(err);
    }
};


export const postLoginCandidato = async (req, res, next) => {
    try {
        const { correo_usuario, password_usuario } = req.body;

        const resultado = await candidatoService.loginUsuario(correo_usuario, password_usuario);

        if (!resultado || resultado.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const usuario = resultado[0];

        if (usuario.rol_usuario !== 'candidato') {
            return res.status(403).json({ error: 'Esta cuenta no es de candidato' });
        }

        const candidato = await candidatoService.getCandidatoByUsuario(usuario.id_usuario);

        req.session.usuario = usuario;
        req.session.candidato = candidato;

        res.status(200).json({ message: 'Login exitoso', usuario, candidato });
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


export const putActualizarCandidato = async (req, res, next) => {
    try {
        if (!req.session.candidato) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const id_candidato = req.session.candidato.id_candidato;
        const candidato = await candidatoService.actualizarCandidato(id_candidato, req.body);
        req.session.candidato = candidato;
        res.status(200).json({ message: 'Perfil actualizado', candidato });
    } catch (err) {
        next(err);
    }
};

export const getAplicaciones = async (req, res, next) => {
    try {
        if (!req.session.candidato) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const aplicaciones = await candidatoService.getAplicacionesCandidato(
            req.session.candidato.id_candidato
        );
        res.json({ aplicaciones });
    } catch (err) {
        next(err);
    }
};

export const getEstadisticas = async (req, res, next) => {
    try {
        if (!req.session.candidato) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const estadisticas = await candidatoService.getEstadisticasCandidato(
            req.session.candidato.id_candidato
        );
        res.json({ estadisticas });
    } catch (err) {
        next(err);
    }
};

export const postSubirCV = async (req, res, next) => {
    try {
        if (!req.session.candidato) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const id_candidato = req.session.candidato.id_candidato;
        const candidato = await candidatoService.actualizarCandidato(id_candidato, {
            ...req.session.candidato,
            curriculum: req.body.url_cv
        });
        req.session.candidato = candidato;
        res.status(200).json({ message: 'CV actualizado', curriculum: req.body.url_cv });
    } catch (err) {
        next(err);
    }
};