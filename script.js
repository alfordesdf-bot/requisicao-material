// Elementos do DOM
const loginOverlay = document.getElementById('login-overlay');
const mainPortal = document.getElementById('main-portal');
const usernameInput = document.getElementById('username-input');
const btnLogin = document.getElementById('btn-login');
const displayUsername = document.getElementById('display-username');
const btnLogout = document.getElementById('btn-logout');

// Função para validar o nome e aceder ao portal
function entrar() {
  const nome = usernameInput.value.trim();
  if (nome === "") {
    alert("Por favor, digite o seu nome para continuar.");
    return;
  }
  displayUsername.textContent = nome;
  loginOverlay.style.display = 'none';
  mainPortal.classList.remove('hidden');
}

// Eventos de clique e tecla Enter
btnLogin.addEventListener('click', entrar);

usernameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') entrar();
});

// Botão para trocar de utilizador / sair
btnLogout.addEventListener('click', () => {
  mainPortal.classList.add('hidden');
  loginOverlay.style.display = 'flex';
  usernameInput.value = "";
  usernameInput.focus();
});