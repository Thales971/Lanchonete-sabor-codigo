import ProdutoModel from '../models/ProdutoModel.js';

const categoriasValidas = ['LANCHE', 'BEBIDA', 'SOBREMESA', 'COMBO'];

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { nome, descricao, categoria, preco, disponivel = true } = req.body;

        if (!nome) return res.status(400).json({ error: 'O campo "nome" é obrigatório!' });

        if (!descricao) return res.status(400).json({ error: 'O campo "descrição" é obrigatório!' });

        if (!categoria || !categoriasValidas.includes(categoria)) {
            return res.status(400).json({
                error: 'Categoria inválida. Use: LANCHE, BEBIDA, SOBREMESA ou COMBO'
            });
        }

        if (preco === undefined || preco === null) return res.status(400).json({ error: 'O campo "preco" é obrigatório!' });

        const produto = new ProdutoModel({
            nome,
            descricao,
            categoria,
            preco: parseFloat(preco),
            disponivel
        });
        const data = await produto.criar();

        res.status(201).json({ message: 'Registro criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);
        res.status(500).json({ error: 'Erro interno ao salvar o registro.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await ProdutoModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum registro encontrado.' });
        }

        res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const produto = await ProdutoModel.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ error: 'Registro não encontrado.' });
        }

        res.json({ data: produto });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registro.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const produto = await ProdutoModel.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ error: 'Registro não encontrado para atualizar.' });
        }

        const { nome, descricao, categoria, preco, disponivel } = req.body;

        if (nome !== undefined) produto.nome = nome;
        if (descricao !== undefined) produto.descricao = descricao;
        if (categoria !== undefined) produto.categoria = categoria;
        if (preco !== undefined) produto.preco = parseFloat(preco);
        if (disponivel !== undefined) produto.disponivel = disponivel;

        const data = await produto.atualizar();

        res.json({ message: `O registro "${data.nome}" foi atualizado com sucesso!`, data });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const produto = await ProdutoModel.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }

        await produto.deletar();

        res.json({ message: `O registro "${produto.nome}" foi deletado com sucesso!`, deletado: produto });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
