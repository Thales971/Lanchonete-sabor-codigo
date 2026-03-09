import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Resetando tabelas...');

    await prisma.$executeRawUnsafe(`
        TRUNCATE TABLE "itemPedido", "pedidos", "cliente", "produtos"
        RESTART IDENTITY CASCADE;
    `);

    console.log('📦 Inserindo clientes...');

    await prisma.cliente.createMany({
        data: [
            {
                nome: 'João Silva',
                telefone: '11987654321',
                email: 'joao@email.com',
                cpf: '12345678901',
                cep: '01310100',
                logradouro: 'Avenida Paulista',
                bairro: 'Bela Vista',
                localidade: 'São Paulo',
                uf: 'SP',
            },
            {
                nome: 'Maria Santos',
                telefone: '21987654321',
                email: 'maria@email.com',
                cpf: '98765432100',
                cep: '20040020',
                logradouro: 'Rua da Assembleia',
                bairro: 'Centro',
                localidade: 'Rio de Janeiro',
                uf: 'RJ',
            },
            {
                nome: 'Pedro Oliveira',
                telefone: '31987654321',
                email: 'pedro@email.com',
                cpf: '45678912300',
                cep: '30130000',
                logradouro: 'Avenida Afonso Pena',
                bairro: 'Centro',
                localidade: 'Belo Horizonte',
                uf: 'MG',
            },
        ],
    });

    console.log('🍔 Inserindo produtos...');

    await prisma.produtos.createMany({
        data: [
            {
                nome: 'X-Burguer',
                descricao: 'Hambúrguer com queijo e alface',
                categoria: 'LANCHE',
                preco: 18.5,
            },
            {
                nome: 'Refrigerante 350ml',
                descricao: 'Bebida gaseificada gelada',
                categoria: 'BEBIDA',
                preco: 6.0,
            },
            {
                nome: 'Pudim de Leite',
                descricao: 'Pudim caseiro',
                categoria: 'SOBREMESA',
                preco: 7.5,
            },
        ],
    });

    const clientes = await prisma.cliente.findMany({ orderBy: { id: 'asc' } });
    const produtos = await prisma.produtos.findMany({ orderBy: { id: 'asc' } });

    console.log('🧾 Inserindo pedido e itens...');

    await prisma.pedidos.create({
        data: {
            clienteId: clientes[0].id,
            total: 24.5,
            status: 'ABERTO',
            itensPedidos: {
                create: [
                    {
                        produtoId: produtos[0].id,
                        quantidade: 1,
                        precoUnitario: produtos[0].preco,
                    },
                    {
                        produtoId: produtos[1].id,
                        quantidade: 1,
                        precoUnitario: produtos[1].preco,
                    },
                ],
            },
        },
    });

    console.log('✅ Seed concluído!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
