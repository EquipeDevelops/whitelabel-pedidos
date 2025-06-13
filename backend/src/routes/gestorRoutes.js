import express from "express";
import {
  listarGestores,
  buscarGestorPorId,
  criarGestor,
  atualizarGestor,
  deletarGestor,
} from "../controllers/gestorController.js";

const router = express.Router();

// aqui são as rotas do crud de gestor.

router.get("/gestor", listarGestores);
router.get("/gestor/:id", buscarGestorPorId);
router.post("/gestor", criarGestor);
router.put("/gestor/:id", atualizarGestor);
router.delete("/gestor/:id", deletarGestor);

export default router;
