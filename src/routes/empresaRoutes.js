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

export default router;

