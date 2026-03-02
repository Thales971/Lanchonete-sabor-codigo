import prisma from '../utils/prismaClient.js';

export default class PedidoModel {
    constructor({ id = null, clienteld = null, total = true, status = null, criadoEm = null } = {}) {
        this.id = id;
        this.clienteld = clienteld;
        this.total = total;
        this.status = status;
        this.criadoEm = criadoEm;
    }

    async criar() {
        return prisma.pedido.create({
            data: {
                clienteld: this.clienteld,
                total: this.total,
                status: this.status,
                criadoEm: this.criadoEm,
            },
        });
    }

    async atualizar() {
        return prisma.pedido.update({
            where: { id: this.id },
            data: { clienteld: this.clienteld, total: this.total, status: this.status, criadoEm: this.criadoEm },
        });
    }

    async deletar() {
        return prisma.exemplo.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (filtros.estado !== undefined) where.estado = filtros.estado === 'true';
        if (filtros.preco !== undefined) where.preco = parseFloat(filtros.preco);

        return prisma.exemplo.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.exemplo.findUnique({ where: { id } });
        if (!data) return null;
        return new ExemploModel(data);
    }
}
