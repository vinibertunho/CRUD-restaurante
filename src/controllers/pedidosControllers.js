import PedidosModel from '../models/PedidosModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { clienteId, estado } = req.body;

        if (!clienteId) {
            return res
                .status(400)
                .json({ error: 'O campo "clienteId" é obrigatório para criar um pedido!' });
        }

        const novoPedido = new PedidosModel({
            clienteId: parseInt(clienteId, 10),
            estado: estado !== undefined ? estado : true,
        });

        const data = await novoPedido.criar();

        return res.status(201).json({ message: 'Pedido criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);
        return res.status(500).json({ error: 'Erro interno ao salvar o pedido.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const pedidos = await PedidosModel.buscarTodos(req.query);
        if (!pedidos || pedidos.length === 0) {
            return res.status(200).json({ message: 'Nenhum pedido encontrado.' });
        }
        return res.json(pedidos);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        return res.status(500).json({ error: 'Erro ao buscar pedidos.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }
        const pedido = await PedidosModel.buscarPorId(parseInt(id));
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }
        return res.json({ data: pedido });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        return res.status(500).json({ error: 'Erro ao buscar pedido.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const pedido = await PedidosModel.buscarPorId(parseInt(id));
        if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });

        if (req.body.estado !== undefined) {
            pedido.estado = req.body.estado === true || req.body.estado === 'true';
        }

        const data = await pedido.atualizar();
        return res.json({ message: 'Pedido atualizado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        return res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const pedido = await PedidosModel.buscarPorId(parseInt(id));
        if (!pedido)
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });

        await pedido.deletar();
        return res.json({ message: `O pedido #${id} foi deletado com sucesso!` });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        return res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
