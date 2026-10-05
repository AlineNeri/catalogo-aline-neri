# Catálogo Aline Neri

Catálogo de moda feminina feito com HTML, CSS e JavaScript puro. Não há dependências, etapa de build ou instalação necessária.

## Começar

Abra `index.html` diretamente no navegador. As fotos hospedadas no Unsplash precisam de conexão com a internet; logo, favicon e algumas peças usam arquivos de `img/`.

Para conferir a sintaxe dos arquivos JavaScript com Node.js instalado:

```sh
node --check script.js
node --check data/produtos.js
```

## Mapa do projeto

| Caminho | Responsabilidade |
| --- | --- |
| `index.html` | Página principal e ponto de entrada do catálogo. Carrega os dados dos produtos antes de `script.js`. |
| `produto.html` | Redireciona links antigos de detalhes para o catálogo atual. |
| `style.css` | Estilos da página inicial e dos componentes do catálogo. |
| `script.js` | Renderização do catálogo, menu, modal, carrinho e carrossel da página inicial. |
| `data/produtos.js` | Dados usados para construir os cartões do catálogo. |
| `img/` | Imagens locais, logo e favicon. |

## Fluxos principais

- Na página inicial, `initCatalogo()` monta os cartões a partir de `window.LOJA_PRODUTOS`.
- Clicar na foto abre o modal. Escolher tamanho e cor habilita a ação de adicionar ao carrinho.
- O carrinho é salvo no `localStorage` usando a chave `carrinhoItens`.
- A finalização abre uma conversa no WhatsApp; menus, carrinho e modal só são inicializados nas páginas que contêm seus elementos.
- `produto.html` existe para redirecionar links antigos para `index.html#catalogo`.

## Alterar o catálogo

Adicione ou edite itens em `data/produtos.js`. Cada produto deve informar `nome`, `preco` numérico, `tipo`, `img` e `alt`. O texto `alt` deve descrever o que realmente aparece na foto. Para URLs externas, confirme que a imagem está acessível; para arquivos locais, use um caminho relativo, como `img/colete.jpg`.

O número do WhatsApp está em `WHATSAPP_NUMBER`, no início de `script.js`, e no link flutuante em `index.html`. Ao alterá-lo, atualize os dois pontos.

## Antes de entregar uma mudança

Rode os dois comandos de sintaxe acima e confira no navegador os fluxos afetados: abertura do menu, modal pela foto, seleção de opções e carrinho. A finalização do pedido depende do WhatsApp e deve ser conferida sem concluir uma compra real.
