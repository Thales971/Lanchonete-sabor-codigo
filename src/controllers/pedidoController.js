import PedidoModel from '../models/PedidoModel.js';
import ClienteModel from '../models/ClienteModel.js';

const statusValidos = ['ABERTO', 'PAGO', 'CANCELADO'];

export const criar = async (req, res) => {
    try {
        const { clienteId } = req.body;

        if (!clienteId) return res.status(400).json({ erro: "O campo 'clienteId' é obrigatório." });

        const cliente = await ClienteModel.buscarPorId(Number(clienteId));

        if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });

        if (!cliente.ativo)
            return res
                .status(400)
                .json({ erro: 'Não é possível criar pedido para um cliente inativo.' });

        if (cliente.statusValidos !== 'ABERTO')
            return res.status(400).json({ erro: 'O status de Criação precisa ser ABERTO para a criação.' });


        const pedido = new PedidoModel({ clienteId: Number(clienteId) });
        const registro = await pedido.criar();

        return res.status(201).json(registro);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const { clienteId, status } = req.query;

        if (status && !statusValidos.includes(status))
            return res.status(400).json({
                erro: 'Status inválido. Use: ABERTO, PAGO ou CANCELADO.',
            });

        const registros = await PedidoModel.buscarTodos({ clienteId, status });

        if (registros.length === 0) {
            return res.status(200).json({ mensagem: 'Nenhum pedido encontrado.' });
        }

        return res.status(200).json(registros);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao buscar pedidos.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id))
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const pedido = await PedidoModel.buscarPorId(id);

        if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

        return res.status(200).json(pedido);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao buscar pedido.' });
    }
};

export const cancelar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id))
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const pedido = await PedidoModel.buscarPorId(id);

        if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

        if (pedido.status !== 'ABERTO') {
            return res
                .status(400)
                .json({ erro: 'Só é possível cancelar pedidos com status ABERTO.' });
        }

        const registro = await pedido.atualizar({ status: 'CANCELADO' });

        return res.status(200).json(registro);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao cancelar pedido.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id))
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });

        const pedido = await PedidoModel.buscarPorId(id);

        if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

        if (pedido.status === 'ABERTO')
            return res.status(400).json({
                erro: 'Não é possível excluir um pedido com status ABERTO. Cancele-o primeiro.',
            });

        await pedido.deletar();

        return res.status(200).json({ mensagem: 'Pedido removido com sucesso.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao deletar pedido.' });
    }
};

