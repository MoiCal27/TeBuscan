import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { validarLoginEmpresa as validarLoginAdmin } from '../middleware/empresaValidators.js';

const router = Router();

router.post('/login', validarLoginAdmin, adminController.postLoginAdmin);

export default router;