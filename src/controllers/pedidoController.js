import PedidoModel from '../models/pedidoModel.js';
import ClienteModel from '../models/ClienteModel.js';

const statusValidos = ['ABERTO', 'PAGO', 'CANCELADO'];

export const criar = async (req, res) => {
    try {
        const { clienteId } = req.body;

        if (!clienteId)
            return res
                .status(400)
                .json({ error: true, message: 'O campo "clienteId" é obrigatório.' });

        const cliente = await ClienteModel.buscarPorId(Number(clienteId));

        if (!cliente)
            return res.status(404).json({ error: true, message: 'Cliente não encontrado.' });

        if (!cliente.ativo)
            return res.status(400).json({
                error: true,
                message: 'Não é possível criar pedido para um cliente inativo.',
            });

        const pedido = new PedidoModel({ clienteId: Number(clienteId) });
        const registro = await pedido.criar();

        return res.status(201).json({
            error: false,
            message: 'Pedido criado com sucesso!',
            data: registro,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Erro interno no servidor.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const { clienteId, status } = req.query;

        if (status && !statusValidos.includes(status))
            return res.status(400).json({
                error: true,
                message: 'Status inválido. Use: ABERTO, PAGO ou CANCELADO.',
            });

        const registros = await PedidoModel.buscarTodos({ clienteId, status });

        return res.status(200).json({
            error: false,
            data: registros,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Erro ao buscar pedidos.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) return res.status(400).json({ error: true, message: 'ID inválido.' });

        const pedido = await PedidoModel.buscarPorId(id);

        if (!pedido)
            return res.status(404).json({ error: true, message: 'Pedido não encontrado.' });

        return res.status(200).json({
            error: false,
            data: pedido,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Erro ao buscar pedido.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) return res.status(400).json({ error: true, message: 'ID inválido.' });

        const { status } = req.body;

        if (!status)
            return res
                .status(400)
                .json({ error: true, message: 'O campo "status" é obrigatório.' });

        if (!statusValidos.includes(status))
            return res.status(400).json({
                error: true,
                message: 'Status inválido. Use: ABERTO, PAGO ou CANCELADO.',
            });

        const pedido = await PedidoModel.buscarPorId(id);

        if (!pedido)
            return res.status(404).json({ error: true, message: 'Pedido não encontrado.' });

        if (pedido.status === 'PAGO')
            return res.status(400).json({
                error: true,
                message: 'Não é possível alterar um pedido já pago.',
            });

        if (pedido.status === 'CANCELADO')
            return res.status(400).json({
                error: true,
                message: 'Não é possível alterar um pedido cancelado.',
            });

        const registro = await pedido.atualizar({ status });

        return res.status(200).json({
            error: false,
            message: 'Pedido atualizado com sucesso!',
            data: registro,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Erro ao atualizar pedido.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) return res.status(400).json({ error: true, message: 'ID inválido.' });

        const pedido = await PedidoModel.buscarPorId(id);

        if (!pedido)
            return res.status(404).json({ error: true, message: 'Pedido não encontrado.' });

        if (pedido.status === 'ABERTO')
            return res.status(400).json({
                error: true,
                message: 'Não é possível excluir um pedido com status ABERTO. Cancele-o primeiro.',
            });

        await pedido.deletar();

        return res.status(200).json({
            error: false,
            message: 'Pedido removido com sucesso.',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Erro ao deletar pedido.' });
    }
};
