import fs from 'fs/promises';
import path from 'path';
import CardapioModel from '../models/CardapioModel.js';
import { processarFoto, removerFoto, UPLOADS_DIR } from '../utils/fotoHelper.js';

const parseId = (value) => Number.parseInt(value, 10);

export const verFoto = async (req, res) => {
    try {
        const id = parseId(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const item = await CardapioModel.buscarPorId(id);
        if (!item || !item.foto) return res.status(404).json({ error: 'Sem foto.' });

        const caminhoArquivo = path.join(UPLOADS_DIR, path.basename(item.foto));
        return res.sendFile(caminhoArquivo);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar foto.' });
    }
};

export const uploadFoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma foto enviada!' });
        }

        const id = parseId(req.params.id);
        if (Number.isNaN(id)) {
            if (req.file) removerFoto(req.file.path);
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const item = await CardapioModel.buscarPorId(id);
        if (!item) {
            if (req.file) removerFoto(req.file.path);
            return res.status(404).json({ error: 'Item não encontrado.' });
        }

        if (item.foto) {
            const caminhoAntigo = path.join(UPLOADS_DIR, path.basename(item.foto));
            await fs.unlink(caminhoAntigo).catch(() => {});
        }

        const caminhoProcessado = await processarFoto(req.file.path);
        item.foto = path.basename(caminhoProcessado);
        const itemAtualizado = await item.atualizar();

        return res.status(201).json({
            message: 'Foto salva com sucesso!',
            foto: itemAtualizado.foto,
        });
    } catch (error) {
        if (req.file) removerFoto(req.file.path);
        console.error(error);
        return res.status(500).json({ error: 'Erro ao salvar foto.' });
    }
};
