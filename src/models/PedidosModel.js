import prisma from '../utils/prismaClient.js';

export default class PedidosModel {
    constructor({ id = null, cardapioId= null,quantidade = null, preco = null } = {}) {
        this.id = id;
        this.cardapioId = cardapioId;
        this.quantidade = quantidade;
        this.preco = preco;
    }

    async criar() {
         if (preco <= 0) {
             throw new Error('Não é possível criar pedido com o preço menor ou igual a 0');
        }

        return prisma.pedido.create({
            data: {
                quantidade: this.quantidade,
                preco: this.preco,
            },
        });
    }

    async atualizar() {
        if (preco <= 0) {
            throw new Error ("Não é possível atualizar pedido com o preço menor ou igual a 0")
        }

        return prisma.pedido.update({
            where: { id: this.id },
            data: { quantidade: this.quantidade, preco: this.preco },
        });
    }

    async deletar() {
        return prisma.pedido.delete({ where: { id: this.id } });
    }

 /*   static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.estado !== undefined) {
            where.estado = filtros.estado === 'true';
        }
        if (filtros.preco !== undefined) {
            where.preco = parseFloat(filtros.preco);
        }

        return prisma.pedidos.findMany({ where });
    } */

    static async buscarPorId(id) {
        const data = await prisma.pedidos.findUnique({ where: { id } });
        if (!data) {
            return null;
        }
        return new ExemploModel(data);
    }
}
