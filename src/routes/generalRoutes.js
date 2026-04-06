import { Router } from 'express';
import * as generalController from '../controllers/generalController.js';

const router = Router();

// Rutas públicas — no requieren sesión
router.get('/empleos-destacados',   generalController.getEmpleosDestacados);
router.get('/empleos',              generalController.getTodosLosEmpleos);
router.get('/empleos/:id',          generalController.getEmpleoPorId);
router.get('/stats',                generalController.getStats);
router.get('/categorias',           generalController.getCategorias);
router.get('/recursos-destacados',  generalController.getRecursosDestacados);

export default router;