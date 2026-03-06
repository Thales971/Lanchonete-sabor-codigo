import ItemPedidoModel from '../models/itemPedidoModel.js';

export const criar = async (req, res) => {
    try {
        const { produtoId, quantidade } = req.body;
        const pedidoId = req.params.id ?? req.body.pedidoId;

        if (!pedidoId) return res.status(400).json({ erro: "O campo 'pedidoId' é obrigatório." });

        if (!produtoId) return res.status(400).json({ erro: "O campo 'produtoId' é obrigatório." });

        if (quantidade === undefined)
            return res.status(400).json({ erro: "O campo 'quantidade' é obrigatório." });

        const pedidoIdNumero = Number(pedidoId);
        const produtoIdNumero = Number(produtoId);
        const quantidadeNumero = Number(quantidade);

        if (Number.isNaN(pedidoIdNumero) || Number.isNaN(produtoIdNumero))
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0 || quantidadeNumero > 99)
            return res.status(400).json({ erro: 'Quantidade deve ser entre 1 e 99.' });

        const pedido = await ItemPedidoModel.buscarPedidoPorId(pedidoIdNumero);
        if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

        if (pedido.status !== 'ABERTO') {
            return res
                .status(400)
                .json({ erro: 'Não pode adicionar itens se o pedido estiver PAGO ou CANCELADO.' });
        }

        const produto = await ItemPedidoModel.buscarProdutoPorId(produtoIdNumero);
        if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });

        if (!produto.disponivel)
            return res
                .status(400)
                .json({ erro: 'Não pode adicionar produto com disponivel = false ao pedido.' });

        const itemPedido = new ItemPedidoModel({
            pedidoId: pedidoIdNumero,
            produtoId: produtoIdNumero,
            quantidade: quantidadeNumero,
            precoUnitario: produto.preco,
        });

        const registro = await itemPedido.criar();
        await ItemPedidoModel.recalcularTotalDoPedido(pedidoIdNumero);

        return res.status(201).json(registro);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const { pedidoId, produtoId, quantidade } = req.query;
        const registros = await ItemPedidoModel.buscarTodos({ pedidoId, produtoId, quantidade });

        if (registros.length === 0) {
            return res.status(200).json({ mensagem: 'Nenhum item de pedido encontrado.' });
        }

        return res.status(200).json(registros);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao buscar itens do pedido.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id))
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const itemPedido = await ItemPedidoModel.buscarPorId(id);
        if (!itemPedido) return res.status(404).json({ erro: 'Item do pedido não encontrado.' });

        return res.status(200).json(itemPedido);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao buscar item do pedido.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id))
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const { quantidade, produtoId } = req.body;

        const itemPedido = await ItemPedidoModel.buscarPorId(id);
        if (!itemPedido) return res.status(404).json({ erro: 'Item do pedido não encontrado.' });

        const pedido = await ItemPedidoModel.buscarPedidoPorId(itemPedido.pedidoId);
        if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

        if (pedido.status !== 'ABERTO') {
            return res
                .status(400)
                .json({ erro: 'Não pode adicionar itens se o pedido estiver PAGO ou CANCELADO.' });
        }

        const dadosAtualizacao = {};

        if (quantidade !== undefined) {
            const quantidadeNumero = Number(quantidade);
            if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0)
                return res.status(400).json({ erro: 'Quantidade deve ser maior que 0.' });
            dadosAtualizacao.quantidade = quantidadeNumero;
        }

        if (produtoId !== undefined) {
            const produtoIdNumero = Number(produtoId);
            if (Number.isNaN(produtoIdNumero))
                return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

            const produto = await ItemPedidoModel.buscarProdutoPorId(produtoIdNumero);
            if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });

            if (!produto.disponivel) {
                return res
                    .status(400)
                    .json({ erro: 'Não pode adicionar produto com disponivel = false ao pedido.' });
            }

            dadosAtualizacao.produtoId = produtoIdNumero;
            dadosAtualizacao.precoUnitario = produto.preco;
        }

        if (Object.keys(dadosAtualizacao).length === 0) {
            return res.status(400).json({ erro: 'Nenhum campo enviado para atualização.' });
        }

        const registro = await itemPedido.atualizar(dadosAtualizacao);
        await ItemPedidoModel.recalcularTotalDoPedido(itemPedido.pedidoId);

        return res.status(200).json(registro);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao atualizar item do pedido.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const pedidoIdDaRota = Number(req.params.id);
        const id = Number(req.params.itemId ?? req.params.id);

        if (Number.isNaN(id))
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        if (!Number.isNaN(pedidoIdDaRota) && pedidoIdDaRota <= 0)
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const itemPedido = await ItemPedidoModel.buscarPorId(id);
        if (!itemPedido) return res.status(404).json({ erro: 'Item do pedido não encontrado.' });

        const pedido = await ItemPedidoModel.buscarPedidoPorId(itemPedido.pedidoId);
        if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

        if (!Number.isNaN(pedidoIdDaRota) && pedidoIdDaRota !== itemPedido.pedidoId) {
            return res.status(404).json({ erro: 'Item do pedido não encontrado.' });
        }

        if (pedido.status !== 'ABERTO') {
            return res
                .status(400)
                .json({ erro: 'Não pode remover item de pedido PAGO ou CANCELADO.' });
        }

        await itemPedido.deletar();
        await ItemPedidoModel.recalcularTotalDoPedido(itemPedido.pedidoId);

        return res.status(200).json({ mensagem: 'Item do pedido removido com sucesso.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao remover item do pedido.' });
    }
};
