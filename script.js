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
  // Gestores acedem a tudo. Colaboradores comuns / comerciais regulam-se pelas suas tags.
  if (isComercialAtual) return (cardTag === 'epi' || cardTag === 'marketing');
  return (cardTag === 'epi');
}

function aplicarFiltrosVisualizacao() {
  const selectedCategory = categoryFilter ? categoryFilter.value.toLowerCase() : 'todos';

  if (categoryFilter) {
    Array.from(categoryFilter.options).forEach
