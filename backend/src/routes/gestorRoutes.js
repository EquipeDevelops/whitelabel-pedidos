import express from "express";
import { autenticarToken } from "../middleware/authMiddleware.js";
import {
  listarGestores,
  buscarGestorPorId,
  criarGestor,
  atualizarGestor,
  deletarGestor,
  loginGestor,
  alternarStatusGestor,
  resetarSenhaGestor,
  getGestorStats,
  bulkUpdateStatus,
  bulkDelete,
  getGestorReportData,
} from "../controllers/gestorController.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

router.post("/gestor/login", loginGestor);

router.use(autenticarToken);

router.post("/gestor/bulk/status", bulkUpdateStatus);
router.post("/gestor/bulk/delete", bulkDelete);
router.get("/gestor/stats", getGestorStats);
router.get("/gestor", listarGestores);
router.get("/gestor/:id", buscarGestorPorId);
router.post("/gestor", upload.single("avatar"), criarGestor);
router.put("/gestor/:id", upload.single("avatar"), atualizarGestor);
router.delete("/gestor/:id", deletarGestor);
router.patch("/gestor/:id/status", alternarStatusGestor);
router.post("/gestor/:id/reset-senha", resetarSenhaGestor);
router.get("/gestor/:id/report", getGestorReportData);
router.get("/gestor/:id", buscarGestorPorId);

export default router;
