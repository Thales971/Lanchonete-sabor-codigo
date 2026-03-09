import prisma from '../utils/prismaClient.js';

const statusValidos = ['ABERTO', 'PAGO', 'CANCELADO'];

export default class PedidoModel {
    constructor({
        id = null,
        clienteId = null,
        total = 0,
        status = 'ABERTO',
        criadoEm = null,
    } = {}) {
        this.id = id;
        this.clienteId = clienteId;
        this.total = total;
        this.status = status;
        this.criadoEm = criadoEm;
    }

    // ── Validações (regras de negócio) ──

    static get statusValidos() {
        return statusValidos;
    }

    static validarStatus(status) {
        if (status && !statusValidos.includes(status)) {
            return 'Status inválido. Use: ABERTO, PAGO ou CANCELADO.';
        }
        return null;
    }

    // ── CRUD ──

    // Regra de negócio: Não pode criar pedido para cliente inativo
    async criar() {
        const cliente = await prisma.cliente.findUnique({ where: { id: this.clienteId } });

        if (!cliente) {
            return { erro: 'Cliente não encontrado.' };
        }

        if (!cliente.ativo) {
            return { erro: 'Não é possível criar pedido para um cliente inativo.' };
        }

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

    // Regra de negócio: Só pode cancelar pedidos com status ABERTO
    async cancelar() {
        if (this.status !== 'ABERTO') {
            return { erro: 'Só é possível cancelar pedidos com status ABERTO.' };
        }

        return this.atualizar({ status: 'CANCELADO' });
    }

    // Regra de negócio: Não pode excluir pedido com status ABERTO
    async deletar() {
        if (this.status === 'ABERTO') {
            return {
                erro: 'Não é possível excluir um pedido com status ABERTO. Cancele-o primeiro.',
            };
        }

        await prisma.pedido.delete({ where: { id: this.id } });
        return { sucesso: true };
    }

    // ── Consultas estáticas ──

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
