import prisma from '../utils/prismaClient.js';

export default class ClienteModel {
    constructor({ nome, cep = null, logradouro = null, bairro = null, cidade = null, uf = null, telefone, email, cpf } = {}) {
        this.nome = nome;
        this.cep = cep;
        this.logradouro = logradouro;
        this.bairro = bairro;
        this.cidade = cidade;
        this.uf = uf;
        this.telefone = telefone;
        this.email = email;
        this.cpf = cpf;
    }

    async criar() {
        return prisma.cliente.create({
            data: {
                nome: this.nome,
                cep: this.cep,
                logradouro: this.logradouro,
                bairro: this.bairro,
                cidade: this.cidade,
                uf: this.uf,
                telefone: this.telefone,
                email: this.email,
                cpf: this.cpf,
            },
        });


    }

    async atualizar() {
        return prisma.cliente.update({
            where: { id: this.id },
            data: { nome: this.nome, telefone: this.telefone, email: this.email, cpf: this.cpf },
        });
    }

    async deletar() {
        return prisma.cliente.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};
        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (filtros.cep) where.cep = { contains: filtros.cep, mode: 'insensitive' };
        if (filtros.logradouro) where.logradouro = { contains: filtros.logradouro, mode: 'insensitive' };
        if (filtros.bairro) where.bairro = { contains: filtros.bairro, mode: 'insensitive' };
        if (filtros.cidade) where.cidade = { contains: filtros.cidade, mode: 'insensitive' };
        if (filtros.uf) where.uf = { contains: filtros.uf, mode: 'insensitive' };
        if (filtros.telefone) where.telefone = { contains: filtros.telefone, mode: 'insensitive' };
        if (filtros.email) where.email = { contains: filtros.email, mode: 'insensitive' };
        if (filtros.cpf) where.cpf = { contains: filtros.cpf, mode: 'insensitive' };

        return prisma.cliente.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.cliente.findUnique({ where: { id } });
        if (!data) return null;
        return new ExemploModel(data);
    }
}
