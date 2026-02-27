import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Resetando tabelas Cliente e Produto...');

    // Remove todos os registros existentes
    await prisma.Cliente.deleteMany();
    await prisma.Produto.deleteMany();

    console.log('📦 Inserindo novos registros de clientes e produtos...');

    await prisma.Cliente.createMany({
        data: [
            {
                nome: 'Ana Silva',
                telefone: '11987654321',
                email: 'ana.silva@example.com',
                cpf: '12345678901',
            },
            {
                nome: 'Bruno Costa',
                telefone: '21912345678',
                email: 'bruno.costa@example.com',
                cpf: '23456789012',
            },
            {
                nome: 'Carla Souza',
                telefone: '31998765432',
                email: 'carla.souza@example.com',
                cpf: '34567890123',
            },
            {
                nome: 'Daniel Pereira',
                telefone: '41912398765',
                email: 'daniel.pereira@example.com',
                cpf: '45678901234',
            },
            {
                nome: 'Eva Rodrigues',
                telefone: '51987612345',
                email: 'eva.rodrigues@example.com',
                cpf: '56789012345',
            },
        ],
    });

    await prisma.Produto.createMany({
        data: [
            {
                nome: 'X-Burguer',
                descricao: 'Hambúrguer com queijo e alface',
                categoria: 'LANCHE',
                preco: 15.5,
            },
            {
                nome: 'Refrigerante 350ml',
                descricao: 'Bebida gaseificada',
                categoria: 'BEBIDA',
                preco: 5.0,
            },
            {
                nome: 'Sorvete 2 bolas',
                descricao: 'Sorvete de creme e chocolate',
                categoria: 'SOBREMESA',
                preco: 8.0,
            },
            {
                nome: 'Combo Família',
                descricao: '4 lanches + 4 bebidas',
                categoria: 'COMBOS',
                preco: 60.0,
            },
            {
                nome: 'Salada',
                descricao: 'Mix de folhas verdes',
                categoria: 'LANCHE',
                preco: 12.0
            },
        ],
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
