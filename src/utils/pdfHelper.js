import htmlPdf from 'html-pdf-node';
import fs from 'fs';

export async function gerarPdfCardapio(cardapio) {
    let fotoHTml = '-';

    if (cardapio.foto) {
        const base64 = fs.readFileSync(cardapio.foto).toString('base64');
        fotoHtml = `<img src="data:image/jpeg;base64,${base64}" width="120"/>`;
    }

    const html = `
    <html>
    <body>
        <h1>Cardápio</h1>

                <p>Nome: ${fotoHtml}</p>
                <p>Categoria: ${fotoHtml}</p>
                <p>Preco: ${fotoHtml}</p>
                <p>Disponivel: ${fotoHtml}</p>
    </body>
    </html>
    `;

    return htmlPdf.generatePdf({ content: html }, { format: 'A4' });
}


