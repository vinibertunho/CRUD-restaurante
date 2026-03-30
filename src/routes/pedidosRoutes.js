import express from 'express';
import * as controller from '../controllers/pedidosControllers.js';

const router = express.Router();

router.post('/pedidos', controller.criar);
router.get('/pedidos', controller.buscarTodos);
router.get('/pedido/:id', controller.buscarPorId);
router.put('/pedido/:id', controller.atualizar);
router.delete('/pedido/:id', controller.deletar);

export default router;
