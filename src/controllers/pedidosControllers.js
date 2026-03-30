import PedidosModel from '../models/PedidosModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { quantidade, precoFixo: preco } = req.body;


        if (preco === undefined || preco === null) {
            return res.status(400).json({ error: 'O campo "preco" é obrigatório!' });
        }

        pedido.quantidade = parseInt(req.body.quantidade, 10)
        
        const pedido = new PedidosModel({ quantidade, preco: parseFloat(preco) });
        const data = await pedido.criar();


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

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const pedido = await PedidosModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado para atualizar.' });
        }


        if (req.body.quantidade !== undefined) {
           pedido.quantidade = parseFloat(req.body.quantidade, 10);
        }

        if (req.body.preco !== undefined) {
           pedido.preco = parseFloat(req.body.preco);
        }

        const data = await pedido.atualizar();

        return res.json({ message: `O registro "${data.quantidade}" foi atualizado com sucesso!`, data });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        return res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const pedido = await PedidosModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }

        await pedido.deletar();

        return res.json({ message: `O registro "${pedido.nome}" foi deletado com sucesso!`, deletado: pedido });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        return res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
