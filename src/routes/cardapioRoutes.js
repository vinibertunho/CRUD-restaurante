import express from 'express';
import * as controller from '../controllers/cardapioController.js';

const router = express.Router();

router.post('/cardapio', controller.criar);
router.get('/cardapio', controller.buscarTodos);
router.get('/cardapio/:id', controller.buscarPorId);
router.put('/cardapio/:id', controller.atualizar);
router.delete('/cardapio/:id', controller.deletar);

export default router;
