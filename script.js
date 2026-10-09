const loginOverlay = document.getElementById('login-overlay');
const mainPortal = document.getElementById('main-portal');
const summaryOverlay = document.getElementById('summary-overlay');
const previewOverlay = document.getElementById('preview-overlay'); 
const historicoOverlay = document.getElementById('historico-overlay');
const imageModal = document.getElementById('image-modal');

const customAlertOverlay = document.getElementById('custom-alert-overlay');
const customAlertMessage = document.getElementById('custom-alert-message');
const btnCloseAlert = document.getElementById('btn-close-alert');

const usernameInput = document.getElementById('username-input');
const btnLogin = document.getElementById('btn-login');
const displayUsername = document.getElementById('display-username');
const finalUsername = document.getElementById('final-username');

const previewUsername = document.getElementById('preview-username');
const previewList = document.getElementById('preview-list');
const previewObsContainer = document.getElementById('preview-obs-container');
const previewObsText = document.getElementById('preview-obs-text');
const btnFecharPreview = document.getElementById('btn-fechar-preview');

const btnSubmitOrder = document.getElementById('btn-submit-order');
const btnVerPedido = document.getElementById('btn-ver-pedido'); 
const btnNewOrder = document.getElementById('btn-new-order');
const btnVerHistorico = document.getElementById('btn-ver-historico');
const btnVoltarCatalogo = document.getElementById('btn-voltar-catalogo');

const summaryList = document.getElementById('summary-list');
const historicoContainer = document.getElementById('historico-container');
const orderNotes = document.getElementById('order-notes'); 

const categoryFilter = document.getElementById('category-filter');
const allCards = document.querySelectorAll('.card');
const expandedImage = document.getElementById('expanded-image');
const closeImageModal = document.getElementById('close-image-modal');

// URLS DOS GOOGLE SHEETS (Podes usar o mesmo Apps Script central ou separados)
const GOOGLE_SHEETS_HISTORICO_URL = "https://script.google.com/macros/s/AKfycbwrbwbbyZFX2odbXzit3LH8xbTfYD6KEaDNMAqPJFA1BVlKdKoeB2s-_FeL0h6eAKfu/exec";
const GOOGLE_SHEETS_EPI_URL = "https://script.google.com/macros/s/AKfycbzcGUVImy1_SFqqYYi65MUYL3Zk6KTsUMu6i4I8_UNFO0XCz0CIWkfu9OLWuJbTUmfuIQ/exec";

let carrinho = [];
let nomeColaborador = "";
let isGestorAtual = false;
let isComercialAtual = false;

// LISTA OFICIAL DE COLABORADORES DA UNIVERSAL MOTORS
const COLABORADORES_UM = [
  "alfordes manuel",
  "alfordes manuel da costa joao",
  "alfordes joao",
  "andre faria",
  "andre marafona",
  "andre oliveira",
  "andre rosas",
  "andre vilar",
  "bruno sa",
  "carla pires",
  "carlos fonseca",
  "carlos moreira",
  "diana portugal",
  "donacien nsingui",
  "edgar pereira",
  "eduardo pereira",
  "eduardo pinhal",
  "fatima gomes",
  "gabriel oliveira",
  "helder casanova",
  "fernando azevedo",
  "fernando mineiro",
  "guilherme ferreira",
  "ines casanova",
  "joao paulo",
  "jose barroso",
  "kyrylo savchenko",
  "luciano silva",
  "luis guimaraes",
  "luis novo",
  "marilia da silva",
  "mario oliveira",
  "marli magalhaes",
  "nanci alves",
  "nelson costa",
  "nuno alves",
  "nuno caetano",
  "paulo ferreira",
  "rafael pereira",
  "roberto palmeiro",
  "rogerio araujo",
  "ruben torres",
  "tiago feiteira",
  "tiago freitas"
];

// COMERCIAIS (Acesso a EPI + Marketing)
const COMERCIAIS_UM = [
  "andre oliveira",
  "ruben torres",
  "tiago freitas",
  "jose barroso",
  "nuno alves"
];

function mostrarAlerta(mensagem) {
  if (customAlertMessage) customAlertMessage.textContent = mensagem;
  if (customAlertOverlay) customAlertOverlay.classList.remove('hidden');
}

if (btnCloseAlert) {
  btnCloseAlert.addEventListener('click', () => {
    customAlertOverlay.classList.add('hidden');
  });
}

function removerAcentos(texto) {
  if (!texto) return "";
  return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function verificarSeGestor(nome) {
  const listaGestores = ["bruno sa", "eduardo pereira", "luis novo", "alfordes manuel", "alfordes manuel da costa joao", "alfordes joao", "ines casanova"];
  return listaGestores.includes(removerAcentos(nome));
}

function verificarSeComercial(nome) {
  return COMERCIAIS_UM.includes(removerAcentos(nome));
}

function cardPermitidoParaUtilizador(cardTag) {
  if (isGestorAtual) return true;
  if (isComercialAtual) return (cardTag === 'epi' || cardTag === 'marketing');
  return (cardTag === 'epi' || cardTag.includes('consumíveis'));
}

function aplicarFiltrosVisualizacao() {
  const selectedCategory = categoryFilter ? categoryFilter.value.toLowerCase() : 'todos';

  if (categoryFilter) {
    Array.from(categoryFilter.options).forEach(opt => {
      const val = opt.value.toLowerCase();
      if (val === 'todos') {
        opt.style.display = 'block';
        opt.disabled = false;
        return;
      }
      if (isGestorAtual) {
        opt.style.display = 'block';
        opt.disabled = false;
      } else if (isComercialAtual) {
        opt.style.display = (val === 'epi' || val === 'marketing') ? 'block' : 'none';
        opt.disabled = !(val === 'epi' || val === 'marketing');
      } else {
        opt.style.display = 'block';
        opt.disabled = false;
      }
    });
  }

  allCards.forEach(card => {
    const tagEl = card.querySelector('.tag');
    if (!tagEl) return;
    const cardTag = tagEl.innerText.toLowerCase();
    const permitidoPorPerfil = cardPermitidoParaUtilizador(cardTag);

    if (!permitidoPorPerfil) {
      card.style.display = 'none';
      return;
    }

    if (selectedCategory === 'todos' || cardTag === selectedCategory) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

function entrar() {
  if (!usernameInput) return;
  const nomeDigitadoBruto = usernameInput.value.trim();
  
  if (nomeDigitadoBruto === "") {
    mostrarAlerta("Por favor, digite o seu nome para continuar.");
    return;
  }

  if (nomeDigitadoBruto.split(/\s+/).length < 2) {
    mostrarAlerta("Por favor, coloque o seu primeiro e último nome (ex: João Silva).");
    return;
  }

  const nomeLimpo = removerAcentos(nomeDigitadoBruto);
  const colaboradorExiste = COLABORADORES_UM.includes(nomeLimpo);

  if (!colaboradorExiste) {
    mostrarAlerta("Utilizador não registado no sistema. Aplicação para uso exclusivo de colaboradores da UM.");
    return;
  }

  nomeColaborador = nomeDigitadoBruto;
  isGestorAtual = verificarSeGestor(nomeColaborador);
  isComercialAtual = verificarSeComercial(nomeColaborador);

  if (categoryFilter) categoryFilter.value = "Todos"; 
  aplicarFiltrosVisualizacao();

  if (displayUsername) displayUsername.textContent = nomeColaborador;
  if (loginOverlay) loginOverlay.classList.add('hidden');
  if (mainPortal) mainPortal.classList.remove('hidden');
}

if (btnLogin) {
  btnLogin.addEventListener('click', entrar);
}

if (usernameInput) {
  usernameInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') entrar(); 
  });
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    if (mainPortal) mainPortal.classList.add('hidden');
    if (loginOverlay) loginOverlay.classList.remove('hidden');
    if (usernameInput) usernameInput.value = "";
    carrinho = [];
    if (orderNotes) orderNotes.value = ""; 
    if (categoryFilter) categoryFilter.value = "Todos";
    isGestorAtual = false;
    isComercialAtual = false;
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', () => {
    aplicarFiltrosVisualizacao();
  });
}

document.querySelectorAll('.card-image img').forEach(img => {
  img.addEventListener('click', () => {
    if (expandedImage && imageModal) {
      expandedImage.src = img.src; 
      imageModal.classList.remove('hidden');
    }
  });
});

if (closeImageModal) {
  closeImageModal.addEventListener('click', () => {
    imageModal.classList.add('hidden');
  });
}

if (imageModal) {
  imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) { 
      imageModal.classList.add('hidden');
    }
  });
}

document.querySelectorAll('.btn-add-item').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    const tituloBase = card.querySelector('.card-title').innerText;
    const categoriaMaterial = card.querySelector('.tag').innerText.trim(); 
    const inputQuantidade = card.querySelector('.quantity-input');
    const quantidade = parseInt(inputQuantidade.value);

    const sizeSelect = card.querySelector('.size-select');
    let nomeMaterial = tituloBase;
    let tamanhoEscolhido = "";

    if (sizeSelect) {
      tamanhoEscolhido = sizeSelect.value;
      nomeMaterial = `${tituloBase} - ${tamanhoEscolhido}`;
    }

    if (quantidade > 0) {
      const itemExistente = carrinho.find(item => item.nome === nomeMaterial && item.categoria === categoriaMaterial);
      if (itemExistente) {
        itemExistente.quantidade += quantidade;
      } else {
        carrinho.push({ 
          nome: nomeMaterial, 
          tituloBase: tituloBase, 
          quantidade: quantidade, 
          categoria: categoriaMaterial,
          tamanho: tamanhoEscolhido
        });
      }

      const textoOriginal = btn.innerText;
      btn.innerText = "Adicionado ✓";
      btn.classList.add('item-added');
      setTimeout(() => {
        btn.innerText = textoOriginal;
        btn.classList.remove('item-added');
      }, 1500);
      inputQuantidade.value = 1;
    }
  });
});

function atualizarListaPreview() {
  if (!previewList) return;
  previewList.innerHTML = "";
  if (carrinho.length === 0) {
    previewList.innerHTML = "<li><span style='color: var(--text-muted);'>O carrinho está vazio.</span></li>";
    return;
  }
  carrinho.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item.nome} <small style="color: var(--primary-color); font-weight: 600;">[${item.categoria}]</small></span> 
      <div style="display: flex; align-items: center; gap: 15px;">
        <strong>x${item.quantidade}</strong>
        <button class="btn-remove-item" data-index="${index}" title="Remover Artigo">✕</button>
      </div>
    `;
    previewList.appendChild(li);
  });

  document.querySelectorAll('.btn-remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const indexParaRemover = e.target.getAttribute('data-index');
      carrinho.splice(indexParaRemover, 1); 
      atualizarListaPreview(); 
    });
  });
}

if (btnVerPedido) {
  btnVerPedido.addEventListener('click', () => {
    if (carrinho.length === 0) {
      mostrarAlerta("O carrinho está vazio. Adicione material primeiro.");
      return;
    }
    if (previewUsername) previewUsername.textContent = nomeColaborador;
    atualizarListaPreview(); 
    
    const notasAdicionais = orderNotes ? orderNotes.value.trim() : "";
    if (notasAdicionais !== "") {
      if (previewObsText) previewObsText.textContent = notasAdicionais;
      if (previewObsContainer) previewObsContainer.classList.remove('hidden');
    } else {
      if (previewObsContainer) previewObsContainer.classList.add('hidden');
    }
    
    if (mainPortal) mainPortal.classList.add('hidden');
    if (previewOverlay) previewOverlay.classList.remove('hidden');
  });
}

if (btnFecharPreview) {
  btnFecharPreview.addEventListener('click', () => {
    if (previewOverlay) previewOverlay.classList.add('hidden');
    if (mainPortal) mainPortal.classList.remove('hidden');
  });
}

if (btnSubmitOrder) {
  btnSubmitOrder.addEventListener('click', () => {
    if (carrinho.length === 0) {
      mostrarAlerta("O carrinho está vazio. Adicione material primeiro.");
      return;
    }

    btnSubmitOrder.innerText = "A guardar...";
    btnSubmitOrder.disabled = true;

    if (finalUsername) finalUsername.textContent = nomeColaborador;
    if (summaryList) summaryList.innerHTML = "";
    
    carrinho.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.nome} <small style="color: var(--primary-color);">[${item.categoria}]</small></span> <strong>x${item.quantidade}</strong>`;
      if (summaryList) summaryList.appendChild(li);
    });

    const notasAdicionais = orderNotes ? orderNotes.value.trim() : "";
    if (notasAdicionais !== "" && summaryList) {
      const liObs = document.createElement('li');
      liObs.innerHTML = `<span style="color: var(--text-muted); font-size: 0.85rem;">Obs: ${notasAdicionais}</span>`;
      summaryList.appendChild(liObs);
    }

    const pedidoID = Date.now();
    const dataAtual = new Date().toLocaleString('pt-PT');

    const pedido = {
      id: pedidoID,
      colaborador: nomeColaborador,
      data: dataAtual,
      itens: [...carrinho],
      observacoes: notasAdicionais
    };
    
    const historicoAntigo = JSON.parse(localStorage.getItem('historicoRequisicoes')) || [];
    historicoAntigo.push(pedido);
    localStorage.setItem('historicoRequisicoes', JSON.stringify(histor
