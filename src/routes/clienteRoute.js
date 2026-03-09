import express from 'express';
import * as controller from '../controllers/clienteController.js';
import autenticarApiKey from '../utils/apiKey.js';

const router = express.Router();

router.use(autenticarApiKey);

router.post('/', controller.criar);
router.get('/', controller.buscarTodos);
router.get('/:id', controller.buscarPorId);
router.get('/:id/clima', controller.buscarClima);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);

export default router;
