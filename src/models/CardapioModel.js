import prisma from '../utils/prismaClient.js';

export default class CardapioModel {
        constructor({ id = null, nome, descricao = null, categoria, disponivel = null, preco, foto = null } = {}) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.disponivel = disponivel;
        this.preco = preco;
        this.foto = foto;
    }

    async criar() {
        return prisma.cardapio.create({
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                disponivel: this.disponivel,
                preco: this.preco,
            },
        });
    }

    async atualizar() {
        return prisma.exemplo.update({
            where: { id: this.id },
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: this.preco,
                disponivel: this.disponivel
            },
        });
    }

    async deletar() {
        return prisma.cardapio.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) {
            where.nome = { contains: filtros.nome, mode: 'insensitive' };
        }
        if (filtros.categoria) {
            where.categoria = { contains: filtros.categoria, mode: 'insensitive' };
        }
        if (filtros.disponivel !== undefined) {
            where.disponivel = filtros.disponivel === 'true';
        }
        if (filtros.preco !== undefined) {
            where.preco = parseFloat(filtros.preco);
        }

        return prisma.exemplo.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.cardapio.findUnique({ where: { id } });
        if (!data) {
            return null;
        }
        return new CardapioModel(data);
    }
}
