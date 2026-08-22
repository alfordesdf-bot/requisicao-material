
// ELEMENTOS DO DOM
const loginOverlay = document.getElementById('login-overlay');
const mainPortal = document.getElementById('main-portal');
const summaryOverlay = document.getElementById('summary-overlay');
const historicoOverlay = document.getElementById('historico-overlay');

const usernameInput = document.getElementById('username-input');
const btnLogin = document.getElementById('btn-login');
const displayUsername = document.getElementById('display-username');
const finalUsername = document.getElementById('final-username');

const btnSubmitOrder = document.getElementById('btn-submit-order');
const btnNewOrder = document.getElementById('btn-new-order');
const btnEditOrder = document.getElementById('btn-edit-order');
const btnVerHistorico = document.getElementById('btn-ver-historico');
const btnVoltarCatalogo = document.getElementById('btn-voltar-catalogo');

const summaryList = document.getElementById('summary-list');
const historicoContainer = document.getElementById('historico-container');

// O famoso link que estava a brincar às escondidas
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbyNGjv0TPi5gCaCdxxv1JLQ2TphoZljvScyQgqf_qq0YK6fFjqVuiDCzS04ltO4yHjR2A/exec";

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
});

// 2. ADICIONAR MATERIAL
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

// 3. SUBMETER REQUISIÇÃO (Google Sheets + Histórico Local)
btnSubmitOrder.addEventListener('click', () => {
  if (carrinho.length === 0) {
    alert("O carrinho está vazio.");
    return;
  }

  btnSubmitOrder.innerText = "A guardar pedido...";
  btnSubmitOrder.disabled = true;

  finalUsername.textContent = nomeColaborador;
  summaryList.innerHTML = "";
  let materiaisTexto = "";

  carrinho.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.nome}</span> <strong>x${item.quantidade}</strong>`;
    summaryList.appendChild(li);
    // Formata o texto para ficar direito nas células do Excel
    materiaisTexto += `${item.quantidade}x ${item.nome}\n`;
  });

  const pedidoID = Date.now();
  const dataAtual = new Date().toLocaleString('pt-PT');

  // Guardar no "Banco de Dados Local" (localStorage para o histórico)
  const pedido = {
    id: pedidoID,
    colaborador: nomeColaborador,
    data: dataAtual,
    itens: [...carrinho]
  };
  
  const historicoAntigo = JSON.parse(localStorage.getItem('historicoRequisicoes')) || [];
  historicoAntigo.push(pedido);
  localStorage.setItem('historicoRequisicoes', JSON.stringify(historicoAntigo));

  // Dados para o Google Sheets
  const dadosSheet = {
    id: pedidoID,
    data: dataAtual,
    colaborador: nomeColaborador,
    materiais: materiaisTexto
  };

  // Enviar para o Google Sheets
  fetch(GOOGLE_SHEETS_URL, {
    method: "POST",
    mode: "no-cors", 
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dadosSheet)
  })
  .then(() => {
    mainPortal.classList.add('hidden');
    summaryOverlay.classList.remove('hidden');
    btnSubmitOrder.innerText = "Submeter Requisição";
    btnSubmitOrder.disabled = false;
  })
  .catch(error => {
    alert("Erro de ligação ao Excel. O pedido ficou salvo no histórico local.");
    btnSubmitOrder.innerText = "Submeter Requisição";
    btnSubmitOrder.disabled = false;
  });
});

// 4. EDITAR REQUISIÇÃO (Volta ao ecrã com os dados do carrinho lá guardados)
btnEditOrder.addEventListener('click', () => {
  summaryOverlay.classList.add('hidden');
  mainPortal.classList.remove('hidden');
});

// 5. NOVA REQUISIÇÃO (Zera tudo)
btnNewOrder.addEventListener('click', () => {
  carrinho = [];
  summaryOverlay.classList.add('hidden');
  mainPortal.classList.remove('hidden');
});

// 6. VER HISTÓRICO
btnVerHistorico.addEventListener('click', () => {
  const historicoSalvo = JSON.parse(localStorage.getItem('historicoRequisicoes')) || [];
  historicoContainer.innerHTML = ""; 

  if (historicoSalvo.length === 0) {
    historicoContainer.innerHTML = "<p style='color: var(--text-muted);'>Ainda não há pedidos submetidos.</p>";
  } else {
    // Inverter para mostrar os mais recentes primeiro
    historicoSalvo.reverse().forEach(pedido => {
      let itensHTML = pedido.itens.map(i => `<li>${i.nome} - <span style="color:var(--gold-primary)">x${i.quantidade}</span></li>`).join('');
      
      const div = document.createElement('div');
      div.className = 'historico-item';
      div.innerHTML = `
        <span class="historico-data">${pedido.data}</span>
        <p><strong style="color:var(--gold-primary)">Colaborador:</strong> ${pedido.colaborador}</p>
        <ul style="margin-top: 10px; list-style: inside; color: var(--text-muted); font-size: 0.9rem;">
          ${itensHTML}
        </ul>
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
