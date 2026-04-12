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


export const getCandidatos = async (req, res, next) => {
    try {
        if (!req.session.empresa) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const candidatos = await empresaService.getCandidatosEmpresa(req.session.empresa.id_empresa);
        res.json({ candidatos });
    } catch (err) {
        next(err);
    }
};

export const putActualizarEstadoAplicacion = async (req, res, next) => {
    try {
        if (!req.session.empresa) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const { id_aplicacion } = req.params;
        const { estado_aplicacion, notas_internas } = req.body;
        const evaluacion = await empresaService.actualizarEstadoAplicacion(
            id_aplicacion,
            estado_aplicacion,
            notas_internas
        );
        res.json({ message: 'Estado actualizado', evaluacion });
    } catch (err) {
        next(err);
    }
};

export const getEstadisticas = async (req, res, next) => {
    try {
        if (!req.session.empresa) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const estadisticas = await empresaService.getEstadisticasEmpresa(req.session.empresa.id_empresa);
        res.json({ estadisticas });
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
    } catch (err) {
        next(err);
    }
};

export const getEstadisticasForo = async (req, res, next) => {
    try {
        const estadisticas = await empresaService.getEstadisticasForo();
        res.json({ estadisticas });
    } catch (err) {
        next(err);
    }
};

export const postCrearForo = async (req, res, next) => {
    try {
        if (!req.session.usuario) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const datos = {
            ...req.body,
            id_usuario: req.session.usuario.id_usuario,
            estado_foro: 'activo',
            visualizaciones_foro: 0
        };
        const foro = await empresaService.crearForo(datos);
        res.status(201).json({ message: 'Foro creado', foro });
    } catch (err) {
        next(err);
    }
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
            estado_respuesta: 'activo'
        };
        const respuesta = await empresaService.crearRespuestaForo(datos);
        res.status(201).json({ message: 'Respuesta creada', respuesta });
    } catch (err) {
        next(err);
    }
};

export const putIncrementarVistas = async (req, res, next) => {
    try {
        const { id_foro } = req.params;
        
        console.log('Sesión usuario:', req.session.usuario);
        
        const { data: foro } = await supabase
            .schema('tebuscan')
            .from('foro')
            .select('id_usuario')
            .eq('id_foro', id_foro)
            .single();

        console.log('Foro dueño id_usuario:', foro?.id_usuario);

        if (!req.session.usuario) {
            return res.json({ message: 'Sin sesión, no se cuentan vistas' });
        }

        if (req.session.usuario.id_usuario === foro?.id_usuario) {
            return res.json({ message: 'Es el dueño, no se cuentan vistas' });
        }

        await empresaService.incrementarVistas(id_foro);
        res.json({ message: 'Vistas actualizadas' });
    } catch (err) {
        next(err);
    }
};

export const postSubirLogo = async (req, res, next) => {
    try {
        if (!req.session.empresa) {
            return res.status(401).json({ error: 'No hay sesión activa' });
        }
        const id_empresa = req.session.empresa.id_empresa;
        const empresa = await empresaService.actualizarEmpresa(id_empresa, {
            ...req.session.empresa,
            logo_empresa: req.body.url_logo
        });
        req.session.empresa = empresa;
        res.status(200).json({ message: 'Logo actualizado', logo_empresa: req.body.url_logo });
    } catch (err) {
        next(err);
    }
};