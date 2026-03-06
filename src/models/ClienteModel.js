import prisma from '../utils/prismaClient.js';

export default class ClienteModel {
    constructor({
        id = null,
        nome,
        telefone,
        email,
        cpf,
        cep = null,
        logradouro = null,
        bairro = null,
        localidade = null,
        uf = null,
        ativo = true,
    } = {}) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
        this.cpf = cpf;
        this.cep = cep;
        this.logradouro = logradouro;
        this.bairro = bairro;
        this.localidade = localidade;
        this.uf = uf;
        this.ativo = ativo;
    }

    async criar() {
        return prisma.cliente.create({
            data: {
                nome: this.nome,
                telefone: this.telefone,
                email: this.email,
                cpf: this.cpf,
                cep: this.cep,
                logradouro: this.logradouro,
                bairro: this.bairro,
                localidade: this.localidade,
                uf: this.uf,
            },
        });
    }

    async atualizar(dados) {
        return prisma.cliente.update({
            where: { id: this.id },
            data: dados,
        });
    }

    // Regra de negócio
    // Não pode deletar cliente com pedido em status ABERTO
    async deletar() {
        const pedidosAbertos = await prisma.pedido.findFirst({
            where: {
                clienteId: this.id,
                status: 'ABERTO',
            },
        });

        if (pedidosAbertos) {
            throw new Error('Não pode deletar cliente com pedido em status ABERTO.');
        }

        return prisma.cliente.delete({ where: { id: this.id } });
    }

    // Nome obrigatório (3 a 100 caracteres)
    async validar() {
        if (!this.nome || this.nome.length < 3 || this.nome.length > 100) {
            throw new Error('Nome obrigatório (3 a 100 caracteres).');
        }

        // CPF com exatamente 11 dígitos numéricos

        // CPF único
        const cpfExistente = await prisma.cliente.findUnique({ where: { cpf: this.cpf } });
        if (cpfExistente && cpfExistente.id !== this.id) {
            throw new Error('CPF já cadastrado.');
        }

        // Telefone com 10 ou 11 dígitos numéricos

        // Email com formato válido

        // Email único
        const emailExistente = await prisma.cliente.findUnique({ where: { email: this.email } });
        if (emailExistente && emailExistente.id !== this.id) {
            throw new Error('Email já cadastrado.');
        }

        // CEP com exatamente 9 dígitos numéricos

        // Endereço preenchido automaticamente via ViaCEP
        if (!this.logradouro || !this.bairro || !this.localidade || !this.uf) {
            const endereco = await ClienteModel.buscarEnderecoPorCep(this.cep);
            if (!endereco) throw new Error('CEP inválido ou não encontrado no ViaCEP.');
            this.logradouro = endereco.logradouro;
            this.bairro = endereco.bairro;
            this.localidade = endereco.localidade;
            this.uf = endereco.uf;
        }
    }

    // Não pode criar pedido para cliente com ativo = false
    async criar() {
        const cliente = await prisma.cliente.findUnique({ where: { id: this.clienteId } });

        if (!cliente) {
            throw new Error('Cliente não encontrado.');
        }

        if (!cliente.ativo) {
            throw new Error('Não é permitido criar pedido para cliente inativo.');
        }

        return prisma.pedido.create({
            data: {
                clienteId: this.clienteId,
                status: this.status,
            },
        });
    }

    // Filtros
    static async buscarTodos(filtros = {}) {
        const where = {};
        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (filtros.cpf) where.cpf = filtros.cpf;
        if (filtros.ativo !== undefined) where.ativo = filtros.ativo === 'true';

        return prisma.cliente.findMany({ where, orderBy: { id: 'asc' } });
    }

    static async buscarPorId(id) {
        const data = await prisma.cliente.findUnique({ where: { id } });
        if (!data) return null;
        return new ClienteModel(data);
    }

    static async buscarEnderecoPorCep(cep) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            return data.erro ? null : data;
        } catch (error) {
            return { indisponivel: true };
        }
    }

    static async buscarCoordenadasPorCidade(cidade) {
        try {
            const cidadeCodificada = encodeURIComponent(cidade);
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${cidadeCodificada}&count=1&language=pt&countryCode=BR`,
            );

            if (!response.ok) return null;

            const data = await response.json();

            if (!data?.results?.length) return null;

            return {
                latitude: data.results[0].latitude,
                longitude: data.results[0].longitude,
            };
        } catch (error) {
            return null;
        }
    }

    static async buscarClimaAtual(latitude, longitude) {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&timezone=America/Sao_Paulo`,
            );

            if (!response.ok) return null;

            const data = await response.json();
            const temperatura = data?.current?.temperature_2m;
            const weathercode = data?.current?.weathercode;

            if (temperatura === undefined || weathercode === undefined) return null;

            return {
                temperatura,
                weathercode,
            };
        } catch (error) {
            return null;
        }
    }
}
