import prisma from '../utils/prismaClient.js';

export default class ProdutoModel {
    constructor({ id = null, nome = null, estado = true, preco = null } = {}) {
        this.id = id;
        this.nome = nome;
        this.estado = estado;
        this.preco = preco;
    }

    async criar() {
        return prisma.produto.create({
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: this.preco,
                disponivel: this.disponivel
            },
        });
    }

//Parei apartir daqui
    async atualizar() {
        return prisma.produto.update({
            where: { id: this.id },
            data: { nome: this.nome, estado: this.estado, preco: this.preco },
        });
    }

    async deletar() {
        return prisma.produto.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (filtros.estado !== undefined) where.estado = filtros.estado === 'true';
        if (filtros.preco !== undefined) where.preco = parseFloat(filtros.preco);

        return prisma.produto.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.produto.findUnique({ where: { id } });
        if (!data) return null;
        return new ProdutoModel(data);
    }
}
