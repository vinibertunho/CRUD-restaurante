import fs from 'fs/promises';
import path from 'path';
import CardapioModel from '../models/CardapioModel.js';
import { processarFoto, removerFoto, UPLOADS_DIR } from '../utils/fotoHelper.js';

export const verFoto = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const item = await CardapioModel.buscarPorId(parseInt(id));

        if (!item || !item.foto) {
            return res.status(404).json({ error: 'Este item não possui foto cadastrada.' });
        }

        const caminhoArquivo = path.join(UPLOADS_DIR, path.basename(item.foto));

        return res.sendFile(caminhoArquivo);
    } catch (error) {
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

        const item = await CardapioModel.buscarPorId(parseInt(id));

        if (!item) {
            removerFoto(req.file.path);
            return res.status(404).json({ error: 'Registro não encontrado' });
        }

        if (item.foto) {
            const caminhoAntigo = path.join(UPLOADS_DIR, path.basename(item.foto));
            await fs.unlink(caminhoAntigo).catch(() => {});
        }

        await processarFoto(req.file.path);

        item.foto = req.file.filename;

        const itemAtualizado = await item.atualizar();

        return res.status(201).json({
            message: 'Foto salva com sucesso!',
            foto: itemAtualizado.foto,
        });
    } catch (error) {
        if (req.file) removerFoto(req.file.path);
        return res.status(500).json({ error: 'Erro interno ao salvar a foto.' });
    }
};
