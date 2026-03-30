import CardapioModel from '../models/CardapioModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { nome, categoria, preco, disponivel } = req.body;

        if (!nome) {
            return res.status(400).json({ error: 'O campo "nome" é obrigatório!' });
        }
        if (preco === undefined || preco === null) {
            return res.status(400).json({ error: 'O campo "preco" é obrigatório!' });
        }
        if (parseFloat(preco) <= 0) {
            return res.status(400).json({ error: 'O campo "preco" precisa ser maior que 0!' });
        }

        const categoriasValidas = ['ENTRADA', 'PRATO_PRINCIPAL', 'SOBREMESA', 'BEBIDA'];
        if (!categoriasValidas.includes(categoria)) {
            return res.status(400).json({
                error: 'O campo "Categoria" deve ser uma das opções: "ENTRADA, PRATO_PRINCIPAL, SOBREMESA, BEBIDA"',
            });
        }

        const isDisponivel = disponivel === true || disponivel === 'true';
        if (!isDisponivel) {
            return res
                .status(400)
                .json({ error: 'O campo "disponivel" deve ser true para ser criado!' });
        }

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

export const buscarTodos = async (req, res) => {
    try {
        const registros = await CardapioModel.buscarTodos(req.query);

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

        const cardapio = await CardapioModel.buscarPorId(parseInt(id));

        if (!cardapio) {
            return res.status(404).json({ error: 'Registro não encontrado.' });
        }

        return res.json({ data: cardapio });
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

        const cardapio = await CardapioModel.buscarPorId(parseInt(id));

        if (!cardapio) {
            return res.status(404).json({ error: 'Registro não encontrado para atualizar.' });
        }

        if (req.body.nome !== undefined) cardapio.nome = req.body.nome;

        if (req.body.categoria !== undefined) {
            const categoriasValidas = ['ENTRADA', 'PRATO_PRINCIPAL', 'SOBREMESA', 'BEBIDA'];
            if (categoriasValidas.includes(req.body.categoria)) {
                cardapio.categoria = req.body.categoria;
            }
        }

        if (req.body.preco !== undefined) cardapio.preco = parseFloat(req.body.preco);

        if (req.body.disponivel !== undefined) {
            cardapio.disponivel = req.body.disponivel === true || req.body.disponivel === 'true';
        }

        const data = await cardapio.atualizar();

        return res.json({ message: `O registro "${data.nome}" foi atualizado com sucesso!`, data });
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

        const cardapio = await CardapioModel.buscarPorId(parseInt(id));

        if (!cardapio) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }

        await cardapio.deletar();

        return res.json({
            message: `O registro "${cardapio.nome}" foi deletado com sucesso!`,
            deletado: cardapio,
        });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        return res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
