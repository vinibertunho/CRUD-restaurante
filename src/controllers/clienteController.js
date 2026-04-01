import ClienteModel from '../models/ClienteModel.js';

const parseId = (value) => Number.parseInt(value, 10);

/**
 * @typedef {object} ReqBodyCliente
 * @property {string} nome.required - Nome do cliente
 * @property {string} email.required - Email do cliente
 * @property {string} cep.required - CEP do cliente
 * @property {string} telefone - Telefone de contato
 * @property {boolean} ativo - Status do cliente
 */

/**
 * POST /api/clientes
 * @tags Clientes
 * @summary Cria um novo registro de cliente
 * @description Endpoint responsável por cadastrar um novo cliente.
 * @param { ReqBodyCliente } request.body.required
 * @return 201 - Registro criado com sucesso
 * @return 400 - Erro de validação ou CEP inválido
 * @return 500 - Erro interno do servidor
 */
export const criar = async (req, res) => {
    try {
        const { nome, email, cep } = req.body;

        if (!nome || nome.length < 3 || !email || !cep) {
            return res
                .status(400)
                .json({ error: 'Campo obrigatório não informado ou nome muito curto.' });
        }

        const cliente = new ClienteModel(req.body);
        const data = await cliente.criar();

        return res.status(201).json({ message: 'Registro criado com sucesso!', data });
    } catch (error) {
        const status = error.message.includes('CEP') ? 400 : 500;
        return res.status(status).json({ error: error.message });
    }
};

/**
 * GET /api/clientes
 * @tags Clientes
 * @summary Busca todos os registros de clientes
 * @description Endpoint responsável por buscar todos os clientes. Aceita filtros via query.
 * @param {string} nome.query - Filtrar por nome
 * @param {string} email.query - Filtrar por email
 * @param {string} localidade.query - Filtrar por localidade
 * @return 200 - Lista de registros encontrados
 * @return 500 - Erro interno do servidor
 */
export const buscarTodos = async (req, res) => {
    try {
        const registros = await ClienteModel.buscarTodos(req.query);
        return res.json(registros);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
};

/**
 * GET /api/clientes/{id}
 * @tags Clientes
 * @summary Busca um registro de cliente por ID
 * @param {integer} id.path.required - O ID do cliente
 * @return 200 - Registro encontrado com sucesso
 * @return 404 - Registro não encontrado
 * @return 500 - Erro interno do servidor
 */
export const buscarPorId = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const data = await ClienteModel.buscarPorId(id);

        if (!data) return res.status(404).json({ error: 'Registro não encontrado.' });
        return res.json({ data });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar registro.' });
    }
};

/**
 * PUT /api/clientes/{id}
 * @tags Clientes
 * @summary Atualiza um registro de cliente por ID
 * @param {integer} id.path.required - O ID do cliente
 * @param { ReqBodyCliente } request.body.required
 * @return 200 - Registro atualizado com sucesso
 * @return 400 - Operação não permitida ou dados inválidos
 * @return 404 - Registro não encontrado
 * @return 500 - Erro interno do servidor
 */
export const atualizar = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) return res.status(404).json({ error: 'Registro não encontrado.' });

        if (cliente.ativo === false) {
            return res.status(400).json({ error: 'Operação não permitida para registro inativo.' });
        }

        Object.assign(cliente, req.body);
        const data = await cliente.atualizar();

        return res.json({ message: 'Registro atualizado com sucesso!', data });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * DELETE /api/clientes/{id}
 * @tags Clientes
 * @summary Deleta um registro de cliente por ID
 * @param {integer} id.path.required - O ID do cliente
 * @return 200 - Registro deletado com sucesso
 * @return 400 - Operação não permitida
 * @return 404 - Registro não encontrado
 * @return 500 - Erro interno do servidor
 */
export const deletar = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) return res.status(404).json({ error: 'Registro não encontrado.' });

        if (cliente.ativo === false) {
            return res.status(400).json({ error: 'Operação não permitida para registro inativo.' });
        }

        await cliente.deletar();
        return res.json({ message: 'Registro deletado com sucesso!' });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
