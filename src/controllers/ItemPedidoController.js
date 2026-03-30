import PedidoModel from '../models/PedidoModel.js';
import ItemPedidoModel from '../models/ItemPedidoModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { clienteId, itens } = req.body;

        if (!clienteId) {
            return res.status(400).json({ error: 'O campo "clienteId" é obrigatório!' });
        }

        if (!itens || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ error: 'O pedido deve ter pelo menos um item!' });
        }
        const pedidoInstance = new PedidoModel({ clienteId: parseInt(clienteId) });
        const pedidoCriado = await pedidoInstance.criar();

        const promises = itens.map((item) => {
            const novoItem = new ItemPedidoModel({
                pedidoId: pedidoCriado.id,
                cardapioId: item.cardapioId,
                quantidade: item.quantidade,
                precoFixo: parseFloat(item.precoFixo),
            });
            return novoItem.criar();
        });

        await Promise.all(promises);

        return res.status(201).json({
            message: 'Pedido criado com sucesso!',
            id: pedidoCriado.id,
        });
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        return res.status(500).json({ error: 'Erro interno ao salvar o pedido.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await PedidoModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum pedido encontrado.' });
        }

        return res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return res.status(500).json({ error: 'Erro ao buscar pedidos.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const pedido = await PedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        return res.json({ data: pedido });
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        return res.status(500).json({ error: 'Erro ao buscar pedido.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const pedido = await PedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado para deletar.' });
        }

        const instancia = new PedidoModel({ id: pedido.id });
        await instancia.deletar();

        return res.json({ message: `O pedido #${id} foi deletado com sucesso!` });
    } catch (error) {
        console.error('Erro ao deletar pedido:', error);
        return res.status(500).json({ error: 'Erro ao deletar pedido.' });
    }
};
