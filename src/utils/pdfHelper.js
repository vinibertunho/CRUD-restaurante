import htmlPdf from 'html-pdf-node';
import fs from 'fs';
import path from 'path';

const getBase64Image = (foto) => {
    if (!foto) return null;
    try {
        const caminhoFoto = path.resolve('uploads', foto);
        if (fs.existsSync(caminhoFoto)) {
            const bitmap = fs.readFileSync(caminhoFoto);
            const base64 = Buffer.from(bitmap).toString('base64');
            const ext = path.extname(foto).toLowerCase().replace('.', '');
            const mimeType = ext === 'webp' ? 'image/webp' : 'image/jpeg';
            return `data:${mimeType};base64,${base64}`;
        }
    } catch (e) {
        return null;
    }
    return null;
};

export async function gerarPdfCardapio(itens) {
    const linhas = itens.map((item) => {
        const b64 = getBase64Image(item.foto);
        const imagemHtml = b64
            ? `<img src="${b64}" width="50" height="50" style="border-radius: 5px; object-fit: cover;">`
            : '<span style="font-size: 8px; color: #999;">Sem foto</span>';

        return `
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${imagemHtml}</td>
            <td style="border: 1px solid #ddd; padding: 8px;"><b>${item.nome}</b></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.categoria}</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-size: 10px;">${item.descricao || '-'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R$ ${Number(item.preco).toFixed(2)}</td>
        </tr>`;
    }).join('');

    const html = `
    <html>
    <head>
        <style>
            body { font-family: sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #f8f8f8; border: 1px solid #ddd; padding: 10px; text-align: left; }
            h1 { text-align: center; color: #333; }
        </style>
    </head>
    <body>
        <h1>Relatório Geral de Cardápio</h1>
        <table>
            <thead>
                <tr>
                    <th>Foto</th>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Preço</th>
                </tr>
            </thead>
            <tbody>${linhas}</tbody>
        </table>
    </body>
    </html>`;

    return htmlPdf.generatePdf({ content: html }, { format: 'A4' });
}

export async function gerarPdfIndividual(item) {
    const b64 = getBase64Image(item.foto);
    const imagemHtml = b64
        ? `<img src="${b64}" style="width: 250px; height: 250px; border-radius: 10px; object-fit: cover; display: block; margin: 0 auto;">`
        : '<p style="text-align: center; color: #999;">Foto não disponível</p>';

    const html = `
    <html>
    <head>
        <style>
            body { font-family: sans-serif; padding: 30px; line-height: 1.5; }
            .container { border: 1px solid #eee; padding: 20px; border-radius: 10px; }
            h1 { text-align: center; color: #d35400; border-bottom: 2px solid #d35400; padding-bottom: 10px; }
            .detalhes { margin-top: 20px; }
            .label { font-weight: bold; color: #555; }
            .preco { font-size: 24px; font-weight: bold; color: #27ae60; text-align: center; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>${item.nome}</h1>
            ${imagemHtml}
            <div class="detalhes">
                <p><span class="label">Categoria:</span> ${item.categoria}</p>
                <p><span class="label">Descrição:</span> ${item.descricao || 'Sem descrição.'}</p>
                <p><span class="label">Status:</span> ${item.disponivel ? 'Disponível' : 'Indisponível'}</p>
            </div>
            <div class="preco">R$ ${Number(item.preco).toFixed(2)}</div>
        </div>
    </body>
    </html>`;

    return htmlPdf.generatePdf({ content: html }, { format: 'A4' });
}
