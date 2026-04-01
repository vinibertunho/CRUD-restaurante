import CardapioModel from '../models/CardapioModel.js';

const CATEGORIAS_VALIDAS = ['ENTRADA', 'PRATO_PRINCIPAL', 'SOBREMESA', 'BEBIDA'];
const parseId = (value) => Number.parseInt(value, 10);

/**
 * @typedef {object} ReqBodyCardapio
 * @property {string} nome.required - Nome do item do cardápio
 * @property {string} categoria.required - Categoria (ENTRADA, PRATO_PRINCIPAL, SOBREMESA, BEBIDA)
 * @property {number} preco.required - Preço do item
 * @property {boolean} disponivel.required - Status de disponibilidade
 */

/**
 * POST /cardapio
 * @tags Cardápio
 * @summary Cria um novo item do cardápio
 * @description Endpoint responsável por cadastrar um novo item no cardápio.
 * @param { ReqBodyCardapio } request.body.required
 * @return 201 - Registro criado com sucesso
 * @return 400 - Erro de validação
 * @return 500 - Erro interno do servidor
 */
export const criar = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { nome, categoria, preco, disponivel } = req.body;

        if (!nome) {
            return res.status(400).json({ error: 'O campo "nome" é obrigatório!' });
        }
        if (preco === undefined || preco === null) {
            return res.status(400).json({ error: 'O campo "preco" é obrigatório!' });
        }
        if (parseFloat(preco) < 0) {
            return res
                .status(400)
                .json({ error: 'O campo "preco" precisa ser maior ou igual a 0!' });
        }

        if (!CATEGORIAS_VALIDAS.includes(categoria)) {
            return res.status(400).json({
                error: 'O campo "Categoria" deve ser uma das opções: "ENTRADA, PRATO_PRINCIPAL, SOBREMESA, BEBIDA"',
            });
        }

        if (disponivel === undefined) {
            return res.status(400).json({ error: 'O campo "disponivel" é obrigatório!' });
        }

        const isDisponivel = disponivel === true || disponivel === 'true';

        const produto = new CardapioModel({
            nome,
            categoria,
            preco: parseFloat(preco),
            disponivel: isDisponivel,
        });

        const data = await produto.criar();
        return res.status(201).json({ message: 'Registro criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);
        return res.status(500).json({ error: 'Erro interno ao salvar o registro.' });
    }
};

/**
 * GET /cardapio
 * @tags Cardápio
 * @summary Busca todos os itens do cardápio
 * @description Endpoint responsável por buscar todos os registros de itens do cardápio.
 * @param {string} nome.query - Filtrar por nome
 * @param {string} categoria.query - Filtrar por categoria (ENTRADA, PRATO_PRINCIPAL, SOBREMESA, BEBIDA)
 * @param {boolean} disponivel.query - Filtrar por disponibilidade
 * @param {number} precoMin.query - Preço mínimo
 * @param {number} precoMax.query - Preço máximo
 * @return 200 - Lista de registros encontrados
 * @return 400 - Filtro inválido
 * @return 500 - Erro interno do servidor
 */
export const buscarTodos = async (req, res) => {
    try {
        const filtros = {};

        if (req.query.nome) filtros.nome = req.query.nome;

        if (req.query.categoria) {
            if (!CATEGORIAS_VALIDAS.includes(req.query.categoria)) {
                return res.status(400).json({ error: 'Categoria inválida.' });
            }
            filtros.categoria = req.query.categoria;
        }

        if (req.query.disponivel !== undefined) {
            if (req.query.disponivel !== 'true' && req.query.disponivel !== 'false') {
                return res
                    .status(400)
                    .json({ error: 'Filtro "disponivel" deve ser true ou false.' });
            }
            filtros.disponivel = req.query.disponivel;
        }

        if (req.query.precoMin !== undefined) {
            const precoMin = parseFloat(req.query.precoMin);
            if (Number.isNaN(precoMin) || precoMin < 0)
                return res.status(400).json({ error: 'Filtro "precoMin" inválido.' });
            filtros.precoMin = precoMin;
        }

        if (req.query.precoMax !== undefined) {
            const precoMax = parseFloat(req.query.precoMax);
            if (Number.isNaN(precoMax) || precoMax < 0)
                return res.status(400).json({ error: 'Filtro "precoMax" inválido.' });
            filtros.precoMax = precoMax;
        }

        const registros = await CardapioModel.buscarTodos(filtros);
        return res.json(registros);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
};

/**
 * GET /cardapio/{id}
 * @tags Cardápio
 * @summary Busca um item do cardápio por ID
 * @param {integer} id.path.required - ID do item do cardápio
 * @return 200 - Registro encontrado com sucesso
 * @return 404 - Registro não encontrado
 * @return 500 - Erro interno do servidor
 */
export const buscarPorId = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const cardapio = await CardapioModel.buscarPorId(id);
        if (!cardapio) return res.status(404).json({ error: 'Registro não encontrado.' });

        return res.json({ data: cardapio });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar registro.' });
    }
};

/**
 * PUT /cardapio/{id}
 * @tags Cardápio
 * @summary Atualiza um item do cardápio por ID
 * @param {integer} id.path.required - ID do item
 * @param { ReqBodyCardapio } request.body.required
 * @return 200 - Registro atualizado com sucesso
 * @return 404 - Registro não encontrado
 * @return 500 - Erro interno do servidor
 */
export const atualizar = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const cardapio = await CardapioModel.buscarPorId(id);
        if (!cardapio)
            return res.status(404).json({ error: 'Registro não encontrado para atualizar.' });

        if (req.body.nome !== undefined) cardapio.nome = req.body.nome;
        if (req.body.categoria !== undefined) {
            if (!CATEGORIAS_VALIDAS.includes(req.body.categoria))
                return res.status(400).json({ error: 'Categoria inválida.' });
            cardapio.categoria = req.body.categoria;
        }
        if (req.body.preco !== undefined) {
            const precoAtualizado = parseFloat(req.body.preco);
            if (Number.isNaN(precoAtualizado) || precoAtualizado < 0)
                return res.status(400).json({ error: 'Preço inválido.' });
            cardapio.preco = precoAtualizado;
        }
        if (req.body.disponivel !== undefined) {
            cardapio.disponivel = req.body.disponivel === true || req.body.disponivel === 'true';
        }

        const data = await cardapio.atualizar();
        return res.json({ message: `O registro "${data.nome}" foi atualizado com sucesso!`, data });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
};

/**
 * DELETE /cardapio/{id}
 * @tags Cardápio
 * @summary Deleta um item do cardápio por ID
 * @param {integer} id.path.required - ID do item
 * @return 200 - Registro deletado com sucesso
 * @return 404 - Registro não encontrado
 */
export const deletar = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const cardapio = await CardapioModel.buscarPorId(id);
        if (!cardapio)
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });

        await cardapio.deletar();
        return res.json({
            message: `O registro "${cardapio.nome}" foi deletado com sucesso!`,
            deletado: cardapio,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
