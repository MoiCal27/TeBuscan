import { Router } from "express";
import * as generalController from "../controllers/generalController.js";

const router = Router();

router.get("/empleos-destacados", generalController.getEmpleosDestacados);
router.get("/empleos", generalController.getTodosLosEmpleos);
router.get("/empleos/:id", generalController.getEmpleoPorId);
router.get("/estadisticas", generalController.getEstadisticas);
router.get("/categorias", generalController.getCategorias);
router.get("/recursos-destacados", generalController.getRecursosDestacados);
router.get("/recursos/categorias", generalController.getCategoriasRecursos);
router.get("/recursos", generalController.getTodosLosRecursos);
router.get("/empresas/estadisticas", generalController.getEstadisticasEmpresas);
router.get("/empresas", generalController.getTodasLasEmpresas);
router.get("/empresas/:id", generalController.getEmpresaPorId);
router.post("/contacto", generalController.enviarMensajeContacto);
router.get("/contacto", generalController.getTodosLosMensajes);
router.patch("/contacto/:id/leido", generalController.marcarMensajeLeido);
router.delete("/contacto/:id", generalController.eliminarMensaje);

export default router;
