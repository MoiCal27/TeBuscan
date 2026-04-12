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
export default router;