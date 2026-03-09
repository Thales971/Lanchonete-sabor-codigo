import ClienteModel from '../models/ClienteModel.js';

export const criar = async (req, res) => {
    try {
        const nome = ClienteModel.normalizarTexto(req.body.nome);
        const telefone = ClienteModel.normalizarTexto(req.body.telefone);
        const email = ClienteModel.normalizarTexto(req.body.email)?.toLowerCase();
        const cpf = ClienteModel.normalizarTexto(req.body.cpf);
        const cep = ClienteModel.normalizarTexto(req.body.cep);

        const cliente = new ClienteModel({ nome, telefone, email, cpf, cep });

        const erroValidacao = cliente.validarCriacao();
        if (erroValidacao) return res.status(400).json({ erro: erroValidacao });

        let endereco = {};
        if (cep) {
            endereco = await ClienteModel.buscarEnderecoPorCep(cep);
            if (endereco && endereco.indisponivel)
                return res.status(400).json({ erro: 'Serviço ViaCEP indisponível no momento.' });
            if (!endereco) return res.status(400).json({ erro: `CEP ${cep} não encontrado.` });
        }

        cliente.cep = cep ? String(cep) : null;
        cliente.logradouro = endereco.logradouro || null;
        cliente.bairro = endereco.bairro || null;
        cliente.localidade = endereco.localidade || null;
        cliente.uf = endereco.uf || null;

        const registro = await cliente.criar();

        return res.status(201).json(registro);
    } catch (error) {
        if (error.code === 'P2002') {
            if (error.meta.target.includes('cpf')) {
                return res.status(400).json({ erro: 'CPF já cadastrado no sistema.' });
            }
            if (error.meta.target.includes('telefone')) {
                return res.status(400).json({ erro: 'Telefone já cadastrado para outro cliente.' });
            }
            if (error.meta.target.includes('email')) {
                return res.status(400).json({ erro: 'Email já cadastrado no sistema.' });
            }
        }
        console.error(error);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
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

        if (isNaN(id))
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });

        return res.status(200).json(cliente);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao buscar cliente.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id))
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const nome = ClienteModel.normalizarTexto(req.body.nome);
        const telefone = ClienteModel.normalizarTexto(req.body.telefone);
        const email = ClienteModel.normalizarTexto(req.body.email)?.toLowerCase();
        const cpf = ClienteModel.normalizarTexto(req.body.cpf);
        const cep = ClienteModel.normalizarTexto(req.body.cep);
        const { ativo } = req.body;

        const dados = {};

        if (nome !== undefined) {
            const erroNome = ClienteModel.validarNome(nome);
            if (erroNome) return res.status(400).json({ erro: erroNome });
            dados.nome = nome;
        }
        if (telefone !== undefined) {
            const erroTelefone = ClienteModel.validarTelefone(telefone);
            if (erroTelefone) return res.status(400).json({ erro: erroTelefone });
            dados.telefone = telefone;
        }
        if (email !== undefined) {
            const erroEmail = ClienteModel.validarEmail(email);
            if (erroEmail) return res.status(400).json({ erro: erroEmail });
            dados.email = email;
        }
        if (cpf !== undefined) {
            const erroCpf = ClienteModel.validarCpf(cpf);
            if (erroCpf) return res.status(400).json({ erro: erroCpf });
            dados.cpf = cpf;
        }
        if (ativo !== undefined) dados.ativo = ativo;

        if (cep !== undefined) {
            const erroCep = ClienteModel.validarCep(cep);
            if (erroCep) return res.status(400).json({ erro: erroCep });

            if (!cep) {
                dados.cep = null;
                dados.logradouro = null;
                dados.bairro = null;
                dados.localidade = null;
                dados.uf = null;
            } else {
                const endereco = await ClienteModel.buscarEnderecoPorCep(cep);

                if (endereco && endereco.indisponivel)
                    return res
                        .status(400)
                        .json({ erro: 'Serviço ViaCEP indisponível no momento.' });
                if (!endereco) return res.status(400).json({ erro: `CEP ${cep} não encontrado.` });

                dados.cep = String(cep);
                dados.logradouro = endereco.logradouro || null;
                dados.bairro = endereco.bairro || null;
                dados.localidade = endereco.localidade || null;
                dados.uf = endereco.uf || null;
            }
        }

        if (!Object.keys(dados).length)
            return res.status(400).json({
                erro: 'Nenhum campo enviado para atualização.',
            });

        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });

        const dataAtualizado = await cliente.atualizar(dados);

        return res.status(200).json(dataAtualizado);
    } catch (error) {
        if (error.code === 'P2002') {
            if (error.meta.target.includes('cpf')) {
                return res.status(400).json({ erro: 'CPF já cadastrado no sistema.' });
            }
            if (error.meta.target.includes('telefone')) {
                return res.status(400).json({ erro: 'Telefone já cadastrado para outro cliente.' });
            }
            if (error.meta.target.includes('email')) {
                return res.status(400).json({ erro: 'Email já cadastrado no sistema.' });
            }
        }
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao atualizar cliente.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id))
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });

        const resultado = await cliente.deletar();

        if (resultado.erro) return res.status(400).json({ erro: resultado.erro });

        return res.status(200).json({ mensagem: 'Cliente removido com sucesso.' });
    } catch (error) {
        if (error.code === 'P2003') {
            return res
                .status(400)
                .json({ erro: 'Não é possível excluir o cliente. Existem registros vinculados.' });
        }
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao deletar cliente.' });
    }
};

export const buscarClima = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }

        const cliente = await ClienteModel.buscarPorId(id);

        if (!cliente) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' });
        }

        if (!cliente.cep || !/^\d{8}$/.test(cliente.cep)) {
            return res
                .status(400)
                .json({ erro: 'CEP deve conter exatamente 8 dígitos numéricos.' });
        }

        const endereco = await ClienteModel.buscarEnderecoPorCep(cliente.cep);

        if (endereco?.indisponivel) {
            return res.status(400).json({ erro: 'Serviço ViaCEP indisponível no momento.' });
        }

        if (!endereco || !endereco.localidade) {
            return res.status(400).json({ erro: `CEP ${cliente.cep} não encontrado.` });
        }

        const coordenadas = await ClienteModel.buscarCoordenadasPorCidade(endereco.localidade);

        if (!coordenadas) {
            return res.status(200).json({
                clienteId: cliente.id,
                cidade: endereco.localidade,
                clima: null,
            });
        }

        const climaAtual = await ClienteModel.buscarClimaAtual(
            coordenadas.latitude,
            coordenadas.longitude,
        );

        if (!climaAtual) {
            return res.status(200).json({
                clienteId: cliente.id,
                cidade: endereco.localidade,
                clima: null,
            });
        }

        const chove = ClienteModel.codigosChuva.has(climaAtual.weathercode);
        const quente = climaAtual.temperatura >= 28;

        return res.status(200).json({
            clienteId: cliente.id,
            cidade: endereco.localidade,
            clima: {
                temperatura: Number(climaAtual.temperatura),
                chove,
                quente,
                sugestao: ClienteModel.montarSugestaoClima(Number(climaAtual.temperatura), chove),
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao consultar clima do cliente.' });
    }
};
