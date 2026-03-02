import express from 'express';
import * as controller from '../controllers/pedidoController.js';

const router = express.Router();

router.post('/pedidos', controller.criar);
router.get('/pedidos', controller.buscarTodos);
router.get('/pedidos/:id', controller.buscarPorId);
router.put('/pedidos/:id', controller.atualizar);
router.delete('/pedidos/:id', controller.deletar);

export default router;
