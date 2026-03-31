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
    // A ordem de exclusão importa por causa das chaves estrangeiras
    await prisma.itemPedido.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.cardapio.deleteMany();
    await prisma.cliente.deleteMany();

    console.log('👤 Inserindo Clientes...');
    const ana = await prisma.cliente.create({
        data: { nome: 'Ana Silva', email: 'ana@email.com', localidade: 'São Paulo', uf: 'SP' },
    });
    const bruno = await prisma.cliente.create({
        data: {
            nome: 'Bruno Costa',
            email: 'bruno@email.com',
            localidade: 'Rio de Janeiro',
            uf: 'RJ',
        },
    });

    console.log('🍕 Inserindo Itens no Cardápio...');
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
            descricao: 'Arroz arbóreo cremoso com mix de cogumelos frescos e queijo parmesão.',
        },
    });

    const vinho = await prisma.cardapio.create({
        data: {
            nome: 'Vinho Tinto',
            categoria: 'BEBIDA',
            preco: 120.0,
            descricao: 'Garrafa de 750ml de vinho tinto seco, safra selecionada.',
        },
    });

    console.log('📝 Criando Pedidos...');
    // Pedido da Ana: 2 Bruschettas
    await prisma.pedido.create({
        data: {
            clienteId: ana.id,
            itens: {
                create: [
                    {
                        cardapioId: bruschetta.id,
                        quantidade: 2,
                        precoFixo: bruschetta.preco,
                    },
                ],
            },
        },
    });

    // Pedido do Bruno: 1 Risoto e 1 Vinho
    await prisma.pedido.create({
        data: {
            clienteId: bruno.id,
            itens: {
                create: [
                    {
                        cardapioId: risoto.id,
                        quantidade: 1,
                        precoFixo: risoto.preco,
                    },
                    {
                        cardapioId: vinho.id,
                        quantidade: 1,
                        precoFixo: vinho.preco,
                    },
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
