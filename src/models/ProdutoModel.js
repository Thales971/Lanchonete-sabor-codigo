import prisma from '../utils/prismaClient.js';

const categoriasValidas = ['LANCHE', 'BEBIDA', 'SOBREMESA', 'COMBO'];

export default class ProdutoModel {
    constructor({
        id = null,
        nome = null,
        descricao = null,
        categoria = null,
        preco = null,
        disponivel = true,
    } = {}) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.preco = preco;
        this.disponivel = disponivel;
    }

    // ── Validações (regras de negócio) ──

    static get categoriasValidas() {
        return categoriasValidas;
    }

    static validarNome(nome) {
        if (!nome) return "O campo 'nome' é obrigatório.";
        if (nome.length < 3) return "O campo 'nome' deve ter no mínimo 3 caracteres.";
        return null;
    }

    static validarDescricao(descricao) {
        if (descricao !== undefined && descricao !== null && String(descricao).length > 255) {
            return "O campo 'descricao' deve ter no máximo 255 caracteres.";
        }
        return null;
    }

    static validarCategoria(categoria) {
        if (!categoria || !categoriasValidas.includes(categoria)) {
            return 'Categoria inválida. Use: LANCHE, BEBIDA, SOBREMESA ou COMBO.';
        }
        return null;
    }

    static validarPreco(preco) {
        if (preco === undefined || preco === null) return "O campo 'preco' é obrigatório.";
        const precoNum = parseFloat(preco);
        if (isNaN(precoNum) || precoNum <= 0) return 'Preco deve ser maior que 0.';
        const partes = String(preco).split('.');
        if (partes[1] && partes[1].length > 2) return 'Preco deve ter no máximo 2 casas decimais.';
        return null;
    }

    /**
     * Valida todos os campos para criação.
     * Retorna a primeira mensagem de erro encontrada ou null.
     */
    validarCriacao() {
        return (
            ProdutoModel.validarNome(this.nome) ||
            ProdutoModel.validarDescricao(this.descricao) ||
            ProdutoModel.validarCategoria(this.categoria) ||
            ProdutoModel.validarPreco(this.preco) ||
            null
        );
    }

    // ── CRUD ──

    async criar() {
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
            return { erro: 'Preco deve ser maior que 0.' };
        }

        return prisma.produto.update({
            where: { id: this.id },
            data: dados,
        });
    }

    // Regra de negócio: Não pode deletar produto vinculado a pedido ABERTO
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
            return { erro: 'Não pode deletar produto vinculado a pedido ABERTO.' };
        }

        await prisma.produto.delete({ where: { id: this.id } });
        return { sucesso: true };
    }

    // ── Consultas estáticas ──

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
