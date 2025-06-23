import express from "express";
import {
  listarGestores,
  buscarGestorPorId,
  criarGestor,
  atualizarGestor,
  deletarGestor,
  loginGestor,
  alternarStatusGestor,
  resetarSenhaGestor,
} from "../controllers/gestorController.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

router.get("/gestor", listarGestores);
router.get("/gestor/:id", buscarGestorPorId);
router.post("/gestor", upload.single("avatar"), criarGestor);
router.post("/gestor/login", loginGestor);

router.put("/gestor/:id", upload.single("avatar"), atualizarGestor);

router.delete("/gestor/:id", deletarGestor);

router.patch("/gestor/:id/status", alternarStatusGestor);
router.post("/gestor/:id/reset-senha", resetarSenhaGestor);

export default router;
