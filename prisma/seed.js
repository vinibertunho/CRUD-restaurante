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
    await prisma.itemPedido.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.cardapio.deleteMany();
    await prisma.cliente.deleteMany();

    console.log('👤 Inserindo 5 Clientes...');
    const ana = await prisma.cliente.create({
        data: {
            nome: 'Ana Silva',
            email: 'ana@email.com',
            localidade: 'São Paulo',
            uf: 'SP',
            cep: '01001-000',
        },
    });
    const bruno = await prisma.cliente.create({
        data: {
            nome: 'Bruno Costa',
            email: 'bruno@email.com',
            localidade: 'Rio de Janeiro',
            uf: 'RJ',
            cep: '20010-000',
        },
    });
    const carla = await prisma.cliente.create({
        data: {
            nome: 'Carla Souza',
            email: 'carla@email.com',
            localidade: 'Curitiba',
            uf: 'PR',
            cep: '80010-000',
        },
    });
    const diego = await prisma.cliente.create({
        data: {
            nome: 'Diego Lima',
            email: 'diego@email.com',
            localidade: 'Belo Horizonte',
            uf: 'MG',
            cep: '30110-000',
        },
    });
    const elena = await prisma.cliente.create({
        data: {
            nome: 'Elena Martins',
            email: 'elena@email.com',
            localidade: 'Porto Alegre',
            uf: 'RS',
            cep: '90010-000',
        },
    });

    console.log('🍕 Inserindo 5 Itens no Cardápio...');
    const bruschetta = await prisma.cardapio.create({
        data: {
            nome: 'Bruschetta Italiana',
            categoria: 'ENTRADA',
            preco: 25.5,
            descricao: 'Pão italiano tostado com tomates frescos, manjericão e azeite.',
        },
    });

    const risoto = await prisma.cardapio.create({
        data: {
            nome: 'Risoto de Cogumelos',
            categoria: 'PRATO_PRINCIPAL',
            preco: 62.0,
            descricao: 'Arroz arbóreo cremoso com mix de cogumelos frescos.',
        },
    });

    const petit = await prisma.cardapio.create({
        data: {
            nome: 'Petit Gateau',
            categoria: 'SOBREMESA',
            preco: 28.9,
            descricao: 'Bolinho quente de chocolate com sorvete de baunilha.',
        },
    });

    const lasanha = await prisma.cardapio.create({
        data: {
            nome: 'Lasanha Bolonhesa',
            categoria: 'PRATO_PRINCIPAL',
            preco: 45.0,
            descricao: 'Massa artesanal com molho de carne e queijo gratinado.',
        },
    });

    const vinho = await prisma.cardapio.create({
        data: {
            nome: 'Vinho Tinto',
            categoria: 'BEBIDA',
            preco: 120.0,
            descricao: 'Garrafa de 750ml de vinho tinto seco.',
        },
    });

    console.log('📝 Criando Pedidos Iniciais...');
    await prisma.pedido.create({
        data: {
            clienteId: ana.id,
            itens: {
                create: [{ cardapioId: bruschetta.id, quantidade: 2, precoFixo: bruschetta.preco }],
            },
        },
    });

    await prisma.pedido.create({
        data: {
            clienteId: bruno.id,
            itens: {
                create: [
                    { cardapioId: risoto.id, quantidade: 1, precoFixo: risoto.preco },
                    { cardapioId: petit.id, quantidade: 1, precoFixo: petit.preco },
                ],
            },
        },
    });

    console.log('✅ Seed concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end();
        await prisma.$disconnect();
    });
