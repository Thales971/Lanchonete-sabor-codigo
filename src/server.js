import express from 'express';
import 'dotenv/config';
import clienteRoutes from './routes/clienteRoute.js';
import produtoRoutes from './routes/produtoRoute.js';
import pedidoRoutes from './routes/pedidoRoute.js';
import itemPedidoRoutes from './routes/itemPedidoRoute.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🚀 API funcionando');
});

app.use('/api', clienteRoutes);
app.use('/api', produtoRoutes);
app.use('/api', pedidoRoutes);
app.use('/api', itemPedidoRoutes);

app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
