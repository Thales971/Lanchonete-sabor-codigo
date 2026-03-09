import express from 'express';
import * as controller from '../controllers/clienteController.js';
import autenticarApiKey from '../utils/apiKey.js';

const router = express.Router();

router.post('/clientes', autenticarApiKey, controller.criar);
router.get('/clientes', autenticarApiKey, controller.buscarTodos);
router.get('/clientes/:id', autenticarApiKey, controller.buscarPorId);
router.get('/clientes/:id/clima', autenticarApiKey, controller.buscarClima);
router.put('/clientes/:id', autenticarApiKey, controller.atualizar);
router.delete('/clientes/:id', autenticarApiKey, controller.deletar);

export default router;
