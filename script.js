// ELEMENTOS DO DOM
const loginOverlay = document.getElementById('login-overlay');
const mainPortal = document.getElementById('main-portal');
const summaryOverlay = document.getElementById('summary-overlay');
const previewOverlay = document.getElementById('preview-overlay'); 
const historicoOverlay = document.getElementById('historico-overlay');
const imageModal = document.getElementById('image-modal'); // NOVO: Modal da Imagem

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

// Elementos do Filtro e Modal de Imagem (NOVO)
const categoryFilter = document.getElementById('category-filter');
const allCards = document.querySelectorAll('.card');
const expandedImage = document.getElementById('expanded-image');
const closeImageModal = document.getElementById('close-image-modal');

// O TEU LINK DO GOOGLE SHEETS JÁ AQUI CONFIGURADO
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxHM3FMD6_wzy7MWyC6YRCR8F20wX2WaAdvtvQcOcMgi3KjoYX7mYvEZmnzDyLEuO8-2A/exec";

// VARIÁVEIS GLOBAIS
let carrinho = [];
let nomeColaborador = "";

// 1. LOGIN
function entrar() {
  nomeColaborador = usernameInput.value.trim();
  if (nomeColaborador === "") {
    alert("Por favor, digite o seu nome.");
    return;
  }
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
});

// 2. FILTRAR POR CATEGORIA (NOVO)
categoryFilter.addEventListener('change', (e) => {
  const selectedCategory = e.target.value.toLowerCase();

  allCards.forEach(card => {
    const cardTag = card.querySelector('.tag').innerText.toLowerCase();
    
    // Se selecionou "Todos" ou se a tag do cartão for igual à selecionada, mostra o cartão
    if (selectedCategory === 'todos' || cardTag === selectedCategory) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none'; // Esconde os outros
    }
  });
});

// 3. AMPLIAR IMAGEM - LIGHTBOX (NOVO)
document.querySelectorAll('.card-image img').forEach(img => {
  img.addEventListener('click', () => {
    expandedImage.src = img.src; // Copia a foto clicada para o ecrã grande
    imageModal.classList.remove('hidden');
  });
});

// Fechar a imagem ampliada
closeImageModal.addEventListener('click', () => {
  imageModal.classList.add('hidden');
});
imageModal.addEventListener('click', (e) => {
  if (e.target === imageModal) { // Fecha se clicar no fundo preto
    imageModal.classList.add('hidden');
  }
});

// 4. ADICIONAR MATERIAL AO CARRINHO
document.querySelectorAll('.btn-add-item').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    const nomeMaterial = card.querySelector('.card-title').innerText;
    const inputQuantidade = card.querySelector('.quantity-input');
    const quantidade = parseInt(inputQuantidade.value);

    if (quantidade > 0) {
      const itemExistente = carrinho.find(item => item.nome === nomeMaterial);
      if (itemExistente) {
        itemExistente.quantidade += quantidade;
      } else {
        carrinho.push({ nome: nomeMaterial, quantidade: quantidade });
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

// 5. VER PEDIDO (Pré-visualização)
btnVerPedido.addEventListener('click', () => {
  if (carrinho.length === 0) {
    alert("O carrinho está vazio. Adicione material primeiro.");
    return;
  }
  
  previewUsername.textContent = nomeColaborador;
  previewList.innerHTML = "";
  
  carrinho.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.nome}</span> <strong>x${item.quantidade}</strong>`;
    previewList.appendChild(li);
  });
  
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

// 6. SUBMETER REQUISIÇÃO
btnSubmitOrder.addEventListener('click', () => {
  if (carrinho.length === 0) {
    alert("O carrinho está vazio.");
    return;
  }

  btnSubmitOrder.innerText = "A guardar...";
  btnSubmitOrder.disabled = true;

  finalUsername.textContent = nomeColaborador;
  summaryList.innerHTML = "";
  let materiaisTexto = "";

  carrinho.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.nome}</span> <strong>x${item.quantidade}</strong>`;
    summaryList.appendChild(li);
    materiaisTexto += `${item.quantidade}x ${item.nome}\n`;
  });

  const notasAdicionais = orderNotes.value.trim();
  if (notasAdicionais !== "") {
    materiaisTexto += `\n[OBSERVAÇÕES]: ${notasAdicionais}`;
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
    materiais: materiaisTexto
  };

  fetch(GOOGLE_SHEETS_URL, {
    method: "POST",
    mode: "no-cors", 
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(dadosSheet)
  })
  .then(() => {
    mainPortal.classList.add('hidden');
    summaryOverlay.classList.remove('hidden');
    btnSubmitOrder.innerText = "Submeter";
    btnSubmitOrder.disabled = false;
  })
  .catch(error => {
    alert("Erro de ligação ao Excel. O pedido ficou salvo no histórico local.");
    btnSubmitOrder.innerText = "Submeter";
    btnSubmitOrder.disabled = false;
  });
});

// 7. NOVA REQUISIÇÃO
btnNewOrder.addEventListener('click', () => {
  carrinho = [];
  orderNotes.value = "";
  usernameInput.value = "";
  nomeColaborador = "";
  categoryFilter.value = "Todos"; // Reseta o filtro para a nova pessoa
  
  // Mostrar todos os cartões novamente
  allCards.forEach(card => card.style.display = 'flex');

  summaryOverlay.classList.add('hidden');
  loginOverlay.classList.remove('hidden');
});

// 8. VER HISTÓRICO
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

// Voltar do Histórico
btnVoltarCatalogo.addEventListener('click', () => {
  historicoOverlay.classList.add('hidden');
  mainPortal.classList.remove('hidden');
});
