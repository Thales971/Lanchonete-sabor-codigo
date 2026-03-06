import ProdutoModel from '../models/ProdutoModel.js';

const categoriasValidas = ['LANCHE', 'BEBIDA', 'SOBREMESA', 'COMBO'];

export const criar = async (req, res) => {
    try {
        const { nome, descricao, categoria, preco, disponivel = true } = req.body;

        if (!nome) return res.status(400).json({ erro: "O campo 'nome' é obrigatório." });
        if (nome.length < 3)
            return res
                .status(400)
                .json({ erro: "O campo 'nome' deve ter no mínimo 3 caracteres." });

        if (descricao !== undefined && descricao !== null && String(descricao).length > 255) {
            return res
                .status(400)
                .json({ erro: "O campo 'descricao' deve ter no máximo 255 caracteres." });
        }

        if (!categoria || !categoriasValidas.includes(categoria)) {
            return res.status(400).json({
                erro: 'Categoria inválida. Use: LANCHE, BEBIDA, SOBREMESA ou COMBO.',
            });
        }

        if (preco === undefined || preco === null)
            return res.status(400).json({ erro: "O campo 'preco' é obrigatório." });

        const precoNum = parseFloat(preco);
        if (isNaN(precoNum) || precoNum <= 0)
            return res.status(400).json({ erro: 'Preco deve ser maior que 0.' });

        const partes = String(preco).split('.');
        if (partes[1] && partes[1].length > 2)
            return res.status(400).json({ erro: 'Preco deve ter no máximo 2 casas decimais.' });

        const produto = new ProdutoModel({
            nome,
            descricao: descricao || null,
            categoria,
            preco: precoNum,
            disponivel,
        });
        const registro = await produto.criar();

        return res.status(201).json(registro);
    } catch (error) {
        if (error.message === 'PRECO_INVALIDO') {
            return res.status(400).json({ erro: 'Preco deve ser maior que 0.' });
        }
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
            if (!nome || nome.length < 3)
                return res
                    .status(400)
                    .json({ erro: "O campo 'nome' deve ter no mínimo 3 caracteres." });
            dados.nome = nome;
        }
        if (descricao !== undefined) {
            if (descricao !== null && String(descricao).length > 255) {
                return res
                    .status(400)
                    .json({ erro: "O campo 'descricao' deve ter no máximo 255 caracteres." });
            }
            dados.descricao = descricao || null;
        }
        if (categoria !== undefined) {
            if (!categoriasValidas.includes(categoria)) {
                return res
                    .status(400)
                    .json({ erro: 'Categoria inválida. Use: LANCHE, BEBIDA, SOBREMESA ou COMBO.' });
            }
            dados.categoria = categoria;
        }
        if (preco !== undefined) {
            const precoNum = parseFloat(preco);
            if (isNaN(precoNum) || precoNum <= 0)
                return res.status(400).json({ erro: 'Preco deve ser maior que 0.' });
            const partes = String(preco).split('.');
            if (partes[1] && partes[1].length > 2)
                return res.status(400).json({ erro: 'Preco deve ter no máximo 2 casas decimais.' });
            dados.preco = precoNum;
        }
        if (disponivel !== undefined) dados.disponivel = disponivel;

        if (Object.keys(dados).length === 0) {
            return res.status(400).json({ erro: 'Nenhum campo enviado para atualização.' });
        }

        const registro = await produto.atualizar(dados);

        return res.status(200).json(registro);
    } catch (error) {
        if (error.message === 'PRECO_INVALIDO') {
            return res.status(400).json({ erro: 'Preco deve ser maior que 0.' });
        }
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

        await produto.deletar();

        return res.status(200).json({ mensagem: 'Produto removido com sucesso.' });
    } catch (error) {
        if (error.message === 'PRODUTO_EM_PEDIDO_ABERTO') {
            return res
                .status(400)
                .json({ erro: 'Não pode deletar produto vinculado a pedido ABERTO.' });
        }
        console.error('Erro ao deletar:', error);
        return res.status(500).json({ erro: 'Erro ao deletar registro.' });
    }
};
