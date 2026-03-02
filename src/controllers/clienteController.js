import ClienteModel from '../models/ClienteModel.js';

export const criar = async (req, res) => {
    try {
        const { nome, telefone, email, cpf, cep } = req.body;

        if (!nome)
            return res.status(400).json({ erro: "O campo 'nome' é obrigatório." });

        if (!telefone)
            return res.status(400).json({ erro: "O campo 'telefone' é obrigatório." });

        if (!email)
            return res.status(400).json({ erro: "O campo 'email' é obrigatório." });

        if (!cpf)
            return res.status(400).json({ erro: "O campo 'cpf' é obrigatório." });

        if (cpf.length !== 11)
            return res.status(400).json({ erro: "O campo 'cpf' deve conter exatamente 11 dígitos numéricos." });

        if (cep && cep.length !== 8)
            return res.status(400).json({ erro: "CEP deve conter exatamente 8 dígitos numéricos." });

        let endereco = {};
        if (cep) {
            endereco = await ClienteModel.buscarEnderecoPorCep(cep);
            if (endereco && endereco.indisponivel) return res.status(400).json({ erro: "Serviço ViaCEP indisponível no momento." });
            if (!endereco) return res.status(400).json({ erro: `CEP ${cep} não encontrado.` });
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

        return res.status(201).json(registro);
    } catch (error) {
        if (error.code === 'P2002') {
            if (error.meta.target.includes('cpf')) {
                return res.status(400).json({ erro: "CPF já cadastrado no sistema." });
            }
            if (error.meta.target.includes('telefone')) {
                return res.status(400).json({ erro: "Telefone já cadastrado para outro cliente." });
            }
        }
        console.error(error);
        return res.status(500).json({ erro: "Erro interno no servidor." });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const { nome, cpf, ativo } = req.query;

        const registros = await ClienteModel.buscarTodos({ nome, cpf, ativo });

        if (registros.length === 0) {
            return res.status(200).json({ mensagem: 'Nenhum cliente encontrado.' });
        }

        return res.status(200).json(registros);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao buscar clientes.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente)
            return res.status(404).json({ erro: 'Cliente não encontrado.' });

        return res.status(200).json(cliente);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao buscar cliente.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const { nome, telefone, email, cpf, cep, ativo } = req.body;

        const dados = {};

        if (nome) dados.nome = nome;
        if (telefone) dados.telefone = telefone;
        if (email) dados.email = email;
        if (cpf) dados.cpf = cpf;
        if (ativo !== undefined) dados.ativo = ativo;

        if (cep) {
            if (cep.length !== 8) {
                return res.status(400).json({ erro: 'CEP deve conter exatamente 8 dígitos numéricos.' });
            }
            const endereco = await ClienteModel.buscarEnderecoPorCep(cep);

            if (endereco && endereco.indisponivel) return res.status(400).json({ erro: 'Serviço ViaCEP indisponível no momento.' });
            if (!endereco) return res.status(400).json({ erro: `CEP ${cep} não encontrado.` });

            dados.cep = String(cep);
            dados.logradouro = endereco.logradouro || null;
            dados.bairro = endereco.bairro || null;
            dados.localidade = endereco.localidade || null;
            dados.uf = endereco.uf || null;
        }

        if (!Object.keys(dados).length)
            return res.status(400).json({
                erro: 'Nenhum campo enviado para atualização.',
            });

        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente)
            return res.status(404).json({ erro: 'Cliente não encontrado.' });

        const dataAtualizado = await cliente.atualizar(dados);

        return res.status(200).json(dataAtualizado);
    } catch (error) {
        if (error.code === 'P2002') {
            if (error.meta.target.includes('cpf')) {
                return res.status(400).json({ erro: "CPF já cadastrado no sistema." });
            }
            if (error.meta.target.includes('telefone')) {
                return res.status(400).json({ erro: "Telefone já cadastrado para outro cliente." });
            }
        }
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao atualizar cliente.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente)
            return res.status(404).json({ erro: 'Cliente não encontrado.' });

        // Regra de negócio implementada no model: não pode deletar cliente com pedido em status ABERTO

        await cliente.deletar();

        return res.status(200).json({ mensagem: 'Cliente removido com sucesso.' });
    } catch (error) {
        if (error.message === 'Não pode deletar cliente com pedido em status ABERTO.') {
            return res.status(400).json({ erro: error.message });
        }
        if (error.code === 'P2003') {
            return res.status(400).json({ erro: 'Não é possível excluir o cliente. Existem registros vinculados.' });
        }
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao deletar cliente.' });
    }
};
