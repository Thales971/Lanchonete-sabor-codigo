import prisma from '../utils/prismaClient.js';

export default class ProdutoModel {
    constructor({ id = null, nome = null, descricao = null, categoria = null, preco = null, disponivel = true } = {}) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.preco = preco;
        this.disponivel = disponivel;

    }

    async criar() {
        if (Number(this.preco) <= 0) {
            throw new Error('PRECO_INVALIDO');
        }

        if (!this.nome || this.nome.length < 3) {
            throw new Error('O nome deve ter pelo menos 3 caracteres');
        }

        if (this.descricao && this.descricao.length > 255) {
            throw new Error('A descrição deve ter no máximo 255 caracteres');
        }

        const precoNum = Number(this.preco);
        if (precoNum <= 0) {
            throw new Error('O preço deve ser maior que 0');
        }

        if (!Number.isInteger(Number((precoNum * 100).toFixed(10)))) {
            throw new Error('O preço deve ter 2 casas decimais');
        }

        return prisma.produto.create({
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: Number(this.preco),
                disponivel: this.disponivel,
            },
        });
    }

    async atualizar(dados) {
        if (dados.preco !== undefined && Number(dados.preco) <= 0) {
            throw new Error('PRECO_INVALIDO');
        }

        return prisma.produto.update({
            where: { id: this.id },
            data: dados,
        });
    }

    async deletar() {
        const pedidoAberto = await prisma.itemPedido.findFirst({
            where: {
                produtoId: this.id,
                pedido: {
                    status: 'ABERTO',
                },
            },
        });

        if (pedidoAberto) {
            throw new Error('Não pode deletar produto em que o pedido esteja em status ABERTO.');
        }

        return prisma.produto.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (filtros.categoria) where.categoria = filtros.categoria;
        if (filtros.disponivel !== undefined) where.disponivel = filtros.disponivel === 'true';

        if (filtros.precoMin || filtros.precoMax) {
            where.preco = {};
            if (filtros.precoMin) where.preco.gte = Number(filtros.precoMin);
            if (filtros.precoMax) where.preco.lte = Number(filtros.precoMax);
        }

        return prisma.produto.findMany({ where, orderBy: { id: 'asc' } });
    }

    static async buscarPorId(id) {
        const data = await prisma.produto.findUnique({ where: { id } });
        if (!data) return null;
        return new ProdutoModel(data);
    }
}
