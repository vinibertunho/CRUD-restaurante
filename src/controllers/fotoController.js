import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import { processarFoto, removerFoto } from '../utils/fotoHelper.js';

const prisma = new PrismaClient();

export const verFoto = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const item = await prisma.cardapio.findUnique({
            where: { id: parseInt(id) },
        });

        if (!item) {
            return res.status(404).json({ error: 'Registro de item não encontrado.' });
        }

        if (!item.foto) {
            return res.status(404).json({
                error: 'Este item não possui foto cadastrada',
            });
        }

        return res.sendFile(item.foto, { root: '.' });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        return res.status(500).json({ error: 'Erro ao buscar registro de item.' });
    }
};

export const uploadFoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma foto enviada!' });
        }

        const { id } = req.params;

        if (isNaN(id)) {
            removerFoto(req.file.path);
            return res.status(400).json({ error: 'O ID enviado não é um número válido' });
        }

        const item = await prisma.cardapio.findUnique({
            where: { id: parseInt(id) },
        });

        if (!item) {
            removerFoto(req.file.path);
            return res.status(404).json({ error: 'Registro não encontrado' });
        }

        if (item.foto) {
            await fs.unlink(item.foto).catch(() => {});
        }

        const novaFoto = await processarFoto(req.file.path);

        const itemAtualizado = await prisma.cardapio.update({
            where: { id: parseInt(id) },
            data: { foto: novaFoto },
        });

        return res.status(201).json({
            message: 'Foto salva com sucesso!',
            foto: itemAtualizado.foto,
        });
    } catch (error) {
        console.error('Erro ao salvar foto:', error);
        if (req.file) removerFoto(req.file.path);
        return res.status(500).json({ error: 'Erro interno ao salvar a foto.' });
    }
};
