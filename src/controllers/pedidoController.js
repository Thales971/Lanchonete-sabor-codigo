import PedidoModel from '../models/pedidoModel.js';

export const criar = async (req, res) => {
    try {
        const { clienteId } = req.body;

        if (!clienteId) return res.status(400).json({ erro: "O campo 'clienteId' é obrigatório." });

        const pedido = new PedidoModel({ clienteId: Number(clienteId) });
        const registro = await pedido.criar();

        if (registro.erro) {
            const status = registro.erro.includes('não encontrado') ? 404 : 400;
            return res.status(status).json({ erro: registro.erro });
        }

        return res.status(201).json(registro);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const { clienteId, status } = req.query;

        const erroStatus = PedidoModel.validarStatus(status);
        if (erroStatus) return res.status(400).json({ erro: erroStatus });

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

        const registro = await pedido.cancelar();

        if (registro.erro) return res.status(400).json({ erro: registro.erro });

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

        const resultado = await pedido.deletar();

        if (resultado.erro) return res.status(400).json({ erro: resultado.erro });

        return res.status(200).json({ mensagem: 'Pedido removido com sucesso.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao deletar pedido.' });
    }
};
