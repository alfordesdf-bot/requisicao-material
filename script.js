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

// URLS DOS DOIS GOOGLE SHEETS
const GOOGLE_SHEETS_HISTORICO_URL = "https://script.google.com/macros/s/AKfycbwrbwbbyZFX2odbXzit3LH8xbTfYD6KEaDNMAqPJFA1BVlKdKoeB2s-_FeL0h6eAKfu/exec";
const GOOGLE_SHEETS_EPI_URL = "https://script.google.com/macros/s/AKfycbzcGUVImy1_SFqqYYi65MUYL3Zk6KTsUMu6i4I8_UNFO0XCz0CIWkfu9OLWuJbTUmfuIQ/exec";

let carrinho = [];
let nomeColaborador = "";
let isGestorAtual = false;
let isComercialAtual = false;

// LISTA OFICIAL DE COLABORADORES DA UNIVERSAL MOTORS (Com Helder Casanova)
const COLABORADORES_UM = [
  "alfordes manuel",
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
  customAlertMessage.textContent = mensagem;
  customAlertOverlay.classList.remove('hidden');
}

btnCloseAlert.addEventListener('click', () => {
  customAlertOverlay.classList.add('hidden');
});

function removerAcentos(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function verificarSeGestor(nome) {
  const listaGestores = ["bruno sa", "eduardo pereira", "luis novo", "alfordes manuel", "ines casanova"];
  return listaGestores.includes(removerAcentos(nome));
}

function verificarSeComercial(nome) {
  return COMERCIAIS_UM.includes(removerAcentos(nome));
}

// Função unificada para decidir se um cartão deve aparecer com base na categoria e permissões
function cardPermitidoParaUtilizador(cardTag) {
  if (isGestorAtual) return true;
  if (isComercialAtual) return (cardTag === 'epi' || cardTag === 'marketing');
  return (cardTag === 'epi');
}

function aplicarFiltrosVisualizacao() {
  const selectedCategory = categoryFilter.value.toLowerCase();

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
      opt.style.display = (val === 'epi') ? 'block' : 'none';
      opt.disabled = !(val === 'epi');
    }
  });

  allCards.forEach(card => {
    const cardTag = card.querySelector('.tag').innerText.toLowerCase();
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

  categoryFilter.value = "Todos"; 
  aplicarFiltrosVisualizacao();

  displayUsername.textContent = nomeColaborador;
  loginOverlay.classList.add('hidden');
  mainPortal.classList.remove('hidden');
}

btnLogin.addEventListener('click', entrar);
usernameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') entrar(); });

document.getElementById('btn-logout').addEventListener('click', () => {
  mainPortal.classList.add('hidden');
  loginOverlay.classList.remove('hidden');
  usernameInput.value = "";
  carrinho = [];
  orderNotes.value = ""; 
  categoryFilter.value = "Todos";
  isGestorAtual = false;
  isComercialAtual = false;
});

categoryFilter.addEventListener('change', () => {
  aplicarFiltrosVisualizacao();
});

document.querySelectorAll('.card-image img').forEach(img => {
  img.addEventListener('click', () => {
    expandedImage.src = img.src; 
    imageModal.classList.remove('hidden');
  });
});

closeImageModal.addEventListener('click', () => {
  imageModal.classList.add('hidden');
});
imageModal.addEventListener('click', (e) => {
  if (e.target === imageModal) { 
    imageModal.classList.add('hidden');
  }
});

document.querySelectorAll('.btn-add-item').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    const tituloBase = card.querySelector('.card-title').innerText;
    const categoriaMaterial = card.querySelector('.tag').innerText; 
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
      const itemExistente = carrinho.find(item => item.nome === nomeMaterial);
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
  previewList.innerHTML = "";
  if (carrinho.length === 0) {
    previewList.innerHTML = "<li><span style='color: var(--text-muted);'>O carrinho está vazio.</span></li>";
    return;
  }
  carrinho.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item.nome}</span> 
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

btnVerPedido.addEventListener('click', () => {
  if (carrinho.length === 0) {
    mostrarAlerta("O carrinho está vazio. Adicione material primeiro.");
    return;
  }
  previewUsername.textContent = nomeColaborador;
  atualizarListaPreview(); 
  
  const notasAdicionais = orderNotes.value.trim();
  if (notasAdicionais !== "") {
    previewObsText.textContent = notasAdicionais;
    previewObsContainer.classList.remove('hidden');
  } else {
    previewObsContainer.classList.add('hidden');
  }
  
  mainPortal.classList.add('hidden');
  previewOverlay.classList.remove('hidden');
});

btnFecharPreview.addEventListener('click', () => {
  previewOverlay.classList.add('hidden');
  mainPortal.classList.remove('hidden');
});

btnSubmitOrder.addEventListener('click', () => {
  if (carrinho.length === 0) {
    mostrarAlerta("O carrinho está vazio. Adicione material primeiro.");
    return;
  }

  btnSubmitOrder.innerText = "A guardar...";
  btnSubmitOrder.disabled = true;

  finalUsername.textContent = nomeColaborador;
  summaryList.innerHTML = "";
  
  carrinho.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.nome}</span> <strong>x${item.quantidade}</strong>`;
    summaryList.appendChild(li);
  });

  const notasAdicionais = orderNotes.value.trim();
  if (notasAdicionais !== "") {
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
  localStorage.setItem('historicoRequisicoes', JSON.stringify(historicoAntigo));

  const dadosSheet = {
    id: pedidoID,
    data: dataAtual,
    colaborador: nomeColaborador,
    itens: carrinho, 
    observacoes: notasAdicionais
  };

  fetch(GOOGLE_SHEETS_HISTORICO_URL, {
    method: "POST",
    mode: "no-cors", 
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(dadosSheet)
  }).catch(err => console.log("Erro no envio para o histórico geral:", err));

  fetch(GOOGLE_SHEETS_EPI_URL, {
    method: "POST",
    mode: "no-cors", 
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(dadosSheet)
  })
  .then(() => {
    mainPortal.classList.add('hidden');
    summaryOverlay.classList.remove('hidden');
    btnSubmitOrder.innerText = "Submeter";
    btnSubmitOrder.disabled = false;
  })
  .catch(error => {
    mostrarAlerta("Erro de ligação ao ficheiro de EPIs. O pedido ficou salvo no histórico local.");
    btnSubmitOrder.innerText = "Submeter";
    btnSubmitOrder.disabled = false;
  });
});

btnNewOrder.addEventListener('click', () => {
  carrinho = [];
  orderNotes.value = "";
  usernameInput.value = "";
  nomeColaborador = "";
  categoryFilter.value = "Todos";
  isGestorAtual = false;
  isComercialAtual = false;
  
  aplicarFiltrosVisualizacao();

  summaryOverlay.classList.add('hidden');
  loginOverlay.classList.remove('hidden');
});

btnVerHistorico.addEventListener('click', () => {
  const historicoSalvo = JSON.parse(localStorage.getItem('historicoRequisicoes')) || [];
  historicoContainer.innerHTML = ""; 

  if (historicoSalvo.length === 0) {
    historicoContainer.innerHTML = "<p style='color: var(--text-muted);'>Ainda não há pedidos submetidos.</p>";
  } else {
    historicoSalvo.reverse().forEach(pedido => {
      let itensHTML = pedido.itens.map(i => `<li>${i.nome} - <span style="color:var(--primary-color); font-weight: bold;">x${i.quantidade}</span></li>`).join('');
      let obsHTML = pedido.observacoes ? `<p style="margin-top: 5px; font-size: 0.85rem; color: var(--text-muted);"><em>Obs: ${pedido.observacoes}</em></p>` : "";
      
      const div = document.createElement('div');
      div.className = 'historico-item';
      div.innerHTML = `
        <span class="historico-data">${pedido.data}</span>
        <p><strong style="color:var(--primary-color)">Colaborador:</strong> ${pedido.colaborador}</p>
        <ul style="margin-top: 10px; list-style: inside; color: var(--text-muted); font-size: 0.9rem;">
          ${itensHTML}
        </ul>
        ${obsHTML}
      `;
      historicoContainer.appendChild(div);
    });
  }

  mainPortal.classList.add('hidden');
  historicoOverlay.classList.remove('hidden');
});

btnVoltarCatalogo.addEventListener('click', () => {
  historicoOverlay.classList.add('hidden');
  mainPortal.classList.remove('hidden');
});
