import PedidosModel from '../models/PedidosModel.js';
import ItemPedidoModel from '../models/ItemPedidoModel.js';
import CardapioModel from '../models/CardapioModel.js';

const parseId = (value) => Number.parseInt(value, 10);

/**
 * @typedef {object} ItemEntrada
 * @property {integer} cardapioId.required - ID do item no cardápio
 * @property {integer} quantidade.required - Quantidade desejada
 * @property {number} precoFixo.required - Preço unitário no momento da compra
 */

/**
 * @typedef {object} ReqBodyPedido
 * @property {integer} clienteId.required - ID do cliente que está realizando o pedido
 * @property {array<ItemEntrada>} itens.required - Lista de itens do pedido
 */

/**
 * POST /itemPedidos
 * @tags Itens do Pedido
 * @summary Cria um novo pedido com itens
 * @description Cadastra um pedido vinculado a um cliente e processa a lista de itens.
 * @param { ReqBodyPedido } request.body.required
 * @return 201 - Pedido criado com sucesso
 * @return 400 - Erro de validação ou item indisponível
 * @return 404 - Registro não encontrado
 * @return 500 - Erro interno do servidor
 */
export const criar = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { clienteId, itens } = req.body;
        const clienteIdNumber = parseId(clienteId);

        if (!clienteId || Number.isNaN(clienteIdNumber)) {
            return res.status(400).json({ error: 'O campo "clienteId" é obrigatório!' });
        }

        if (!itens || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ error: 'O pedido deve ter pelo menos um item!' });
        }

        const itensCardapio = await Promise.all(
            itens.map((item) => CardapioModel.buscarPorId(parseId(item.cardapioId))),
        );

        if (itensCardapio.some((itemCardapio) => !itemCardapio)) {
            return res.status(404).json({ error: 'Registro do cardápio não encontrado.' });
        }

        if (itensCardapio.some((itemCardapio) => itemCardapio.disponivel === false)) {
            return res.status(400).json({ error: 'Não é permitido utilizar item indisponível.' });
        }

        const pedidoInstance = new PedidosModel({ clienteId: clienteIdNumber });
        const pedidoCriado = await pedidoInstance.criar();

        const promises = itens.map((item) => {
            const novoItem = new ItemPedidoModel({
                pedidoId: pedidoCriado.id,
                cardapioId: item.cardapioId,
                quantidade: item.quantidade,
                precoFixo: Number.parseFloat(item.precoFixo),
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

/**
 * GET /itemPedidos
 * @tags Itens do Pedido
 * @summary Busca todos os pedidos com itens
 * @return 200 - Lista de pedidos encontrados
 * @return 500 - Erro interno do servidor
 */
export const buscarTodos = async (req, res) => {
    try {
        const registros = await PedidosModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum pedido encontrado.' });
        }

        return res.json(registros);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar pedidos.' });
    }
};

/**
 * GET /itemPedidos/{id}
 * @tags Itens do Pedido
 * @summary Busca um pedido com itens por ID
 * @param {integer} id.path.required - ID do pedido
 * @return 200 - Pedido encontrado com sucesso
 * @return 404 - Pedido não encontrado
 * @return 500 - Erro interno do servidor
 */
export const buscarPorId = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const pedido = await PedidosModel.buscarPorId(id);

        if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });
        return res.json({ data: pedido });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar pedido.' });
    }
};

/**
 * @typedef {object} UpdateItemPedido
 * @property {integer} quantidade - Nova quantidade do item
 * @property {number} precoFixo - Novo preço fixo (ex: 15.50)
 */

/**
 * PUT /itemPedidos/{id}
 * @tags Itens do Pedido
 * @summary Atualiza um item do pedido
 * @param {integer} id.path.required - ID do registro em itens_pedido
 * @param {UpdateItemPedido} request.body.required - Dados de atualização
 * @return 200 - Item atualizado com sucesso
 */
export const atualizar = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const itemExistente = await ItemPedidoModel.buscarPorId(id);

        if (!itemExistente) {
            return res.status(404).json({ error: 'Item do pedido não encontrado.' });
        }

        if (req.body.quantidade !== undefined) {
            itemExistente.quantidade = parseId(req.body.quantidade);
        }

        if (req.body.precoFixo !== undefined) {
            itemExistente.precoFixo = Number.parseFloat(req.body.precoFixo);
        }

        const data = await itemExistente.atualizar();

        return res.json({
            message: 'Item atualizado com sucesso!',
            data,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno ao atualizar o item.' });
    }
};

/**
 * DELETE /itemPedidos/{id}
 * @tags Itens do Pedido
 * @summary Deleta um pedido completo
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
        if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });

        const instancia = new PedidosModel({ id: pedido.id });
        await instancia.deletar();

        return res.json({ message: `O pedido #${id} foi deletado!` });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao deletar.' });
    }
};
