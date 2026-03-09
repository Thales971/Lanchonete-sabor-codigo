import 'dotenv/config';

const autenticar = (req, res, next) => {
    const chave = req.headers['x-api-key'];

    if (!chave || chave !== process.env.API_SABOR) {
        return res.status(401).json({ error: 'Acesso não autorizado. Chave de API inválida' });
    }

    next();
};

export default autenticar;