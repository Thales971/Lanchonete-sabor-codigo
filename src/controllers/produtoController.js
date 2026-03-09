import ProdutoModel from '../models/ProdutoModel.js';

export const criar = async (req, res) => {
    try {
        const { nome, descricao, categoria, preco, disponivel = true } = req.body;

        const produto = new ProdutoModel({
            nome,
            descricao: descricao || null,
            categoria,
            preco,
            disponivel,
        });

        const erroValidacao = produto.validarCriacao();
        if (erroValidacao) return res.status(400).json({ erro: erroValidacao });

        const registro = await produto.criar();

        return res.status(201).json(registro);
    } catch (error) {
        console.error('Erro ao criar:', error);
        return res.status(500).json({ erro: 'Erro interno ao salvar o registro.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await ProdutoModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ mensagem: 'Nenhum produto encontrado.' });
        }

        return res.status(200).json(registros);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        return res.status(500).json({ erro: 'Erro ao buscar registros.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (Number.isNaN(Number(id))) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }

        const produto = await ProdutoModel.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ erro: 'Produto não encontrado.' });
        }

        return res.status(200).json(produto);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        return res.status(500).json({ erro: 'Erro ao buscar registro.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (Number.isNaN(Number(id)))
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const produto = await ProdutoModel.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ erro: 'Produto não encontrado.' });
        }

        const { nome, descricao, categoria, preco, disponivel } = req.body;
        const dados = {};

        if (nome !== undefined) {
            const erroNome = ProdutoModel.validarNome(nome);
            if (erroNome) return res.status(400).json({ erro: erroNome });
            dados.nome = nome;
        }
        if (descricao !== undefined) {
            const erroDescricao = ProdutoModel.validarDescricao(descricao);
            if (erroDescricao) return res.status(400).json({ erro: erroDescricao });
            dados.descricao = descricao || null;
        }
        if (categoria !== undefined) {
            const erroCategoria = ProdutoModel.validarCategoria(categoria);
            if (erroCategoria) return res.status(400).json({ erro: erroCategoria });
            dados.categoria = categoria;
        }
        if (preco !== undefined) {
            const erroPreco = ProdutoModel.validarPreco(preco);
            if (erroPreco) return res.status(400).json({ erro: erroPreco });
            dados.preco = parseFloat(preco);
        }
        if (disponivel !== undefined) dados.disponivel = disponivel;

        if (Object.keys(dados).length === 0) {
            return res.status(400).json({ erro: 'Nenhum campo enviado para atualização.' });
        }

        const registro = await produto.atualizar(dados);

        if (registro.erro) return res.status(400).json({ erro: registro.erro });

        return res.status(200).json(registro);
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        return res.status(500).json({ erro: 'Erro ao atualizar registro.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (Number.isNaN(Number(id)))
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const produto = await ProdutoModel.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ erro: 'Produto não encontrado.' });
        }

        const resultado = await produto.deletar();

        if (resultado.erro) return res.status(400).json({ erro: resultado.erro });

        return res.status(200).json({ mensagem: 'Produto removido com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        return res.status(500).json({ erro: 'Erro ao deletar registro.' });
    }
};
