import express from 'express';
import * as controller from '../controllers/fotoController.js';
import { upload } from '../utils/fotoHelper.js';

const router = express.Router();

router.post('/:id/foto', upload.any(), controller.uploadFoto);
router.post('/:id/fotos', upload.any(), controller.uploadFoto);
router.get('/:id/foto', controller.verFoto);

export default router;
