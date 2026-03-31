import CardapioModel from '../models/CardapioModel.js';
import { gerarPdfCardapio, gerarPdfIndividual } from '../utils/pdfHelper.js';

export const gerarRelatorioGeral = async (req, res) => {
    try {
        const itens = await CardapioModel.buscarTodos(req.query);

        if (!itens || itens.length === 0) {
            return res
                .status(404)
                .json({ error: 'Nenhum item encontrado para gerar o relatório.' });
        }

        const pdf = await gerarPdfCardapio(itens);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename=cardapio-geral.pdf',
        });

        return res.send(pdf);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno ao gerar PDF geral.' });
    }
};

export const gerarRelatorioIndividual = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const item = await CardapioModel.buscarPorId(parseInt(id));

        if (!item) {
            return res.status(404).json({ error: 'Registro não encontrado.' });
        }

        if (!item.disponivel) {
            return res.status(400).json({ error: 'Não é permitido utilizar item indisponível.' });
        }

        const pdf = await gerarPdfIndividual(item);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename=item-${id}.pdf`,
        });

        return res.send(pdf);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro interno ao gerar PDF individual.' });
    }
};
