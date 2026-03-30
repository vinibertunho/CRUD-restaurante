import prisma from '../utils/prismaClient.js';

export default class ItemPedidoModel {
    constructor({
        id = null,
        pedidoId = null,
        cardapioId = null,
        quantidade = null,
        precoFixo = null,
    } = {}) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.cardapioId = cardapioId;
        this.quantidade = quantidade;
        this.precoFixo = precoFixo;
    }

    async criar() {
        return prisma.itemPedido.create({
            data: {
                pedidoId: this.pedidoId,
                cardapioId: this.cardapioId,
                quantidade: this.quantidade,
                precoFixo: this.precoFixo,
            },
        });
    }

    async atualizar() {
        return prisma.itemPedido.update({
            where: { id: this.id },
            data: {
                quantidade: this.quantidade,
                precoFixo: this.precoFixo,
            },
        });
    }

    async deletar() {
        return prisma.itemPedido.delete({ where: { id: this.id } });
    }

    static async buscarPorPedido(pedidoId) {
        return prisma.itemPedido.findMany({
            where: { pedidoId: parseInt(pedidoId) },
            include: { cardapio: true },
        });
    }

    static async buscarPorId(id) {
        const data = await prisma.itemPedido.findUnique({ where: { id: parseInt(id) } });
        if (!data) return null;
        return new ItemPedidoModel(data);
    }
}
