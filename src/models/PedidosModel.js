import prisma from '../utils/prismaClient.js';

export default class PedidosModel {
    constructor({ id = null, clienteId = null, estado = true, createdAt = null } = {}) {
        this.id = id;
        this.clienteId = clienteId;
        this.estado = estado;
        this.createdAt = createdAt;
    }

    async criar() {
        if (!this.clienteId) {
            throw new Error('Um pedido precisa de um clienteId válido.');
        }

        return prisma.pedido.create({
            data: {
                clienteId: this.clienteId,
                estado: this.estado,
            },
        });
    }

    async atualizar() {
        if (!this.id) throw new Error('ID do pedido não fornecido para atualização.');

        return prisma.pedido.update({
            where: { id: this.id },
            data: {
                estado: this.estado,
            },
        });
    }

    async deletar() {
        if (!this.id) throw new Error('ID do pedido não fornecido para deleção.');

        await prisma.itemPedido.deleteMany({
            where: { pedidoId: this.id },
        });

        return prisma.pedido.delete({
            where: { id: this.id },
        });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.estado !== undefined) {
            where.estado = filtros.estado === 'true' || filtros.estado === true;
        }

        if (filtros.clienteId !== undefined) {
            where.clienteId = parseInt(filtros.clienteId);
        }

        return prisma.pedido.findMany({
            where,
            include: {
                itens: true,
                cliente: true,
            },
        });
    }

    static async buscarPorId(id) {
        if (!id) return null;

        const data = await prisma.pedido.findUnique({
            where: { id: parseInt(id) },
            include: {
                itens: true,
                cliente: true,
            },
        });

        if (!data) return null;

        return new PedidosModel(data);
    }
}
