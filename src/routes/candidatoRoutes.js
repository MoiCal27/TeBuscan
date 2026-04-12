import { Router } from 'express';
import * as candidatoController from '../controllers/candidatoController.js';
import { validarRegistroCandidato, validarLoginCandidato } from '../middleware/candidatoValidators.js';

const router = Router();

router.post('/registro', validarRegistroCandidato, candidatoController.postRegistrarCandidato);
router.post('/login', validarLoginCandidato, candidatoController.postLoginCandidato);
router.get('/sesion', candidatoController.getSesion);
router.put('/actualizar', candidatoController.putActualizarCandidato);
router.get('/aplicaciones', candidatoController.getAplicaciones);
router.get('/estadisticas', candidatoController.getEstadisticas);
router.post('/cv', candidatoController.postSubirCV);
router.get('/alertas', candidatoController.getAlertas);
router.post('/alertas', candidatoController.postCrearAlerta);
router.put('/alertas/:id_alerta', candidatoController.putActualizarAlerta);
router.delete('/alertas/:id_alerta', candidatoController.deleteAlerta);
router.get('/notificaciones', candidatoController.getNotificaciones);
router.put('/notificaciones/leer', candidatoController.putMarcarNotificacionesLeidas);
router.get('/valoraciones', candidatoController.getValoraciones);
router.post('/valoraciones', candidatoController.postCrearValoracion);
router.put('/valoraciones/:id_valoracion', candidatoController.putActualizarValoracion);
router.delete('/valoraciones/:id_valoracion', candidatoController.deleteValoracion);
router.put('/recursos/:id/like', candidatoController.likeRecurso);
export default router;