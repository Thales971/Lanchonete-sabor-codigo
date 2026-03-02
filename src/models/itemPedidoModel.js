import prisma from '../utils/prismaClient.js';

export default class ItemPedidoModel {
    constructor({ id, pedidoId, produtoId, quantidade, precoUnitario } = {}) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
    }

    async criar() {
        return prisma.itemPedido.create({
            data: {
                pedido: this.pedidoId,
                produto: this.produtoId,
                quantidade: this.quantidade,
                precoUni: this.precoUnitario,
            },
        });
    }

    async atualizar(dados) {
        return prisma.itemPedido.update({
            where: { id: this.id },
            data: dados,
        });
    }

    async deletar() {
        return prisma.itemPedido.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        // filtros opcionais
        if (filtros.pedidoId) where.pedidoId = Number(filtros.pedidoId);
        if (filtros.produtoId) where.produtoId = Number(filtros.produtoId);
        if (filtros.quantidade) where.quantidade = Number(filtros.quantidade);

        return prisma.itemPedido.findMany({ where, orderBy: { id: 'asc' } });
    }

    static async buscarPorId(id) {
        const data = await prisma.itemPedido.findUnique({ where: { id } });
        if (!data) return null;
        return new ItemPedidoModel(data);
    }
}
