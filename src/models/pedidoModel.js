import prisma from '../utils/prismaClient.js';

export default class PedidoModel {
    constructor({
        id = null,
        clienteId = null,
        total = 0,
        status = 'ABERTO',
        criadoEm = null,
        itensPedidos = [],
    } = {}) {
        this.id = id;
        this.clienteId = clienteId;
        this.total = total;
        this.status = status;
        this.criadoEm = criadoEm;
        this.itensPedidos = itensPedidos;
    }

    static validarStatus(status) {
        if (status && !['ABERTO', 'PAGO', 'CANCELADO'].includes(status)) {
            return 'Status inválido. Use: ABERTO, PAGO ou CANCELADO.';
        }
        return null;
    }

    async criar() {
        const cliente = await prisma.cliente.findUnique({ where: { id: this.clienteId } });

        if (!cliente) return { erro: 'Cliente não encontrado.' };
        if (!cliente.ativo) return { erro: 'Não é possível criar pedido para cliente inativo.' };

        return prisma.pedidos.create({
            data: {
                clienteId: this.clienteId,
                total: 0,
                status: 'ABERTO',
            },
        });
    }

    async atualizar(dados) {
        return prisma.pedidos.update({
            where: { id: this.id },
            data: dados,
        });
    }

    async cancelar() {
        if (this.status !== 'ABERTO') {
            return { erro: 'Somente pedidos com status ABERTO podem ser cancelados.' };
        }

        const pedido = await prisma.pedidos.update({
            where: { id: this.id },
            data: { status: 'CANCELADO' },
        });
        return new PedidoModel(pedido);
    }

    async deletar() {
        if (this.status !== 'ABERTO') {
            return { erro: 'Somente pedidos com status ABERTO podem ser removidos.' };
        }

        await prisma.itemPedido.deleteMany({ where: { pedidoId: this.id } });
        await prisma.pedidos.delete({ where: { id: this.id } });
        return { sucesso: true };
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.clienteId) where.clienteId = Number(filtros.clienteId);
        if (filtros.status) where.status = filtros.status;

        return prisma.pedidos.findMany({
            where,
            include: { itensPedidos: true },
            orderBy: { id: 'asc' },
        });
    }

    static async buscarPorId(id) {
        const data = await prisma.pedidos.findUnique({
            where: { id },
            include: { itensPedidos: true },
        });
        if (!data) return null;
        return new PedidoModel(data);
    }
}
