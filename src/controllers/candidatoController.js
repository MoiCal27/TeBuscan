import * as candidatoService from '../services/candidatoServices.js';
import * as empresaService from '../services/empresaServices.js';

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

export const getAlertas = async (req, res, next) => {
    try {
        if (!req.session.candidato) return res.status(401).json({ error: 'No hay sesión activa' });
        const alertas = await candidatoService.getAlertasCandidato(req.session.candidato.id_candidato);
        res.json({ alertas });
    } catch (err) { next(err); }
};

export const postCrearAlerta = async (req, res, next) => {
    try {
        if (!req.session.candidato) return res.status(401).json({ error: 'No hay sesión activa' });
        const datos = { ...req.body, id_candidato: req.session.candidato.id_candidato };
        const alerta = await candidatoService.crearAlerta(datos);
        res.status(201).json({ message: 'Alerta creada', alerta });
    } catch (err) { next(err); }
};

export const putActualizarAlerta = async (req, res, next) => {
    try {
        if (!req.session.candidato) return res.status(401).json({ error: 'No hay sesión activa' });
        const alerta = await candidatoService.actualizarAlerta(req.params.id_alerta, req.body);
        res.json({ message: 'Alerta actualizada', alerta });
    } catch (err) { next(err); }
};

export const deleteAlerta = async (req, res, next) => {
    try {
        if (!req.session.candidato) return res.status(401).json({ error: 'No hay sesión activa' });
        await candidatoService.eliminarAlerta(req.params.id_alerta);
        res.json({ message: 'Alerta eliminada' });
    } catch (err) { next(err); }
};

export const getNotificaciones = async (req, res, next) => {
    try {
        if (!req.session.candidato) return res.status(401).json({ error: 'No hay sesión activa' });
        const notificaciones = await candidatoService.getNotificacionesCandidato(req.session.candidato.id_candidato);
        res.json({ notificaciones });
    } catch (err) { next(err); }
};


export const putMarcarNotificacionesLeidas = async (req, res, next) => {
    try {
        if (!req.session.candidato) return res.status(401).json({ error: 'No hay sesión activa' });
        await candidatoService.marcarNotificacionesLeidas(req.session.candidato.id_candidato);
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

export const getValoraciones = async (req, res, next) => {
    try {
        if (!req.session.candidato) return res.status(401).json({ error: 'No hay sesión activa' });
        const valoraciones = await candidatoService.getValoracionesCandidato(req.session.candidato.id_candidato);
        res.json({ valoraciones });
    } catch (err) { next(err); }
};

export const postCrearValoracion = async (req, res, next) => {
    try {
        if (!req.session.candidato) return res.status(401).json({ error: 'No hay sesión activa' });
        const datos = { ...req.body, id_candidato: req.session.candidato.id_candidato };
        const valoracion = await candidatoService.crearValoracion(datos);
        res.status(201).json({ message: 'Valoración creada', valoracion });
    } catch (err) { next(err); }
};

export const putActualizarValoracion = async (req, res, next) => {
    try {
        if (!req.session.candidato) return res.status(401).json({ error: 'No hay sesión activa' });
        const valoracion = await candidatoService.actualizarValoracion(req.params.id_valoracion, req.body);
        res.json({ message: 'Valoración actualizada', valoracion });
    } catch (err) { next(err); }
};

export const deleteValoracion = async (req, res, next) => {
    try {
        if (!req.session.candidato) return res.status(401).json({ error: 'No hay sesión activa' });
        await candidatoService.eliminarValoracion(req.params.id_valoracion);
        res.json({ message: 'Valoración eliminada' });
    } catch (err) { next(err); }
};

export const likeRecurso = async (req, res, next) => {
    try {
        if (!req.session.candidato) return res.status(401).json({ error: 'No hay sesión activa' });
        const { id } = req.params;
        const { incremento } = req.body;
        await candidatoService.likeRecurso(id, incremento);
        res.json({ ok: true });
    } catch (err) { next(err); }
};

export const postAplicarEmpleo = async (req, res, next) => {
    try {
        if (!req.session.candidato) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const { id_empleo, mensaje_aplicacion } = req.body;
        if (!id_empleo) {
            return res.status(400).json({ error: 'El id del empleo es requerido' });
        }
        const aplicacion = await candidatoService.aplicarEmpleo(
            req.session.candidato.id_candidato,
            id_empleo,
            mensaje_aplicacion || ''
        );
        res.status(201).json({ message: 'Aplicación enviada exitosamente', aplicacion });
    } catch (err) {
        next(err);
    }
};

export const getForos = async (req, res, next) => {
    try {
        const { id_categoria } = req.query;
        let foros;
        if (id_categoria) {
            foros = await empresaService.getForosPorCategoria(id_categoria);
        } else {
            foros = await empresaService.getForosConRespuestas();
        }
        res.json({ foros });
    } catch (err) { next(err); }
};

export const getEstadisticasForo = async (req, res, next) => {
    try {
        const estadisticas = await empresaService.getEstadisticasForo();
        res.json({ estadisticas });
    } catch (err) { next(err); }
};

export const postCrearForo = async (req, res, next) => {
    try {
        if (!req.session.usuario) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const datos = {
            ...req.body,
            id_usuario: req.session.usuario.id_usuario,
            estado_foro: 'pendiente',
            visualizaciones_foro: 0
        };
        const foro = await empresaService.crearForo(datos);
        res.status(201).json({ message: 'Foro creado', foro });
    } catch (err) { next(err); }
};

export const postCrearRespuesta = async (req, res, next) => {
    try {
        if (!req.session.usuario) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const { id_foro } = req.params;
        const datos = {
            id_foro,
            contenido: req.body.contenido,
            id_usuario: req.session.usuario.id_usuario,
            estado_respuesta: 'pendiente'
        };
        const respuesta = await empresaService.crearRespuestaForo(datos);
        res.status(201).json({ message: 'Respuesta creada', respuesta });
    } catch (err) { next(err); }
};

export const putIncrementarVistas = async (req, res, next) => {
    try {
        const { id_foro } = req.params;
        if (!req.session.usuario) {
            return res.json({ message: 'Sin sesión, no se cuentan vistas' });
        }
        await empresaService.incrementarVistas(id_foro);
        res.json({ message: 'Vistas actualizadas' });
    } catch (err) { next(err); }
};