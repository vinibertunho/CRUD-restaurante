import express from 'express';
import 'dotenv/config';
import expressJSDocSwagger from 'express-jsdoc-swagger';
import cardapioRoute from './routes/cardapioRoutes.js';
import itemPedidoRoute from './routes/itemPedidoRoute.js';
import fotoRoute from './routes/fotoRoute.js';
import pedidosRoutes from './routes/pedidosRoutes.js';
import clienteRoute from './routes/clienteRoute.js';
import pdfRoute from './routes/pdfRoute.js';

const app = express();
app.use(express.json());

const options = {
    info: {
        version: '1.0.0',
        title: 'API Restaurante',
        description: 'Documentação da API de Gerenciamento de Restaurante',
    },
    servers: [{ url: 'http://localhost:3000' }],
    baseDir: process.cwd(),
    filesPattern:
        './src/controllers/{cardapioController,clienteController,pedidosControllers,ItemPedidoController}.js',
    swaggerUIPath: '/api-docs',
    exposeSwaggerUI: true,
    notRequiredAsNullable: false,
};

expressJSDocSwagger(app)(options);

const PORT = process.env.PORT || 3000;

app.use('/cardapio', cardapioRoute);
app.use('/cardapio', fotoRoute);
app.use('/cardapio', pdfRoute);
app.use('/api/clientes', clienteRoute);
app.use('/pedidos', pedidosRoutes);
app.use('/itemPedidos', itemPedidoRoute);
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => res.send('🚀 API funcionando'));

app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

app.listen(PORT, () => {
    console.log(`🚀 Servidor: http://localhost:${PORT}`);
    console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
});
