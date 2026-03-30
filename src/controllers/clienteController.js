import clienteModel from '../models/ClienteModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { nome, email, cep, localidade, telefone, cpf, logradouro, bairro, uf, ativo } =
            req.body;

        if (!nome) {
            return res.status(400).json({ error: 'O campo "nome" é obrigatório!' });
        }
        if (!email) {
            return res.status(400).json({ error: 'O campo "email" é obrigatório!' });
        }
        if (!cep) {
            return res.status(400).json({ error: 'O campo "cep" é obrigatório!' });
        }

        const cliente = new clienteModel({
            nome,
            email,
            cep,
            localidade,
            telefone,
            cpf,
            logradouro,
            bairro,
            uf,
            ativo,
        });
        const data = await cliente.criar();

        return res.status(201).json({ message: 'Registro criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Email já cadastrado.' });
        }
        if (error.message) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Erro interno ao salvar o registro.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await clienteModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum registro encontrado.' });
        }

        return res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        return res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const cliente = await clienteModel.buscarPorId(parseInt(id));

        if (!cliente) {
            return res.status(404).json({ error: 'Registro não encontrado.' });
        }

        return res.json({ data: cliente });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        return res.status(500).json({ error: 'Erro ao buscar registro.' });
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

        const cliente = await clienteModel.buscarPorId(parseInt(id));

        if (!cliente) {
            return res.status(404).json({ error: 'Registro não encontrado para atualizar.' });
        }

        if (cliente.ativo === false) {
            return res.status(403).json({ error: 'Operacao nao permitida: cliente inativo.' });
        }

        if (req.body.nome !== undefined) {
            cliente.nome = req.body.nome;
        }
        if (req.body.email !== undefined) {
            cliente.email = req.body.email;
        }
        if (req.body.telefone !== undefined) {
            cliente.telefone = req.body.telefone;
        }
        if (req.body.cpf !== undefined) {
            cliente.cpf = req.body.cpf;
        }
        if (req.body.cep !== undefined) {
            cliente.cep = req.body.cep;
        }
        if (req.body.logradouro !== undefined) {
            cliente.logradouro = req.body.logradouro;
        }
        if (req.body.bairro !== undefined) {
            cliente.bairro = req.body.bairro;
        }
        if (req.body.localidade !== undefined) {
            cliente.localidade = req.body.localidade;
        }
        if (req.body.uf !== undefined) {
            cliente.uf = req.body.uf;
        }
        if (req.body.ativo !== undefined) {
            cliente.ativo = req.body.ativo;
        }

        const data = await cliente.atualizar();

        return res.json({ message: `O registro "${data.nome}" foi atualizado com sucesso!`, data });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        if (error.message === 'Operacao nao permitida: cliente inativo.') {
            return res.status(403).json({ error: error.message });
        }
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Email já cadastrado.' });
        }
        if (error.message) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const cliente = await clienteModel.buscarPorId(parseInt(id));

        if (!cliente) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }

        if (cliente.ativo === false) {
            return res.status(403).json({ error: 'Operacao nao permitida: cliente inativo.' });
        }

        await cliente.deletar();

        return res.json({
            message: `O registro "${cliente.nome}" foi deletado com sucesso!`,
            deletado: cliente,
        });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        if (error.message === 'Operacao nao permitida: cliente inativo.') {
            return res.status(403).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
