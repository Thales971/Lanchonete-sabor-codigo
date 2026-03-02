import express from "express";
import * as controller from "../controllers/produtoController.js";

const router = express.Router();

router.post("/produtos", controller.criar);
router.get("/produtos", controller.buscarTodos);
router.get("/produtos/:id", controller.buscarPorId);
router.put("/produtos/:id", controller.atualizar);
router.delete("/produtos:id", controller.deletar);

export default router;
