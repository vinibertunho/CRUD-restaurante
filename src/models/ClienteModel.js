import prisma from '../utils/prismaClient.js';

export default class ClienteModel {
    constructor({
        id = null,
        nome,
        telefone,
        email,
        cpf,
        cep,
        logradouro,
        bairro,
        localidade,
        uf,
        ativo = true,
        pedidos = [],
    } = {}) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
        this.cpf = cpf;
        this.cep = cep;
        this.logradouro = logradouro;
        this.bairro = bairro;
        this.localidade = localidade;
        this.uf = uf;
        this.ativo = ativo;
        this.pedidos = pedidos;
    }

    validacao() {
        if (!this.nome || this.nome.length < 3 || this.nome.length > 100) {
            throw new Error('O nome deve conter entre 3 e 100 caracteres.');
        }
        if (!this.email) {
            throw new Error('O campo "email" e obrigatorio.');
        }

        if (!this.cep) {
            throw new Error('O campo "cep" e obrigatorio.');
        }

        if (this.ativo === false) {
            throw new Error('Operacao nao permitida: cliente inativo.');
        }


        let cepLimpo = '';
        if (this.cep) {
            const cepString = String(this.cep);
            for (let i = 0; i < cepString.length; i++) {
                const caractere = cepString[i];
                if (caractere >= '0' && caractere <= '9') {
                    cepLimpo += caractere;
                }
            }
        }

        if (cepLimpo.length !== 8) {
            throw new Error('O campo "cep" deve conter exatamente 8 digitos numericos.');
        }

        if (!this.localidade) {
            throw new Error('O campo "localidade" e obrigatorio.');
        }

        this.cep = cepLimpo;
    }

    async preencherEnderecoPorCep() {
        if (!this.cep) return;

        let cepLimpo = '';
        const cepString = String(this.cep);
        for (let i = 0; i < cepString.length; i++) {
            const caractere = cepString[i];
            if (caractere >= '0' && caractere <= '9') {
                cepLimpo += caractere;
            }
        }

        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

            const dados = await resposta.json();

            if (dados.erro) {
                throw new Error('CEP nao encontrado.');
            }

            this.logradouro = dados.logradouro || null;
            this.bairro = dados.bairro || null;
            this.localidade = dados.localidade || null;
            this.uf = dados.uf || null;
        } catch (error) {
            throw new Error('Erro ao buscar endereco pelo CEP: ' + error.message);
        }
    }

    async criar() {
        this.validacao();
        await this.preencherEnderecoPorCep();

        return prisma.cliente.create({
            data: {
                nome: this.nome,
                telefone: this.telefone,
                email: this.email,
                cpf: this.cpf,
                cep: String(this.cep),
                logradouro: this.logradouro,
                bairro: this.bairro,
                localidade: this.localidade,
                uf: this.uf,
                ativo: this.ativo,
            },
        });
    }

    async atualizar() {
         if (this.ativo === false) {
             throw new Error('Operacao nao permitida: cliente inativo.');
        }

        this.validacao();
        if (this.cep) await this.preencherEnderecoPorCep();

        return prisma.cliente.update({
            where: { id: this.id },
            data: {
                nome: this.nome,
                telefone: this.telefone,
                email: this.email,
                cpf: this.cpf,
                cep: String(this.cep),
                logradouro: this.logradouro,
                bairro: this.bairro,
                localidade: this.localidade,
                uf: this.uf,
                ativo: this.ativo,
            },
        });
    }

    async deletar() {
        if (this.ativo === false) {
            throw new Error('Operacao nao permitida: cliente inativo.');
        }

        return prisma.cliente.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) {
            where.nome = { contains: filtros.nome, mode: 'insensitive' };
        }

        if (filtros.email) {
            where.email = { contains: filtros.email, mode: 'insensitive' };
        }

        if (filtros.cpf) {
            where.cpf = { contains: filtros.cpf, mode: 'insensitive' };
        }

        if (filtros.dominio) {
            where.email = {
                endsWith: `@${String(filtros.dominio).toLowerCase()}`,
                mode: 'insensitive',
            };
        }

        if (filtros.localidade) {
            where.localidade = { contains: filtros.localidade, mode: 'insensitive' };
        }

        if (filtros.ativo !== undefined) {
            where.ativo = filtros.ativo === 'true';
        }

        return prisma.cliente.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.cliente.findUnique({ where: { id } });
        if (!data) {
            return null;
        }
        return new ClienteModel(data);
    }
}
