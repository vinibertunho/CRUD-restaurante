import CardapioModel from '../models/CardapioModel.js';
import { gerarPdfCardapio, gerarPdfIndividual } from '../utils/pdfHelper.js';

const parseId = (value) => Number.parseInt(value, 10);

/**
 * GET /cardapio/pdf
 * @tags Relatórios PDF
 * @summary Gera relatório PDF geral do cardápio
 * @description Retorna um arquivo PDF contendo todos os itens do cardápio baseados nos filtros da query.
 * @param {string} categoria.query - Filtrar por categoria (ENTRADA, BEBIDA, etc)
 * @param {boolean} disponivel.query - Filtrar por disponibilidade
 * @return {object} 200 - Arquivo PDF retornado com sucesso - application/pdf
 * @return 404 - Nenhum item encontrado para gerar o relatório
 * @return 500 - Erro interno ao gerar o PDF
 */
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

/**
 * GET /cardapio/{id}/pdf
 * @tags Relatórios PDF
 * @summary Gera relatório PDF individual de item
 * @description Retorna um PDF técnico de um item específico do cardápio.
 * @param {integer} id.path.required - ID do item do cardápio
 * @return {object} 200 - Arquivo PDF retornado com sucesso - application/pdf
 * @return 400 - ID inválido ou item indisponível
 * @return 404 - Item não encontrado
 * @return 500 - Erro interno ao gerar o PDF
 */
export const gerarRelatorioIndividual = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const item = await CardapioModel.buscarPorId(id);

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
