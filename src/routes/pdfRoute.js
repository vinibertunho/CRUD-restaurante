import express from 'express';
const router = express.Router();

import { gerarRelatorioGeral, gerarRelatorioIndividual } from '../controllers/PdfController.js';

router.get('/pdf', gerarRelatorioGeral);
router.get('/:id/pdf', gerarRelatorioIndividual);

export default router;
