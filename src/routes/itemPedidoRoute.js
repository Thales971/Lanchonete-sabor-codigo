import express from 'express';
import * as controller from '../controllers/itemPedidoController.js';

const router = express.Router();

router.post('/pedidos/:id/itens', controller.criar);
router.delete('/pedidos/:id/itens/:itemId', controller.deletar);

export default router;
