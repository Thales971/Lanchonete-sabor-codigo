import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient, TipoCategoria, TipoStatus } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Resetando tabelas Cliente e Produto...');

    // Remove todos os registros existentes
    //await prisma.itemPedido.deleteMany();
    //await prisma.pedido.deleteMany();
    //await prisma.produto.deleteMany();
    //await prisma.cliente.deleteMany();

    //se ja criado na máquina, retire as // acima

    console.log('📦 Inserindo novos registros de clientes e produtos...');

    await prisma.cliente.createMany({
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

    console.log('📦 Inserindo Produtos...')

    await prisma.produto.createMany({
        data: [
            {
                nome: 'X-Burguer',
                descricao: 'Hambúrguer com queijo e alface',
                categoria: TipoCategoria.LANCHE,
                preco: '15.5',
                disponivel: true
            },
            {
                nome: 'Refrigerante 350ml',
                descricao: 'Bebida gaseificada',
                categoria: TipoCategoria.BEBIDA,
                preco: '5',
                disponivel: true
            },
            {
                nome: 'Sorvete 2 bolas',
                descricao: 'Sorvete de creme e chocolate',
                categoria: TipoCategoria.SOBREMESA,
                preco: '8',
                disponivel: true
            },
            {
                nome: 'Combo Família',
                descricao: '4 lanches + 4 bebidas',
                categoria: TipoCategoria.COMBO,
                preco: '60',
                disponivel: true
            },
            {
                nome: 'Salada',
                descricao: 'Mix de folhas verdes',
                categoria: 'LANCHE',
                preco: '12',
                disponivel: true
            },
            
        ],
    });
    console.log("pedidos sendo criados...")

   await prisma.pedido.createMany({
    data: [ { 
        clienteId: 1,
        total: '12', 
        status: TipoStatus.ABERTO 
    },
    {
        clienteId: 2,
        total: '8',
        status: TipoStatus.PAGO,
    },
    {
        clienteId: 3,
        total: '15.5',
        status: TipoStatus.PAGO,
    }
    ]
});

    console.log("inserindo itens pedido...")

    await prisma.itemPedido.create({
        data:[ {
            pedidoId: 1,
            produtoId: 5,
            quantidade: 1,
            precoUnitario: '12',
        },
        {
            pedidoId: 2,
            produtoId: 3,
            quantidade: 1,
            precoUnitario: '8', 
        },
        {
            pedidoId: 3,
            produtoId: 1,
            quantidade: 1,
            precoUnitario: '15.5'
        }
    ]
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
