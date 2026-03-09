import prisma from '../utils/prismaClient.js';

export default class PedidoModel {
    constructor({ id = null, clienteId = null, total = 0, status = 'ABERTO', criadoEm = null } = {}) {
        this.id = id;
        this.clienteId = clienteId;
        this.total = total;
        this.status = status;
        this.criadoEm = criadoEm;
    }

    async criar() {
        return prisma.pedido.create({
            data: {
                clienteId: this.clienteId,
                total: this.total,
                status: this.status,
            },
        });
    }

    async atualizar(dados) {
        return prisma.pedido.update({
            where: { id: this.id },
            data: dados,
        });
    }

    async deletar() {
        return prisma.pedido.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.clienteId) where.clienteId = Number(filtros.clienteId);
        if (filtros.status) where.status = filtros.status;

        return prisma.pedido.findMany({
            where,
            include: { itens: true },
            orderBy: { id: 'asc' },
        });
    }

    static async buscarPorId(id) {
        const data = await prisma.pedido.findUnique({
            where: { id },
            include: { itens: true },
        });
        if (!data) return null;
        return new PedidoModel(data);
    }
}
