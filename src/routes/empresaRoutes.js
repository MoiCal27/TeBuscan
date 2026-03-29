import { Router } from 'express';
import * as empresaController from '../controllers/empresaController.js';
import {
  validarRegistroEmpresa,
  validarLoginEmpresa
} from '../middleware/empresaValidators.js';

const router = Router();

router.post('/registro',validarRegistroEmpresa, empresaController.postRegistrarEmpresa);
router.post('/login',validarLoginEmpresa, empresaController.postLoginEmpresa);
router.get('/sesion', empresaController.getSesion);
router.put('/actualizar', empresaController.putActualizarEmpresa);
router.get('/empleos', empresaController.getEmpleos);
router.post('/empleos', empresaController.postCrearEmpleo);
router.put('/empleos/:id_empleo', empresaController.putActualizarEmpleo);
router.get('/candidatos', empresaController.getCandidatos);
router.put('/candidatos/:id_aplicacion/estado', empresaController.putActualizarEstadoAplicacion);
router.get('/estadisticas', empresaController.getEstadisticas);
router.get('/foros', empresaController.getForos);
router.get('/foros/estadisticas', empresaController.getEstadisticasForo);
router.post('/foros', empresaController.postCrearForo);
router.post('/foros/:id_foro/respuestas', empresaController.postCrearRespuesta);
router.put('/foros/:id_foro/vistas', empresaController.putIncrementarVistas);

export default router;

