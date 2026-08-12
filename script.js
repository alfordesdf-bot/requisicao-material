// ELEMENTOS DO DOM
const loginOverlay = document.getElementById('login-overlay');
const mainPortal = document.getElementById('main-portal');
const summaryOverlay = document.getElementById('summary-overlay');

const usernameInput = document.getElementById('username-input');
const btnLogin = document.getElementById('btn-login');
const displayUsername = document.getElementById('display-username');
const finalUsername = document.getElementById('final-username');
const btnLogout = document.getElementById('btn-logout');

const btnSubmitOrder = document.getElementById('btn-submit-order');
const btnNewOrder = document.getElementById('btn-new-order');
const summaryList = document.getElementById('summary-list');

// VARIÁVEL PARA GUARDAR OS PEDIDOS (Carrinho)
let carrinho = [];
let nomeColaborador = "";

// 1. FUNÇÃO DE ENTRADA (LOGIN)
function entrar() {
  nomeColaborador = usernameInput.value.trim();
  if (nomeColaborador === "") {
    alert("Por favor, digite o seu nome para continuar.");
    return;
  }
  displayUsername.textContent = nomeColaborador;
  loginOverlay.classList.add('hidden');
  mainPortal.classList.remove('hidden');
}

btnLogin.addEventListener('click', entrar);
usernameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') entrar();
});

btnLogout.addEventListener('click', () => {
  mainPortal.classList.add('hidden');
  loginOverlay.classList.remove('hidden');
  usernameInput.value = "";
  carrinho = []; // Limpa o carrinho ao sair
});

// 2. ADICIONAR MATERIAL AO PEDIDO
const btnAddItems = document.querySelectorAll('.btn-add-item');

btnAddItems.forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Procurar os dados do cartão clicado
    const card = e.target.closest('.card');
    const nomeMaterial = card.querySelector('.card-title').innerText;
    const inputQuantidade = card.querySelector('.quantity-input');
    const quantidade = parseInt(inputQuantidade.value);

    if (quantidade > 0) {
      // Verifica se já existe no carrinho para somar, ou adiciona novo
      const itemExistente = carrinho.find(item => item.nome === nomeMaterial);
      if (itemExistente) {
        itemExistente.quantidade += quantidade;
      } else {
        carrinho.push({ nome: nomeMaterial, quantidade: quantidade });
      }

      // Feedback visual: O botão fica verde por 1,5 segundos
      const textoOriginal = btn.innerText;
      btn.innerText = "Adicionado ✓";
      btn.classList.add('item-added');
      
      setTimeout(() => {
        btn.innerText = textoOriginal;
        btn.classList.remove('item-added');
      }, 1500);

      inputQuantidade.value = 1; // Repõe o contador a 1
    }
  });
});

// 3. FINALIZAR REQUISIÇÃO (GERAR LISTA)
btnSubmitOrder.addEventListener('click', () => {
  if (carrinho.length === 0) {
    alert("Não solicitou nenhum material. Adicione algo antes de finalizar.");
    return;
  }

  // Preencher os dados no ecrã de resumo
  finalUsername.textContent = nomeColaborador;
  summaryList.innerHTML = ""; // Limpa lista anterior

  carrinho.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.nome}</span> <strong>x${item.quantidade}</strong>`;
    summaryList.appendChild(li);
  });

  // Trocar de ecrã
  mainPortal.classList.add('hidden');
  summaryOverlay.classList.remove('hidden');
});

// 4. FAZER NOVA REQUISIÇÃO
btnNewOrder.addEventListener('click', () => {
  carrinho = []; // Esvaziar carrinho
  summaryOverlay.classList.add('hidden');
  mainPortal.classList.remove('hidden');
});