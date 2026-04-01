import prisma from '../utils/prismaClient.js';

export default class CardapioModel {
    constructor({
        id = null,
        nome,
        descricao = null,
        categoria,
        disponivel = null,
        preco,
        foto = null,
    } = {}) {
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
        return prisma.cardapio.update({
            where: { id: this.id },
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: this.preco,
                disponivel: this.disponivel,
                foto: this.foto,
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
        if (filtros.descricao) {
            where.descricao = { contains: filtros.descricao, mode: 'insensitive' };
        }
        if (filtros.categoria) {
            where.categoria = filtros.categoria;
        }
        if (filtros.disponivel !== undefined) {
            where.disponivel = filtros.disponivel === 'true';
        }

        if (filtros.precoMin !== undefined || filtros.precoMax !== undefined) {
            where.preco = {};
            if (filtros.precoMin !== undefined) {
                where.preco.gte = filtros.precoMin;
            }
            if (filtros.precoMax !== undefined) {
                where.preco.lte = filtros.precoMax;
            }
        }

        return prisma.cardapio.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.cardapio.findUnique({ where: { id } });
        if (!data) {
            return null;
        }
        return new CardapioModel(data);
    }
}
