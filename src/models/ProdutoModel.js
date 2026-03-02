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
        return prisma.produto.create({
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: this.preco,
                disponivel: this.disponivel,
            },
        });
    }

    async atualizar() {
        return prisma.produto.update({
            where: { id: this.id },
            data: dados,
        });
    }

    async deletar() {
        return prisma.produto.delete({ where: { id: this.id } });
    }

    //Filtros
    static async buscarTodos(filtros = {}) {
        const where = {};

        //nome
        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        //categoria
        if (filtros.categoria) where.categoria = { contains: filtros.categoria, mode: 'insensitive' };
        //disponível
         if (filtros.disponivel !== undefined) where.disponivel = filtros.disponivel === 'true';
        //precoMin
        if (filtros.precoMin) where.preco = { gte: Number(filtros.precoMin)};
        //precoMax
        if (filtros.precoMax) where.preco = { lte: Number (filtros.precoMax)};

        return prisma.produto.findMany({ where, orderBy: { id: 'asc' } });
    }

    static async buscarPorId(id) {
        const data = await prisma.produto.findUnique({ where: { id } });
        if (!data) return null;
        return new ProdutoModel(data);
    }
}

//Regras de negócio

//Preco deve ser maior que 0
if (typeof precoMin !== 'number' || precoMin <= 0) {
    return res.status(400).json({
        error: 'O preço é obrigatório e deve ser maior que 0.',
    });
}

//Não pode deletar produto vinculado a pedido ABERTO
const produtoId = req.params.id;

const existePedidoAberto = await prisma.pedido.findFirst({
    where: {
        status: 'ABERTO',
        itens: {
            some: {
                produtoId: Number(produtoId),
            },
        },
    },
});

if (existePedidoAberto) {
    return res.status(400).json({
        error: 'Não é possível excluir o produto pois ele está vinculado a um pedido aberto.',
    });
}

// Se passou na regra, pode deletar
await prisma.produto.delete({
    where: { id: Number(produtoId) },
});

//Não pode adicionar produto com disponivel = false ao pedido
   if (exists.disponivel === false) {
       return res.status(400).json({
           error: 'Produtos com disponibilidade igual a falso não podem ser adicionados.',
       });
   }

   