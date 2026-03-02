import ClienteModel from '../models/ClienteModel.js';

const buscarEnderecoPorCep = async (cep) => {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    return data.erro ? null : data;
};

export const criar = async (req, res) => {
    try {
        const { nome, telefone, email, cpf, cep } = req.body;

        if (!nome)
            return res.status(400).json({ error: true, message: 'O campo "nome" é obrigatório.' });

        if (!telefone)
            return res
                .status(400)
                .json({ error: true, message: 'O campo "telefone" é obrigatório.' });

        if (!email)
            return res.status(400).json({ error: true, message: 'O campo "email" é obrigatório.' });

        if (!cpf)
            return res.status(400).json({ error: true, message: 'O campo "cpf" é obrigatório.' });

        if (!nome)
            return res.status(400).json({ error: true, message: 'O campo "nome" é obrigatório.' });

        if (cpf.length !== 11)
            return res.status(400).json({
                error: true,
                message: 'O campo "cpf" deve conter exatamente onze (11) carácteres',
            });

        if (cep.length !== 8)
            return res.status(400).json({
                error: true,
                message: 'O campo "cep" deve conter exatamente oito (8) carácteres.',
            });

        if (data.telefone === telefone)
            return res
                .status(400)
                .json({ error: true, message: 'O telefone informado já está cadastrado.' });

        let endereco = {};
        if (cep) {
            endereco = await buscarEnderecoPorCep(cep);
            if (!endereco) return res.status(400).json({ error: true, message: 'CEP inválido.' });
        }

        const cliente = new ClienteModel({
            nome,
            telefone,
            email,
            cpf,
            cep: cep ? String(cep) : null,
            logradouro: endereco.logradouro || null,
            bairro: endereco.bairro || null,
            localidade: endereco.localidade || null,
            uf: endereco.uf || null,
        });

        const registro = await cliente.criar();

        return res.status(201).json({
            error: false,
            message: 'Cliente cadastrado com sucesso!',
            data: registro,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Erro interno no servidor.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const { nome, cpf, ativo } = req.query;

        const registros = await ClienteModel.buscarTodos({ nome, cpf, ativo });

        return res.status(200).json({
            error: false,
            data: registros,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Erro ao buscar clientes.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) return res.status(400).json({ error: true, message: 'ID inválido.' });

        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente)
            return res.status(404).json({ error: true, message: 'Cliente não encontrado.' });

        return res.status(200).json({
            error: false,
            data: cliente,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Erro ao buscar cliente.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) return res.status(400).json({ error: true, message: 'ID inválido.' });

        const { nome, telefone, email, cpf, cep, ativo } = req.body;

        const dados = {};

        if (nome) dados.nome = nome;
        if (telefone) dados.telefone = telefone;
        if (email) dados.email = email;
        if (cpf) dados.cpf = cpf;
        if (ativo !== undefined) dados.ativo = ativo;

        if (cep) {
            const endereco = await buscarEnderecoPorCep(cep);

            if (!endereco) return res.status(400).json({ error: true, message: 'CEP inválido.' });

            dados.cep = String(cep);
            dados.logradouro = endereco.logradouro || null;
            dados.bairro = endereco.bairro || null;
            dados.localidade = endereco.localidade || null;
            dados.uf = endereco.uf || null;
        }

        if (!Object.keys(dados).length)
            return res.status(400).json({
                error: true,
                message: 'Nenhum campo enviado para atualização.',
            });

        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente)
            return res.status(404).json({ error: true, message: 'Cliente não encontrado.' });

        return res.status(200).json({
            error: false,
            message: 'Cliente atualizado com sucesso!',
            data,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Erro ao atualizar cliente.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) return res.status(400).json({ error: true, message: 'ID inválido.' });

        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente)
            return res.status(404).json({ error: true, message: 'Cliente não encontrado.' });

        if ((cliente.ativo = true))
            return res
                .status(404)
                .json({ error: true, message: 'O cliente não pode ser excluído pois está ativo' });

        await cliente.deletar();

        return res.status(200).json({
            error: false,
            message: 'Cliente removido com sucesso.',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Erro ao deletar cliente.' });
    }
};
