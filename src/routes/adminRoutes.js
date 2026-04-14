import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { validarLoginEmpresa as validarLoginAdmin } from '../middleware/empresaValidators.js';

const router = Router();

router.post('/login', validarLoginAdmin, adminController.postLoginAdmin);
router.get('/stats', adminController.getResumenPlataforma);
router.get('/usuarios', adminController.getUsuarios);
router.put('/usuarios/:id_usuario/estado', adminController.putEstadoUsuario);
router.get('/empresas', adminController.getEmpresas);
router.put('/empresas/:id_empresa/estado', adminController.putEstadoEmpresa);
router.get('/vacantes', adminController.getVacantes);
router.put('/vacantes/:id_empleo/estado', adminController.putEstadoEmpleo);
router.get('/foros', adminController.getForos);
router.put('/foros/:id_foro/estado', adminController.putEstadoForo);
router.delete('/foros/:id_foro', adminController.deleteForo);
router.put('/respuestas/:id_respuesta/estado', adminController.putEstadoRespuesta);
router.delete('/respuestas/:id_respuesta', adminController.deleteRespuesta);
router.get('/estadisticas', adminController.getEstadisticas);
export default router;