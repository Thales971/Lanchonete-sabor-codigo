import prisma from '../utils/prismaClient.js';

const codigosChuva = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);
const regexSomenteDigitos = /^\d+$/;
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    static normalizarTexto(valor) {
        return typeof valor === 'string' ? valor.trim() : valor;
    }

    static validarNome(nome) {
        if (!nome) return "O campo 'nome' é obrigatório.";
        if (nome.length < 3 || nome.length > 100) {
            return "O campo 'nome' deve conter entre 3 e 100 caracteres.";
        }
        return null;
    }

    static validarTelefone(telefone) {
        if (!telefone) return null;
        if (
            !regexSomenteDigitos.test(telefone) ||
            (telefone.length !== 10 && telefone.length !== 11)
        ) {
            return "O campo 'telefone' deve conter 10 ou 11 dígitos numéricos.";
        }
        return null;
    }

    static validarEmail(email) {
        if (!email) return null;
        if (!regexEmail.test(email)) return 'Email informado é inválido.';
        return null;
    }

    static validarCpf(cpf) {
        if (!cpf) return null;
        if (!regexSomenteDigitos.test(cpf) || cpf.length !== 11) {
            return 'CPF deve conter exatamente 11 dígitos numéricos.';
        }
        return null;
    }

    static validarCep(cep) {
        if (!cep) return null;
        if (!regexSomenteDigitos.test(cep) || cep.length !== 8) {
            return 'CEP deve conter exatamente 8 dígitos numéricos.';
        }
        return null;
    }

    validarCriacao() {
        return (
            ClienteModel.validarNome(this.nome) ||
            ClienteModel.validarTelefone(this.telefone) ||
            ClienteModel.validarEmail(this.email) ||
            ClienteModel.validarCpf(this.cpf) ||
            ClienteModel.validarCep(this.cep) ||
            null
        );
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

    async deletar() {
        const pedidosAbertos = await prisma.pedidos.findFirst({
            where: {
                clienteId: this.id,
                status: 'ABERTO',
            },
        });

        if (pedidosAbertos) {
            return { erro: 'Não pode deletar cliente com pedido em status ABERTO.' };
        }

        await prisma.cliente.delete({ where: { id: this.id } });
        return { sucesso: true };
    }

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

    static montarSugestaoClima(temperatura, chove) {
        if (chove) {
            return '🌧 Dia chuvoso! Ofereca promocoes para delivery.';
        }
        if (temperatura >= 28) {
            return '🌞 Dia quente! Destaque combos com bebida gelada.';
        }
        if (temperatura <= 18) {
            return '🥶 Dia frio! Destaque cafes e lanches quentes.';
        }
        return '🌤 Clima agradavel! Aproveite para divulgar combos da casa.';
    }

    static get codigosChuva() {
        return codigosChuva;
    }
}
