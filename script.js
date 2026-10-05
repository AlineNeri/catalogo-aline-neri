// ==== CONFIGURAÇÃO GLOBAL ==== 
const WHATSAPP_NUMBER = '5511965713890';
const STORAGE_KEY = 'carrinhoItens';

// ==== CARRINHO GLOBAL ==== 
let carrinhoItens = [];

const produtos = Array.isArray(window.LOJA_PRODUTOS) ? window.LOJA_PRODUTOS : [];

try {
  const carrinhoSalvo = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  carrinhoItens = Array.isArray(carrinhoSalvo)
    ? carrinhoSalvo
        .filter(item =>
          item &&
          typeof item.nome === 'string' &&
          typeof item.cor === 'string' &&
          typeof item.tamanho === 'string' &&
          Number.isFinite(Number(item.preco)) &&
          Number(item.preco) >= 0
        )
        .map(item => ({
          ...item,
          preco: Number(item.preco),
          quantidade: Number.isInteger(Number(item.quantidade)) && Number(item.quantidade) > 0
            ? Number(item.quantidade)
            : 1,
          img: typeof item.img === 'string' ? item.img : ''
        }))
    : [];
} catch (error) {
  carrinhoItens = [];
}

// ==== UTILITÁRIOS ==== 
function getQuantidadeItens() {
  return carrinhoItens.reduce((total, item) => total + (item.quantidade || 1), 0);
}

function atualizarLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrinhoItens));
}

function abrirWhatsAppComCompra() {
  const formatarValor = valor => valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const itensMensagem = carrinhoItens.map(item => {
    const quantidade = item.quantidade || 1;
    const subtotal = item.preco * quantidade;
    return `${item.nome} - Cor: ${item.cor}, Tamanho: ${item.tamanho}, Quantidade: ${quantidade}, Unitário: R$ ${formatarValor(item.preco)}, Subtotal: R$ ${formatarValor(subtotal)}`;
  }).join('\n');
  const total = carrinhoItens.reduce((soma, item) => soma + item.preco * (item.quantidade || 1), 0);

  const mensagem = encodeURIComponent(`Olá! Quero finalizar minha compra:\n${itensMensagem}\nTotal: R$ ${formatarValor(total)}`);
  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensagem}`;
  window.open(link, '_blank');
}

// ==== MENU HOME ==== 
function initMenuHome() {
  const menuBtn = document.getElementById('menu-btn');
  const menuFechar = document.getElementById('menu-fechar');
  const menuPrincipal = document.getElementById('menu-principal');
  const menuOverlay = document.getElementById('menu-overlay');

  if (!menuBtn || !menuFechar || !menuPrincipal || !menuOverlay) {
    return;
  }

  function fecharMenu() {
    menuPrincipal.classList.remove('ativo');
    menuOverlay.classList.remove('ativo');
    menuPrincipal.setAttribute('aria-hidden', 'true');
    menuPrincipal.inert = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.focus();
  }

  menuBtn.addEventListener('click', () => {
    menuPrincipal.classList.add('ativo');
    menuOverlay.classList.add('ativo');
    menuPrincipal.removeAttribute('inert');
    menuPrincipal.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuFechar.focus();
  });

  menuFechar.addEventListener('click', fecharMenu);
  menuOverlay.addEventListener('click', fecharMenu);

  menuPrincipal.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', fecharMenu);
  });

  const informacoesCabecalho = document.querySelector('.informacoes-cabecalho');
  const botoesInformacao = [...(informacoesCabecalho?.querySelectorAll('.atalho-cabecalho') || [])];

  function fecharDescricoes() {
    botoesInformacao.forEach(botao => botao.setAttribute('aria-expanded', 'false'));
    botoesInformacao.forEach(botao => {
      const descricao = botao.querySelector('.tooltip-atalho');
      descricao.hidden = true;
    });
  }

  function mostrarDescricao(botao) {
    fecharDescricoes();
    botao.setAttribute('aria-expanded', 'true');
    const descricao = botao.querySelector('.tooltip-atalho');
    if (descricao) {
      descricao.hidden = false;
    }
  }

  const dispositivoComMouse = window.matchMedia('(hover: hover)').matches;
  botoesInformacao.forEach(botao => {
    if (dispositivoComMouse) {
      botao.addEventListener('mouseenter', () => mostrarDescricao(botao));
      botao.addEventListener('mouseleave', fecharDescricoes);
      botao.addEventListener('focus', () => mostrarDescricao(botao));
    } else {
      botao.addEventListener('click', () => {
        const jaAberto = botao.getAttribute('aria-expanded') === 'true';
        if (jaAberto) {
          fecharDescricoes();
        } else {
          mostrarDescricao(botao);
        }
      });
    }
  });

  if (dispositivoComMouse && informacoesCabecalho) {
    informacoesCabecalho.addEventListener('focusout', event => {
      if (!informacoesCabecalho.contains(event.relatedTarget)) {
        fecharDescricoes();
      }
    });
  }

  document.addEventListener('click', event => {
    if (informacoesCabecalho && !informacoesCabecalho.contains(event.target)) {
      fecharDescricoes();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      fecharDescricoes();
    }
  });

  document.addEventListener('keydown', event => {
    if (!menuPrincipal.classList.contains('ativo')) {
      return;
    }

    if (event.key === 'Escape') {
      fecharMenu();
      return;
    }

    if (event.key === 'Tab') {
      const controles = [...menuPrincipal.querySelectorAll('button:not(:disabled), a[href]')];
      const primeiro = controles[0];
      const ultimo = controles[controles.length - 1];

      if (event.shiftKey && document.activeElement === primeiro) {
        event.preventDefault();
        ultimo?.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primeiro?.focus();
      }
    }
  });
}

function initCatalogo() {
  const catalogo = document.getElementById('catalogo');

  if (!catalogo) {
    return;
  }

  catalogo.innerHTML = produtos.map((produto, index) => {
    return `<article class="produto" data-nome="${produto.nome}" data-preco="${produto.preco.toFixed(2).replace('.', ',')}" data-tipo="${produto.tipo}" data-index="${index}">
      <button class="produto-imagem" type="button" aria-label="Ver detalhes de ${produto.nome}">
        <img src="${produto.img}" alt="${produto.alt}">
      </button>
      <h3>${produto.nome}</h3>
      <p>R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
      <button class="produto-comprar" type="button" aria-label="Comprar ${produto.nome}">Comprar</button>
    </article>`;
  }).join('');
}

function atualizarCarrinho() {
  const listaCarrinho = document.getElementById('lista-carrinho');
  const total = document.getElementById('total');
  const carrossel = document.getElementById('carrossel');
  const carrinhoContador = document.getElementById('carrinho-contador');
  const carrinhoToggle = document.getElementById('carrinho-toggle');
  const carrinhoStatus = document.getElementById('carrinho-status');

  if (!listaCarrinho || !total || !carrossel || !carrinhoContador || !carrinhoToggle || !carrinhoStatus) {
    return;
  }

  listaCarrinho.innerHTML = '';

  if (carrinhoItens.length === 0) {
    listaCarrinho.innerHTML = '<p>Carrinho vazio</p>';
    total.textContent = '0,00';
    carrossel.innerHTML = '';
    carrinhoContador.textContent = getQuantidadeItens();
    carrinhoToggle.setAttribute('aria-label', 'Carrinho vazio');
    carrinhoStatus.textContent = 'Carrinho vazio.';
    atualizarLocalStorage();
    return;
  }

  let totalCarrinho = 0;

  carrinhoItens.forEach((item, index) => {
    const li = document.createElement('li');

    const imgProduto = document.createElement('img');
    imgProduto.src = item.img;
    imgProduto.alt = item.nome;
    imgProduto.style.width = '50px';
    imgProduto.style.height = '50px';
    imgProduto.style.objectFit = 'cover';
    imgProduto.style.marginRight = '10px';
    li.appendChild(imgProduto);

    const quantidade = item.quantidade || 1;
    const texto = document.createTextNode(
      `${item.nome} (${item.tamanho}, ${item.cor}) - R$ ${item.preco.toFixed(2).replace('.', ',')} x ${quantidade}`
    );
    li.appendChild(texto);

    const removerItem = document.createElement('button');
    removerItem.type = 'button';
    removerItem.textContent = 'Remover';
    removerItem.setAttribute('aria-label', `Remover ${item.nome} do carrinho`);
    removerItem.style.cursor = 'pointer';
    removerItem.style.marginLeft = '10px';
    removerItem.addEventListener('click', () => {
      carrinhoItens.splice(index, 1);
      atualizarCarrinho();
    });
    li.appendChild(removerItem);

    listaCarrinho.appendChild(li);

    totalCarrinho += item.preco * quantidade;
  });

  total.textContent = totalCarrinho.toFixed(2).replace('.', ',');

  carrossel.innerHTML = '';
  carrinhoItens.forEach(item => {
    const imagens = [item.img];
    imagens.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = item.nome;
      img.style.width = '80px';
      img.style.height = '80px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '5px';
      img.style.marginRight = '5px';
      carrossel.appendChild(img);
    });
  });

  carrinhoContador.textContent = getQuantidadeItens();
  carrinhoToggle.setAttribute('aria-label', `Carrinho, ${getQuantidadeItens()} ${getQuantidadeItens() === 1 ? 'item' : 'itens'}`);
  carrinhoStatus.textContent = `Carrinho atualizado. ${getQuantidadeItens()} ${getQuantidadeItens() === 1 ? 'item' : 'itens'}. Total: R$ ${total.textContent}.`;
  atualizarLocalStorage();
}

// ==== CARRINHO DA HOME ==== 
function initCarrinhoHome() {
  const carrinho = document.getElementById('carrinho');
  const carrinhoToggle = document.getElementById('carrinho-toggle');
  const carrinhoDetalhes = document.getElementById('carrinho-detalhes');
  const finalizarBtn = document.getElementById('finalizar');

  if (!carrinho || !carrinhoToggle || !carrinhoDetalhes || !finalizarBtn) {
    return;
  }

  carrinhoDetalhes.addEventListener('click', event => event.stopPropagation());

  function fecharCarrinho() {
    carrinhoDetalhes.style.display = 'none';
    carrinhoToggle.setAttribute('aria-expanded', 'false');
  }

  carrinhoToggle.addEventListener('click', () => {
    const aberto = carrinhoDetalhes.style.display === 'flex';
    if (aberto) {
      fecharCarrinho();
    } else {
      carrinhoDetalhes.style.display = 'flex';
      carrinhoToggle.setAttribute('aria-expanded', 'true');
    }
  });

  document.addEventListener('click', event => {
    if (!carrinho.contains(event.target)) {
      fecharCarrinho();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && carrinhoDetalhes.style.display === 'flex') {
      fecharCarrinho();
      carrinhoToggle.focus();
    }
  });

  finalizarBtn.addEventListener('click', () => {
    if (carrinhoItens.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    abrirWhatsAppComCompra();
  });

  atualizarCarrinho();
}

// ==== MODAL DE PRODUTO NA HOME ==== 
function initModalCatalogo() {
  const modal = document.getElementById('modal-produto');
  const modalImg = document.getElementById('modal-img');
  const modalNome = document.getElementById('modal-nome');
  const modalPreco = document.getElementById('modal-preco');
  const modalAddCarrinho = document.getElementById('modal-add-carrinho');
  const modalTabelaMedidas = document.getElementById('modal-tabela-medidas');
  const listaTamanhos = modal?.querySelector('.lista-tamanhos');
  const listaCores = modal?.querySelector('.lista-cores');
  const fecharModal = document.querySelector('.fechar');

  if (!modal || !modalImg || !modalNome || !modalPreco || !modalAddCarrinho || !listaTamanhos || !listaCores || !fecharModal) {
    return;
  }

  let produtoSelecionado = null;
  let tamanhoSelecionado = null;
  let corSelecionada = null;
  let elementoQueAbriuModal = null;
  const coresPadrao = [
    { nome: 'Preta', valor: '#111111' },
    { nome: 'Branca', valor: 'white' },
    { nome: 'Marrom', valor: '#6b3f32' },
    { nome: 'Azul-marinho', valor: '#203b70' }
  ];
  const coresPorProduto = {
    'Básica Gola Alta': coresPadrao,
    'T-Shirt': coresPadrao,
    'Calça Alfaiataria': coresPadrao,
    'Regata Canelada': coresPadrao,
    'Vestido Canelado': coresPadrao.filter(cor => cor.nome !== 'Branca'),
    'Calça Legging': [
      { nome: 'Preta', valor: '#111111' },
      { nome: 'Azul', valor: '#203b70' },
      { nome: 'Cinza', valor: '#858585' }
    ],
    'Camisa Over': [
      { nome: 'Branca', valor: 'white' },
      { nome: 'Preta', valor: 'black' },
      { nome: 'Marrom', valor: '#6b3f32' }
    ]
  };
  const produtosTamanhoM = new Set([
    'Básica Gola Alta',
    'T-Shirt',
    'Regata Canelada',
    'Camisa Over',
    'Calça Legging'
  ]);

  modalAddCarrinho.addEventListener('click', () => {
    if (!produtoSelecionado || !tamanhoSelecionado || !corSelecionada) {
      return;
    }

    const nome = produtoSelecionado.dataset.nome;
    const preco = parseFloat(produtoSelecionado.dataset.preco.replace(',', '.'));
    const tipo = produtoSelecionado.dataset.tipo;
    const img = produtoSelecionado.querySelector('img').src;

    const itemExistente = carrinhoItens.find(item =>
      item.nome === nome && item.tamanho === tamanhoSelecionado && item.cor === corSelecionada
    );

    if (itemExistente) {
      itemExistente.quantidade += 1;
    } else {
      carrinhoItens.push({ nome, preco, tipo, img, tamanho: tamanhoSelecionado, cor: corSelecionada, quantidade: 1 });
    }

    atualizarLocalStorage();
    atualizarCarrinho();
    modal.style.display = 'none';
    elementoQueAbriuModal?.focus();
  });

  document.querySelectorAll('.produto-imagem, .produto-comprar').forEach(botaoProduto => {
    botaoProduto.addEventListener('click', () => {
      const produto = botaoProduto.closest('.produto');
      if (!produto) {
        return;
      }

      if (botaoProduto.matches('.produto-comprar')) {
        document.querySelectorAll('.produto-comprar.ativo').forEach(botao => botao.classList.remove('ativo'));
        botaoProduto.classList.add('ativo');
      }

      produtoSelecionado = produto;
      elementoQueAbriuModal = botaoProduto;
      const imagemProduto = produto.querySelector('img');
      modalImg.src = imagemProduto.src;
      modalImg.alt = imagemProduto.alt;
      modalNome.textContent = produto.dataset.nome;
      modalPreco.textContent = 'R$ ' + produto.dataset.preco;

      const nomeProduto = produto.dataset.nome;
      if (modalTabelaMedidas) {
        modalTabelaMedidas.hidden = !['Vestido Canelado', 'Regata Canelada'].includes(nomeProduto);
      }
      const dadosProduto = produtos.find(item => item.nome === nomeProduto);
      const indisponiveis = dadosProduto?.indisponiveis || {};
      const coresDisponiveis = coresPorProduto[nomeProduto] || [
        { nome: 'Rosa', valor: 'pink' },
        { nome: 'Preta', valor: 'black' },
        { nome: 'Branca', valor: 'white' }
      ];
      const tamanhosDisponiveis = produtosTamanhoM.has(nomeProduto) ? ['M'] : ['P', 'M', 'G', 'GG'];

      listaTamanhos.innerHTML = tamanhosDisponiveis.map(tamanho => {
        const esgotado = indisponiveis.tamanhos?.includes(tamanho);
        return `<button type="button" class="${esgotado ? 'indisponivel' : ''}" aria-pressed="false" ${esgotado ? 'disabled title="Tamanho esgotado"' : ''}>${tamanho}</button>`;
      }).join('');
      listaCores.innerHTML = coresDisponiveis.map(cor => {
        const esgotado = indisponiveis.cores?.includes(cor.nome);
        return `<button type="button" class="cor ${esgotado ? 'indisponivel' : ''}" style="background-color: ${cor.valor};${cor.nome === 'Branca' ? ' border: 1px solid #ccc;' : ''}" data-cor="${cor.nome}" title="${esgotado ? 'Cor esgotada' : cor.nome}" aria-label="${cor.nome}" aria-pressed="false" ${esgotado ? 'disabled' : ''}></button>`;
      }).join('');

      modal.style.display = 'flex';
      modalAddCarrinho.style.display = 'none';
      fecharModal.focus();

      tamanhoSelecionado = null;
      corSelecionada = null;

    });
  });

  function fecharModalProduto() {
    modal.style.display = 'none';
    elementoQueAbriuModal?.focus();
  }

  fecharModal.addEventListener('click', fecharModalProduto);
  window.addEventListener('click', event => {
    if (event.target === modal) {
      fecharModalProduto();
    }
  });
  window.addEventListener('keydown', event => {
    if (modal.style.display !== 'flex') {
      return;
    }

    if (event.key === 'Escape') {
      fecharModalProduto();
      return;
    }

    if (event.key === 'Tab') {
      const controlesFocaveis = [...modal.querySelectorAll(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      )].filter(controle => controle.getClientRects().length > 0);
      const primeiroControle = controlesFocaveis[0];
      const ultimoControle = controlesFocaveis[controlesFocaveis.length - 1];

      if (event.shiftKey && document.activeElement === primeiroControle) {
        event.preventDefault();
        ultimoControle?.focus();
      } else if (!event.shiftKey && document.activeElement === ultimoControle) {
        event.preventDefault();
        primeiroControle?.focus();
      }
    }
  });

  listaTamanhos.addEventListener('click', event => {
    const tamanho = event.target.closest('button');
    if (!tamanho || tamanho.disabled) {
      return;
    }

    listaTamanhos.querySelectorAll('button').forEach(el => {
      el.classList.remove('selecionado');
      el.setAttribute('aria-pressed', 'false');
    });
    tamanho.classList.add('selecionado');
    tamanho.setAttribute('aria-pressed', 'true');
    tamanhoSelecionado = tamanho.textContent;
    verificarSelecao();
  });

  listaCores.addEventListener('click', event => {
    const cor = event.target.closest('button.cor');
    if (!cor || cor.disabled) {
      return;
    }

    listaCores.querySelectorAll('button.cor').forEach(el => {
      el.classList.remove('selecionado');
      el.setAttribute('aria-pressed', 'false');
    });
    cor.classList.add('selecionado');
    cor.setAttribute('aria-pressed', 'true');
    corSelecionada = cor.dataset.cor;
    verificarSelecao();
  });

  function verificarSelecao() {
    if (tamanhoSelecionado && corSelecionada) {
      modalAddCarrinho.style.display = 'inline-block';
    }
  }
}

// ==== CARROSSEL PRINCIPAL ====
function initCarouselHome() {
  const carousel = document.querySelector('.carousel-principal');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nomesDestaque = [
    'Regata Canelada',
    'Calça Alfaiataria',
    'Camisa Over',
    'Vestido Canelado',
    'Camisa Over',
    'Vestido Neia'
  ];
  const produtosDestaque = nomesDestaque
    .map(nome => produtos.find(produto => produto.nome === nome))
    .filter(Boolean);

  if (!carousel || !produtosDestaque.length) {
    return;
  }

  carousel.innerHTML = produtosDestaque.map(produto =>
    `<img src="${produto.img}" alt="${produto.alt}">`
  ).join('');

  const carouselImgs = carousel.querySelectorAll('img');
  const imagensPorSlide = 3;
  const quantidadeSlides = Math.ceil(carouselImgs.length / imagensPorSlide);
  let currentSlide = 0;
  let isPaused = motionPreference.matches;
  let interval = null;

  function mostrarSlide(slide) {
    const primeiroIndice = slide * imagensPorSlide;

    carouselImgs.forEach((img, i) => {
      img.style.display = i >= primeiroIndice && i < primeiroIndice + imagensPorSlide ? 'block' : 'none';
    });
  }

  function iniciarRotacao() {
    if (interval || isPaused || document.hidden || quantidadeSlides < 2) {
      return;
    }

    interval = setInterval(() => {
      currentSlide = (currentSlide + 1) % quantidadeSlides;
      mostrarSlide(currentSlide);
    }, 3000);
  }

  function atualizarRotacao() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    iniciarRotacao();
  }

  mostrarSlide(currentSlide);
  atualizarRotacao();

  document.addEventListener('visibilitychange', atualizarRotacao);
  motionPreference.addEventListener('change', event => {
    isPaused = event.matches;
    atualizarRotacao();
  });
}

function initTituloAba() {
  const tituloOriginal = document.title;
  const mensagens = ['Não perca...', 'Volte!'];
  let indiceMensagem = 0;
  let intervalo = null;

  function iniciarMensagens() {
    if (intervalo) {
      return;
    }

    document.title = mensagens[indiceMensagem];
    intervalo = setInterval(() => {
      indiceMensagem = (indiceMensagem + 1) % mensagens.length;
      document.title = mensagens[indiceMensagem];
    }, 2000);
  }

  function restaurarTitulo() {
    if (intervalo) {
      clearInterval(intervalo);
      intervalo = null;
    }

    indiceMensagem = 0;
    document.title = tituloOriginal;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      iniciarMensagens();
    } else {
      restaurarTitulo();
    }
  });

  if (document.hidden) {
    iniciarMensagens();
  }
}

// ==== INICIALIZAÇÃO PRINCIPAL ==== 
function initApp() {
  initCatalogo();
  initMenuHome();
  initCarrinhoHome();
  initModalCatalogo();
  initCarouselHome();
  initTituloAba();
}

initApp();

