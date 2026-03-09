import prisma from '../utils/prismaClient.js';

export default class ItemPedidoModel {
    constructor({ id, pedidoId, produtoId, quantidade, precoUnitario } = {}) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
    }

    // ── Validações (regras de negócio) ──

    static validarQuantidade(quantidade) {
        const quantidadeNumero = Number(quantidade);
        if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0 || quantidadeNumero > 99) {
            return 'Quantidade deve ser entre 1 e 99.';
        }
        return null;
    }

    static validarQuantidadeAtualizacao(quantidade) {
        const quantidadeNumero = Number(quantidade);
        if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0) {
            return 'Quantidade deve ser maior que 0.';
        }
        return null;
    }

    /**
     * Verifica se o pedido está ABERTO (regra para adicionar/alterar/remover itens).
     */
    static verificarPedidoAberto(pedido) {
        if (pedido.status !== 'ABERTO') {
            return 'Não pode adicionar itens se o pedido estiver PAGO ou CANCELADO.';
        }
        return null;
    }

    /**
     * Verifica se o produto está disponível.
     */
    static verificarProdutoDisponivel(produto) {
        if (!produto.disponivel) {
            return 'Não pode adicionar produto com disponivel = false ao pedido.';
        }
        return null;
    }

    // ── CRUD ──

    async criar() {
        return prisma.itemPedido.create({
            data: {
                pedidoId: this.pedidoId,
                produtoId: this.produtoId,
                quantidade: this.quantidade,
                precoUnitario: this.precoUnitario,
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

    // ── Consultas estáticas ──

    static async buscarTodos(filtros = {}) {
        const where = {};

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

    static async buscarPedidoPorId(id) {
        return prisma.pedido.findUnique({ where: { id } });
    }

    static async buscarProdutoPorId(id) {
        return prisma.produto.findUnique({ where: { id } });
    }

    static async recalcularTotalDoPedido(pedidoId) {
        const itens = await prisma.itemPedido.findMany({
            where: { pedidoId },
            select: { quantidade: true, precoUnitario: true },
        });

        const total = itens.reduce((acumulador, item) => {
            return acumulador + Number(item.precoUnitario) * item.quantidade;
        }, 0);

        return prisma.pedido.update({
            where: { id: pedidoId },
            data: { total },
        });
    }
}
