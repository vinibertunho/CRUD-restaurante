import PedidosModel from '../models/PedidosModel.js';

const parseId = (value) => Number.parseInt(value, 10);

/**
 * @typedef {object} ReqBodyPedidoSimples
 * @property {integer} clienteId.required - ID do cliente que está realizando o pedido
 * @property {boolean} estado - Estado do pedido (ativo/finalizado) - default: true
 */

/**
 * POST /pedidos
 * @tags Pedidos
 * @summary Cria um novo pedido
 * @description Cadastra um novo pedido com clienteId e estado opcional.
 * @param { ReqBodyPedidoSimples } request.body.required
 * @return 201 - Pedido criado com sucesso
 * @return 400 - Erro de validação
 * @return 500 - Erro interno do servidor
 */
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
            estado: estado !== undefined ? estado === true || estado === 'true' : true,
        });

        const data = await novoPedido.criar();

        return res.status(201).json({ message: 'Pedido criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);
        return res.status(500).json({ error: 'Erro interno ao salvar o pedido.' });
    }
};

/**
 * GET /pedidos
 * @tags Pedidos
 * @summary Busca todos os pedidos
 * @description Retorna a lista de pedidos, com opção de filtro por clienteId via query string.
 * @param {integer} clienteId.query - Filtrar pedidos por ID do cliente
 * @return 200 - Lista de pedidos encontrados
 * @return 500 - Erro interno do servidor
 */
export const buscarTodos = async (req, res) => {
    try {
        const pedidos = await PedidosModel.buscarTodos(req.query);
        if (!pedidos || pedidos.length === 0) {
            return res.status(200).json({ message: 'Nenhum pedido encontrado.' });
        }
        return res.json(pedidos);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar pedidos.' });
    }
};

/**
 * GET /pedidos/{id}
 * @tags Pedidos
 * @summary Busca um pedido por ID
 * @param {integer} id.path.required - ID do pedido
 * @return 200 - Pedido encontrado com sucesso
 * @return 400 - ID inválido
 * @return 404 - Pedido não encontrado
 */
export const buscarPorId = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const pedido = await PedidosModel.buscarPorId(id);
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }
        return res.json({ data: pedido });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar pedido.' });
    }
};

/**
 * PUT /pedidos/{id}
 * @tags Pedidos
 * @summary Atualiza o estado de um pedido
 * @param {integer} id.path.required - ID do pedido
 * @param {boolean} estado.formData.required - Novo estado do pedido
 * @return 200 - Pedido atualizado com sucesso
 * @return 404 - Pedido não encontrado
 */
export const atualizar = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const pedido = await PedidosModel.buscarPorId(id);
        if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });

        if (req.body.estado !== undefined) {
            pedido.estado = req.body.estado === true || req.body.estado === 'true';
        }

        const data = await pedido.atualizar();
        return res.json({ message: 'Pedido atualizado com sucesso!', data });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
};

/**
 * DELETE /pedidos/{id}
 * @tags Pedidos
 * @summary Deleta um pedido por ID
 * @param {integer} id.path.required - ID do pedido
 * @return 200 - Pedido deletado com sucesso
 * @return 404 - Pedido não encontrado
 */
export const deletar = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const pedido = await PedidosModel.buscarPorId(id);
        if (!pedido)
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });

        await pedido.deletar();
        return res.json({ message: `O pedido #${id} foi deletado com sucesso!` });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
