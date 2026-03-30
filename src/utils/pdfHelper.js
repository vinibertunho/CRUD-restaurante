import htmlPdf from 'html-pdf-node';
import fs from 'fs';

export async function gerarPdfPedidoCliente(cliente) {
    let fotoHtml = '-';

    if (cliente.foto) {
        const base64 = fs.readFileSync(cliente.foto).toString('base64');
        fotoHtml = `<img src="data:image/jpeg;base64,${base64}" width="120"/>`;
    }

    const html = `
    <html>
    <body>
        <h1>Pedido do Cliente</h1>

        <p>Foto: ${fotoHtml}</p>
        <p>Nome: ${cliente.nome}</p>
        <p>Pedido: ${cliente.pedidos}
    </body>
    </html>
    `;

    return htmlPdf.generatePdf({ content: html }, { format: 'A4' });
}

export async function gerarPdfTodosItensCardapio(cardapio) {
    const linhas = cardapios
        .map(
            (c) => `
        <tr>
            <td>${c.nome}</td>
            <td>${c.categoria}</td>
            <td>${c.disponivel}</td>
            <td>${c.preco}</td>
        </tr>`,
        )
        .join('');

    const html = `
    <h1 style="text-align: center;">Cardápio do Restaurante do Pedrinho</h1>

    <table border="1" cellspacing="0" cellpadding="8">
        <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Disponibilidade do item</th>
            <th>Preço</th>
        </tr>
        ${linhas}
    </table>
        <p>Total: ${cardapios.length} itens</p>
    `;

    return htmlPdf.generatePdf({ content: html }, { format: 'A4' });
}
