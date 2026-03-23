import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🧹 Limpando tabelas...');
    await prisma.cardapio.deleteMany();
    await prisma.cliente.deleteMany();

    console.log('📦 Inserindo Clientes...');
    // Criamos individualmente ou usamos create para retornar os objetos com IDs
    const c1 = await prisma.cliente.create({
        data: {
            nome: 'Ana Silva',
            email: 'ana@email.com',
            cep: '01001-000',
            localidade: 'São Paulo',
            uf: 'SP',
            ativo: true,
        },
    });
    const c2 = await prisma.cliente.create({
        data: {
            nome: 'Bruno Costa',
            email: 'bruno@email.com',
            cep: '20040-002',
            localidade: 'Rio de Janeiro',
            uf: 'RJ',
            ativo: true,
        },
    });
    const c3 = await prisma.cliente.create({
        data: {
            nome: 'Carla Souza',
            email: 'carla@email.com',
            cep: '30140-071',
            localidade: 'Belo Horizonte',
            uf: 'MG',
            ativo: true,
        },
    });
    const c4 = await prisma.cliente.create({
        data: {
            nome: 'Diego Lima',
            email: 'diego@email.com',
            cep: '80010-000',
            localidade: 'Curitiba',
            uf: 'PR',
            ativo: false,
        },
    });
    const c5 = await prisma.cliente.create({
        data: {
            nome: 'Elena Rosa',
            email: 'elena@email.com',
            cep: '90010-001',
            localidade: 'Porto Alegre',
            uf: 'RS',
            ativo: true,
        },
    });

    console.log('🍕 Inserindo Itens no Cardápio e Relacionando Pedidos...');
    await prisma.cardapio.createMany({
        data: [
            {
                nome: 'Bruschetta Italiana',
                categoria: 'ENTRADA',
                preco: 25.5,
                disponivel: true,
                clienteId: c1.id,
            },
            {
                nome: 'Risoto de Cogumelos',
                categoria: 'PRATO_PRINCIPAL',
                preco: 62.0,
                disponivel: true,
                clienteId: c2.id,
            },
            {
                nome: 'Filé Mignon',
                categoria: 'PRATO_PRINCIPAL',
                preco: 89.9,
                disponivel: true,
                clienteId: c3.id,
            },
            {
                nome: 'Petit Gâteau',
                categoria: 'SOBREMESA',
                preco: 28.0,
                disponivel: true,
                clienteId: c1.id,
            },
            {
                nome: 'Vinho Tinto',
                categoria: 'BEBIDA',
                preco: 120.0,
                disponivel: true,
                clienteId: c5.id,
            },
        ],
    });

    console.log('✅ Seed concluído: Clientes criados e vinculados aos itens do cardápio!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
