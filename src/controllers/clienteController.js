import ClienteModel from '../models/clienteModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { nome, telefone, email, cpf, cep } = req.body;

        if (!nome) return res.status(400).json({ error: 'O campo "nome" é obrigatório!' });
        if (!telefone) return res.status(400).json({ error: 'O campo "telefone" é obrigatório!' });
        if (!email) return res.status(400).json({ error: 'O campo "email" é obrigatório!' });
        if (!cpf) return res.status(400).json({ error: 'O campo "cpf" é obrigatório!' });

        const cliente = new ClienteModel({ nome, telefone, email, cpf, cep });

        if (cep) {
            try {
                const endereco = await ClienteModel.buscarEnderecoPorCep(cep);
                cliente.cep = endereco.cep;
                cliente.logradouro = endereco.logradouro;
                cliente.bairro = endereco.bairro;
                cliente.localidade = endereco.localidade;
                cliente.uf = endereco.uf;
            } catch (err) {
                return res.status(400).json({ error: `CEP inválido: ${err.message}` });
            }
        }

        const data = await cliente.criar();

        res.status(201).json({ message: 'Cliente criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        res.status(500).json({ error: 'Erro interno ao salvar o cliente.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await ClienteModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum cliente encontrado.' });
        }

        res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        res.status(500).json({ error: 'Erro ao buscar clientes.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const cliente = await ClienteModel.buscarPorId(parseInt(id));

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        res.json({ data: cliente });
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({ error: 'Erro ao buscar cliente.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const cliente = await ClienteModel.buscarPorId(parseInt(id));

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado para atualizar.' });
        }

        if (req.body.nome !== undefined) cliente.nome = req.body.nome;
        if (req.body.telefone !== undefined) cliente.telefone = req.body.telefone;
        if (req.body.email !== undefined) cliente.email = req.body.email;
        if (req.body.cpf !== undefined) cliente.cpf = req.body.cpf;
        if (req.body.cep !== undefined) {
            try {
                const endereco = await ClienteModel.buscarEnderecoPorCep(req.body.cep);
                cliente.cep = endereco.cep;
                cliente.logradouro = endereco.logradouro;
                cliente.bairro = endereco.bairro;
                cliente.localidade = endereco.localidade;
                cliente.uf = endereco.uf;
            } catch (err) {
                return res.status(400).json({ error: `CEP inválido: ${err.message}` });
            }
        }
        if (req.body.ativo !== undefined) cliente.ativo = req.body.ativo;

        const data = await cliente.atualizar();

        res.json({ message: `Cliente "${data.nome}" atualizado com sucesso!`, data });
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ error: 'Erro ao atualizar cliente.' });
    }
};

export const buscarEnderecoPorCep = async (req, res) => {
    try {
        const { cep } = req.params;

        if (!cep || cep.length !== 8 || isNaN(cep)) {
            return res.status(400).json({ error: 'CEP inválido. Informe 8 dígitos numéricos.' });
        }

        const endereco = await ClienteModel.buscarEnderecoPorCep(cep);
        res.json({ data: endereco });
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        res.status(404).json({ error: error.message });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const cliente = await ClienteModel.buscarPorId(parseInt(id));

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado para deletar.' });
        }

        await cliente.deletar();

        res.json({ message: `Cliente "${cliente.nome}" deletado com sucesso!`, deletado: cliente });
    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        res.status(500).json({ error: 'Erro ao deletar cliente.' });
    }
};
