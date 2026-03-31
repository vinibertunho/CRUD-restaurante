import express from 'express';
import 'dotenv/config';
import cardapioRoute from './routes/cardapioRoutes.js';
import itemPedidoRoute from './routes/itemPedidoRoute.js';
import fotoRoute from './routes/fotoRoute.js';
import pedidosRoutes from './routes/pedidosRoutes.js';
import clienteRoute from './routes/clienteRoute.js';
import pdfRoute from './routes/pdfRoute.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🚀 API funcionando');
});

// Rotas
app.use('/cardapio', cardapioRoute);
app.use('/cardapio', fotoRoute);
app.use('/cardapio', pdfRoute);

app.use('/api/clientes', clienteRoute);

app.use('/pedidos', pedidosRoutes);

app.use('/itemPedidos', itemPedidoRoute);

app.use('/uploads', express.static('uploads'));

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
