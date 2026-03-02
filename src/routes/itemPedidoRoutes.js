import express from 'express';
import * as controller from '../controllers/itemPedidoController.js';

const router = express.Router();

router.post('/itempedidos', controller.criar);
router.get('/itempedidos', controller.buscarTodos);
router.get('/itempedidos/:id', controller.buscarPorId);
router.put('/itempedidos/:id', controller.atualizar);
router.delete('/itempedidos/:id', controller.deletar);

export default router;
