import express from 'express';
import ApiKey from '../utils/apiKey.js';
import * as ClienteController from '../controllers/clienteController.js';

const router = express.Router();

router.use(ApiKey);

router.post('/', ClienteController.criar);
router.get('/', ClienteController.buscarTodos);
router.get('/:id', ClienteController.buscarPorId);
router.put('/:id', ClienteController.atualizar);
router.delete('/:id', ClienteController.deletar);

export default router;
