/* =====================================================
   UVT LOCALYZE — APP.JS COMPLETO
   MVP público sem dependência do Firebase Storage
===================================================== */

const META_IMPACTO = 300;
const META_FINAL_PROJETO = 15000;
const LIMITE_DIARIO_LOCAL = 50;

const INSTAGRAM_URL = "https://www.instagram.com/altapiata/?__pwa=1#";
const LINKEDIN_URL = "https://www.linkedin.com/in/altapiat%C3%A3/";

let saldo = parseInt(localStorage.getItem("uvt") || "0", 10);
let impactoTotal = parseInt(localStorage.getItem("impactoUVT") || "0", 10);
let totalGeradoUsuario = parseInt(localStorage.getItem("totalGeradoUVT") || saldo || "0", 10);


/* =====================================================
   TEXTOS / IDIOMA
===================================================== */

function getLang() {
  return localStorage.getItem("uvt_lang") || "en";
}

function txt(key) {
  const lang = getLang();

  const t = {
    en: {
      dailyLimit: "Daily limit reached. Come back tomorrow.",
      loginRequired: "Please sign in with Google before submitting.",
      placeMissing: "Fill in the place name and description.",
      problemMissing: "Describe the issue before submitting.",
      suggestionMissing: "Write a suggestion before submitting.",
      indicationMissing: "Fill in at least the name and reason.",
      pollDone: "You already answered this survey.",
      priorityDone: "You already voted in this stage.",
      genericError: "Could not register your participation now.",
      pollSuccess: "Answer registered. You helped define the project.",
      suggestionSuccess: "Suggestion registered. Your idea entered the system.",
      problemSuccess: "Issue reported. This helps map local demands.",
      placeSuccess: "Place suggested. You helped expand the community map.",
      prioritySuccess: "Vote registered. Your priority entered the panel.",
      shareSuccess: "Recommendation registered. You helped the project grow.",
      communitySuccess: "Participation registered. Community action added.",
      noData: "No data registered yet.",
      dashboardWaiting: "Waiting for participation",
      dashboardInsightEmpty: "First signals are being collected. Participate to help reveal community priorities.",
      goalReached: "The project reached the execution milestone.",
      maxLevel: "You reached the maximum level of this phase.",
      nextLevel: "UVT to the next level.",
      insufficientBalance: "Insufficient balance.",
      rewardReady: "Your achievement is ready ✨",
      downloadImage: "Download image",
      close: "Close",
      continue: "Continue"
    },
    pt: {
      dailyLimit: "Limite diário atingido. Volte amanhã.",
      loginRequired: "Faça login com Google antes de enviar.",
      placeMissing: "Preencha o nome e a descrição do local.",
      problemMissing: "Descreva o problema antes de enviar.",
      suggestionMissing: "Escreva uma sugestão antes de enviar.",
      indicationMissing: "Preencha pelo menos o nome e o motivo.",
      pollDone: "Você já respondeu essa enquete.",
      priorityDone: "Você já votou nesta etapa.",
      genericError: "Não foi possível registrar sua participação agora.",
      pollSuccess: "Resposta registrada. Você ajudou a definir o projeto.",
      suggestionSuccess: "Sugestão registrada. Sua ideia entrou no sistema.",
      problemSuccess: "Problema registrado. Isso ajuda a mapear demandas locais.",
      placeSuccess: "Local indicado. Você ajudou a ampliar o mapa da comunidade.",
      prioritySuccess: "Voto registrado. Sua prioridade entrou no painel.",
      shareSuccess: "Indicação registrada. Você ajudou o projeto a crescer.",
      communitySuccess: "Participação registrada. Ação comunitária adicionada.",
      noData: "Ainda não há dados registrados.",
      dashboardWaiting: "Aguardando participação",
      dashboardInsightEmpty: "Os primeiros sinais estão sendo coletados. Participe para ajudar a revelar as prioridades da comunidade.",
      goalReached: "O projeto alcançou o marco de execução.",
      maxLevel: "Você alcançou o nível máximo desta fase.",
      nextLevel: "UVT para o próximo nível.",
      insufficientBalance: "Saldo insuficiente.",
      rewardReady: "Sua conquista está pronta ✨",
      downloadImage: "Baixar imagem",
      close: "Fechar",
      continue: "Continuar"
    },
    es: {
      dailyLimit: "Límite diario alcanzado. Vuelve mañana.",
      loginRequired: "Inicia sesión con Google antes de enviar.",
      placeMissing: "Completa el nombre y la descripción del lugar.",
      problemMissing: "Describe el problema antes de enviar.",
      suggestionMissing: "Escribe una sugerencia antes de enviar.",
      indicationMissing: "Completa al menos el nombre y el motivo.",
      pollDone: "Ya respondiste esta encuesta.",
      priorityDone: "Ya votaste en esta etapa.",
      genericError: "No fue posible registrar tu participación ahora.",
      pollSuccess: "Respuesta registrada. Ayudaste a definir el proyecto.",
      suggestionSuccess: "Sugerencia registrada. Tu idea entró al sistema.",
      problemSuccess: "Problema registrado. Esto ayuda a mapear demandas locales.",
      placeSuccess: "Lugar indicado. Ayudaste a ampliar el mapa comunitario.",
      prioritySuccess: "Voto registrado. Tu prioridad entró al panel.",
      shareSuccess: "Indicación registrada. Ayudaste al proyecto a crecer.",
      communitySuccess: "Participación registrada. Acción comunitaria añadida.",
      noData: "Aún no hay datos registrados.",
      dashboardWaiting: "Esperando participación",
      dashboardInsightEmpty: "Las primeras señales se están recopilando. Participa para revelar prioridades.",
      goalReached: "El proyecto alcanzó el hito de ejecución.",
      maxLevel: "Alcanzaste el nivel máximo de esta fase.",
      nextLevel: "UVT para el próximo nivel.",
      insufficientBalance: "Saldo insuficiente.",
      rewardReady: "Tu logro está listo ✨",
      downloadImage: "Descargar imagen",
      close: "Cerrar",
      continue: "Continuar"
    }
  };

  return t[lang]?.[key] || t.en[key];
}


/* =====================================================
   HELPERS
===================================================== */

function salvarSaldo() {
  localStorage.setItem("uvt", saldo);
}

function salvarImpacto() {
  localStorage.setItem("impactoUVT", impactoTotal);
}

function salvarTotalGerado() {
  localStorage.setItem("totalGeradoUVT", totalGeradoUsuario);
  localStorage.setItem("totalUVTGenerated", totalGeradoUsuario);
}

function formatarNumero(valor) {
  return Number(valor || 0).toLocaleString(getLang() === "en" ? "en-US" : "pt-BR");
}

function getLista(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave)) || [];
  } catch {
    return [];
  }
}

function setLista(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}

function getUser() {
  return window.firebaseUVT?.auth?.currentUser || null;
}


/* =====================================================
   LOGIN GOOGLE
===================================================== */

window.loginComGoogle = async function () {
  try {
    if (window.firebaseReady) await window.firebaseReady;

    const fb = window.firebaseUVT;

    if (!fb?.auth || !fb?.provider || !fb?.signInWithPopup) {
      alert("Firebase Auth não está configurado.");
      return null;
    }

    const result = await fb.signInWithPopup(fb.auth, fb.provider);
    return result.user;
  } catch (erro) {
    console.error("Erro no login:", erro);
    alert("Não foi possível fazer login com Google.");
    return null;
  }
};


/* =====================================================
   ANTI-FARM LOCAL
===================================================== */

function getControleDiarioLocal() {
  try {
    return JSON.parse(localStorage.getItem("controleUVT")) || {};
  } catch {
    return {};
  }
}

function podeGanharLocalmente(valor) {
  const hoje = new Date().toISOString().slice(0, 10);
  const controle = getControleDiarioLocal();

  if (!controle[hoje]) controle[hoje] = 0;

  if (controle[hoje] + valor > LIMITE_DIARIO_LOCAL) {
    alert(txt("dailyLimit"));
    return false;
  }

  return true;
}

function registrarGanhoLocal(valor) {
  const hoje = new Date().toISOString().slice(0, 10);
  const controle = getControleDiarioLocal();

  if (!controle[hoje]) controle[hoje] = 0;

  controle[hoje] += valor;
  localStorage.setItem("controleUVT", JSON.stringify(controle));
}


/* =====================================================
   UI BASE
===================================================== */

function atualizarSaldo() {
  document.querySelectorAll("#saldo").forEach((el) => {
    el.innerText = formatarNumero(saldo);
    el.classList.remove("saldo-pulse");
    void el.offsetWidth;
    el.classList.add("saldo-pulse");
  });
}

function atualizarImpacto() {
  const totalEl = document.getElementById("impactoTotal");
  const metaEl = document.getElementById("metaImpacto");
  const barraEl = document.getElementById("impactoBarra");

  if (totalEl) totalEl.innerText = formatarNumero(impactoTotal);
  if (metaEl) metaEl.innerText = formatarNumero(META_IMPACTO);

  if (barraEl) {
    const progresso = Math.min((impactoTotal / META_IMPACTO) * 100, 100);
    barraEl.style.width = progresso + "%";
  }
}

function atualizarTeaserDashboard() {
  const teaser = document.getElementById("teaserUVT");
  const insight = document.getElementById("teaserInsight");

  if (!teaser) return;

  teaser.innerText = formatarNumero(impactoTotal);

  const enquetes = getLista("enquetesUVT");
  const contagem = {};

  enquetes.forEach((e) => {
    contagem[e.resposta] = (contagem[e.resposta] || 0) + 1;
  });

  let maiorOpcao = "";
  let maiorValor = 0;

  Object.keys(contagem).forEach((chave) => {
    if (contagem[chave] > maiorValor) {
      maiorValor = contagem[chave];
      maiorOpcao = chave;
    }
  });

  if (insight) {
    insight.innerText = maiorOpcao
      ? `Tema em destaque: ${maiorOpcao} →`
      : "View community data →";
  }
}


/* =====================================================
   JORNADA DO PROJETO
===================================================== */

function getFaseProjetoAtual(total = impactoTotal) {
  const fases = [
    { nome: "Phase 1 — Discovery", minimo: 0, maximo: 300, objetivo: "Identify the main problem." },
    { nome: "Phase 2 — Direction", minimo: 300, maximo: 700, objetivo: "Define which path to follow." },
    { nome: "Phase 3 — Structuring", minimo: 700, maximo: 1500, objetivo: "Shape the project." },
    { nome: "Phase 4 — Planning", minimo: 1500, maximo: 3000, objetivo: "Define practical execution." },
    { nome: "Phase 5 — Consolidation", minimo: 3000, maximo: 5000, objetivo: "Refine and validate decisions." },
    { nome: "Phase 6 — Preparation", minimo: 5000, maximo: 10000, objetivo: "Organize people, resources and possibilities." },
    { nome: "Phase 7 — Activation", minimo: 10000, maximo: 15000, objetivo: "Prepare the real launch." },
    { nome: "Execution", minimo: 15000, maximo: 999999999, objetivo: "The project leaves the paper." }
  ];

  return fases.find((fase) => total >= fase.minimo && total < fase.maximo) || fases[fases.length - 1];
}

function atualizarJornadaProjeto() {
  const fill = document.getElementById("journeyProgressFill");
  const steps = document.querySelectorAll(".journey-step");

  if (fill) {
    const progresso = Math.min((impactoTotal / META_FINAL_PROJETO) * 100, 100);
    fill.style.width = progresso + "%";
  }

  steps.forEach((step) => {
    const min = parseInt(step.dataset.min || "0", 10);
    const max = parseInt(step.dataset.max || "999999999", 10);

    step.classList.remove("active", "done");

    if (impactoTotal >= max) {
      step.classList.add("done");
    } else if (impactoTotal >= min && impactoTotal < max) {
      step.classList.add("active");
    }
  });
}


/* =====================================================
   NÍVEL / REPUTAÇÃO
===================================================== */

function calcularNivelUsuario(totalGerado = totalGeradoUsuario) {
  const lang = getLang();

  const nomes = {
    en: ["Level 1 — Participant", "Level 2 — Contributor", "Level 3 — Mobilizer", "Level 4 — Local Guardian", "Level 5 — Ambassador"],
    pt: ["Nível 1 — Participante", "Nível 2 — Contribuidor", "Nível 3 — Mobilizador", "Nível 4 — Guardião Local", "Nível 5 — Embaixador"],
    es: ["Nivel 1 — Participante", "Nivel 2 — Contribuidor", "Nivel 3 — Movilizador", "Nivel 4 — Guardián Local", "Nivel 5 — Embajador"]
  };

  const n = nomes[lang] || nomes.en;

  const niveis = [
    { nome: n[0], minimo: 0, proximo: 100, icone: "🌱", classe: "level-1" },
    { nome: n[1], minimo: 100, proximo: 300, icone: "🤝", classe: "level-2" },
    { nome: n[2], minimo: 300, proximo: 700, icone: "🚀", classe: "level-3" },
    { nome: n[3], minimo: 700, proximo: 1500, icone: "🛡️", classe: "level-4" },
    { nome: n[4], minimo: 1500, proximo: null, icone: "👑", classe: "level-5" }
  ];

  return niveis.reduce((atual, nivel) => totalGerado >= nivel.minimo ? nivel : atual, niveis[0]);
}

function atualizarNivelUsuario() {
  const levelEl = document.getElementById("userLevel");
  const progressEl = document.getElementById("userLevelProgress");
  const nextEl = document.getElementById("userLevelNext");
  const iconEl = document.getElementById("levelIcon");
  const box = document.querySelector(".user-level-box");

  if (!levelEl || !progressEl || !nextEl || !iconEl || !box) return;

  const nivel = calcularNivelUsuario(totalGeradoUsuario);

  levelEl.innerText = nivel.nome;
  iconEl.innerText = nivel.icone;

  box.classList.remove("level-1", "level-2", "level-3", "level-4", "level-5");
  box.classList.add(nivel.classe);

  if (!nivel.proximo) {
    progressEl.style.width = "100%";
    nextEl.innerText = txt("maxLevel");
    return;
  }

  const progresso = Math.min(((totalGeradoUsuario - nivel.minimo) / (nivel.proximo - nivel.minimo)) * 100, 100);
  const faltam = Math.max(nivel.proximo - totalGeradoUsuario, 0);

  progressEl.style.width = progresso + "%";
  nextEl.innerText = `${formatarNumero(faltam)} ${txt("nextLevel")}`;
}


/* =====================================================
   TOAST / MODAIS
===================================================== */

function mostrarToast(valor, mensagem = "Participation registered.") {
  let toast = document.getElementById("uvtToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "uvtToast";
    toast.className = "uvt-toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <strong>+${valor} UVT</strong>
    <span>${mensagem}</span>
  `;

  toast.classList.add("active", "uvt-pop");

  setTimeout(() => toast.classList.remove("uvt-pop"), 500);
  setTimeout(() => toast.classList.remove("active"), 2800);
}

function mostrarLevelUp(nivel) {
  let modal = document.getElementById("levelUpModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "levelUpModal";
    modal.className = "levelup-modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="levelup-box">
      <div class="levelup-icon">${nivel.icone}</div>
      <h2>LEVEL UP</h2>
      <p class="sub">${nivel.nome}</p>
      <button onclick="fecharLevelUp()" class="btn primary">${txt("continue")}</button>
    </div>
  `;

  modal.classList.add("active");
}

window.fecharLevelUp = function () {
  const modal = document.getElementById("levelUpModal");
  if (modal) modal.classList.remove("active");
};


/* =====================================================
   FIRESTORE / UVT
===================================================== */

async function atualizarCarteiraFirestore() {
  try {
    if (window.firebaseReady) await window.firebaseReady;
    if (typeof window.buscarCarteiraUsuario !== "function") return;

    const dados = await window.buscarCarteiraUsuario();
    if (!dados) return;

    saldo = dados.saldoUVT || dados.uvtBalance || saldo || 0;
    totalGeradoUsuario = dados.totalGerado || dados.totalUVTGenerated || totalGeradoUsuario || 0;

    salvarSaldo();
    salvarTotalGerado();
  } catch (erro) {
    console.error("Erro ao atualizar carteira:", erro);
  }
}

async function atualizarImpactoColetivoFirestore() {
  try {
    if (window.firebaseReady) await window.firebaseReady;
    if (typeof window.buscarDadosDashboardFirestore !== "function") return;

    const dados = await window.buscarDadosDashboardFirestore();
    const actions = dados.actions || [];

    impactoTotal = actions.reduce((soma, item) => soma + Math.max(item.valorUVT || item.uvt || 0, 0), 0);

    salvarImpacto();
  } catch (erro) {
    console.error("Erro ao atualizar impacto:", erro);
  }
}

async function salvarAcaoFirestore(tipo, valor, dados = {}) {
  try {
    if (window.firebaseReady) await window.firebaseReady;

    if (typeof window.ganharUVTFirestore === "function") {
      const resultado = await window.ganharUVTFirestore(valor, tipo, dados);
      return resultado && resultado.sucesso === true;
    }

    const fb = window.firebaseUVT;
    const user = getUser();

    if (fb?.db && fb?.collection && fb?.addDoc) {
      await fb.addDoc(fb.collection(fb.db, "uvt_history"), {
        tipo,
        valorUVT: valor,
        dados,
        userId: user?.uid || "anonymous",
        userName: user?.displayName || "",
        userEmail: user?.email || "",
        createdAt: fb.serverTimestamp ? fb.serverTimestamp() : new Date().toISOString()
      });
    }

    return true;
  } catch (erro) {
    console.error("Erro ao salvar ação:", erro);
    alert(txt("genericError"));
    return false;
  }
}

async function ganhar(valor, tipo = "acao", dados = {}) {
  if (!podeGanharLocalmente(valor)) return false;

  const nivelAntes = calcularNivelUsuario(totalGeradoUsuario);

  try {
    const firestoreOk = await salvarAcaoFirestore(tipo, valor, dados);
    if (!firestoreOk) return false;

    saldo += valor;
    impactoTotal += valor;
    totalGeradoUsuario += valor;

    salvarSaldo();
    salvarImpacto();
    salvarTotalGerado();

    registrarGanhoLocal(valor);

    await atualizarCarteiraFirestore();
    await atualizarImpactoColetivoFirestore();

    atualizarSaldo();
    atualizarImpacto();
    atualizarTeaserDashboard();
    atualizarNivelUsuario();
    atualizarJornadaProjeto();

    const nivelDepois = calcularNivelUsuario(totalGeradoUsuario);

    if (nivelAntes.nome !== nivelDepois.nome) {
      mostrarLevelUp(nivelDepois);
    }

    return true;
  } catch (erro) {
    console.error("Erro ao ganhar UVT:", erro);
    alert(txt("genericError"));
    return false;
  }
}

async function gastar(valor) {
  if (saldo < valor) {
    alert(txt("insufficientBalance"));
    return false;
  }

  try {
    if (window.firebaseReady) await window.firebaseReady;

    if (typeof window.gastarUVTFirestore === "function") {
      const resultado = await window.gastarUVTFirestore(valor);
      if (!resultado || resultado.sucesso !== true) return false;
    }

    saldo -= valor;
    if (saldo < 0) saldo = 0;

    salvarSaldo();
    atualizarSaldo();

    return true;
  } catch (erro) {
    console.error("Erro ao gastar UVT:", erro);
    return false;
  }
}


/* =====================================================
   AÇÕES DO USUÁRIO — TODAS NO WINDOW
===================================================== */

window.responderEnquete = async function (resposta) {
  const perguntaAtual = "Qual prioridade merece mais atenção agora?";
  const enquetes = getLista("enquetesUVT");

  if (enquetes.find((e) => e.pergunta === perguntaAtual)) {
    alert(txt("pollDone"));
    return;
  }

  const sucesso = await ganhar(5, "poll", { pergunta: perguntaAtual, resposta });
  if (!sucesso) return;

  enquetes.push({ pergunta: perguntaAtual, resposta, valor: 5, data: new Date().toISOString() });
  setLista("enquetesUVT", enquetes);

  mostrarToast(5, txt("pollSuccess"));
};

window.votarPrioridade = async function (prioridade) {
  const prioridades = getLista("prioridadesUVT");
  const perguntaAtual = "prioridade-geral";

  if (prioridades.find((p) => p.pergunta === perguntaAtual)) {
    alert(txt("priorityDone"));
    return;
  }

  const sucesso = await ganhar(8, "priority", { pergunta: perguntaAtual, prioridade });
  if (!sucesso) return;

  prioridades.push({ pergunta: perguntaAtual, prioridade, valor: 8, data: new Date().toISOString() });
  setLista("prioridadesUVT", prioridades);

  mostrarToast(8, txt("prioritySuccess"));
};

window.enviarSugestao = async function () {
  const textoEl = document.getElementById("sugestaoTexto");
  const texto = textoEl?.value.trim();

  if (!texto) {
    alert(txt("suggestionMissing"));
    return;
  }

  const sucesso = await ganhar(10, "suggestion", { texto });
  if (!sucesso) return;

  const sugestoes = getLista("sugestoesUVT");
  sugestoes.push({ texto, valor: 10, data: new Date().toISOString() });
  setLista("sugestoesUVT", sugestoes);

  mostrarToast(10, txt("suggestionSuccess"));
  textoEl.value = "";
};

window.enviarProblema = async function () {
  const tipo = document.getElementById("problemaTipo")?.value;
  const descricaoEl = document.getElementById("problemaDescricao");
  const fotoEl = document.getElementById("problemaFoto");

  const descricao = descricaoEl?.value.trim();
  const foto = fotoEl?.files?.[0];

  if (!descricao) {
    alert(txt("problemMissing"));
    return;
  }

  const dados = {
    tipo,
    descricao,
    imagemUrl: "",
    imagemPath: "",
    foto: foto ? foto.name : "",
    imagemStatus: foto ? "filename_only_storage_phase_pending" : "no_image"
  };

  const sucesso = await ganhar(15, "problem", dados);
  if (!sucesso) return;

  const problemas = getLista("problemasUVT");
  problemas.push({ ...dados, valor: 15, data: new Date().toISOString() });
  setLista("problemasUVT", problemas);

  mostrarToast(15, txt("problemSuccess"));

  descricaoEl.value = "";
  if (fotoEl) fotoEl.value = "";
};

window.enviarLocal = async function () {
  const nomeEl = document.getElementById("localNome");
  const descricaoEl = document.getElementById("localDescricao");
  const fotoEl = document.getElementById("localFoto");

  const nome = nomeEl?.value.trim();
  const descricao = descricaoEl?.value.trim();
  const foto = fotoEl?.files?.[0];

  if (!nome || !descricao) {
    alert(txt("placeMissing"));
    return;
  }

  const dados = {
    nome,
    descricao,
    imagemUrl: "",
    imagemPath: "",
    foto: foto ? foto.name : "",
    imagemStatus: foto ? "filename_only_storage_phase_pending" : "no_image"
  };

  const sucesso = await ganhar(15, "place", dados);
  if (!sucesso) return;

  const locais = getLista("locaisUVT");
  locais.push({ ...dados, valor: 15, data: new Date().toISOString() });
  setLista("locaisUVT", locais);

  mostrarToast(15, txt("placeSuccess"));

  nomeEl.value = "";
  descricaoEl.value = "";
  if (fotoEl) fotoEl.value = "";
};

window.enviarIndicacao = async function () {
  const nomeEl = document.getElementById("indicadoNome");
  const contatoEl = document.getElementById("indicadoContato");
  const motivoEl = document.getElementById("indicadoMotivo");

  const nome = nomeEl?.value.trim();
  const contato = contatoEl?.value.trim();
  const motivo = motivoEl?.value.trim();

  if (!nome || !motivo) {
    alert(txt("indicationMissing"));
    return;
  }

  const sucesso = await ganhar(10, "share", { nome, contato, motivo });
  if (!sucesso) return;

  const indicacoes = getLista("indicacoesUVT");
  indicacoes.push({ nome, contato, motivo, valor: 10, data: new Date().toISOString() });
  setLista("indicacoesUVT", indicacoes);

  mostrarToast(10, txt("shareSuccess"));

  nomeEl.value = "";
  contatoEl.value = "";
  motivoEl.value = "";
};

window.registrarAcaoComunitaria = async function () {
  const tipo = document.getElementById("acaoComunitariaTipo")?.value || "community";
  const mensagemEl = document.getElementById("acaoComunitariaMensagem");
  const mensagem = mensagemEl?.value.trim() || "";

  const sucesso = await ganhar(25, "community_action", { tipo, mensagem });
  if (!sucesso) return;

  const acoes = getLista("acoesComunitariasUVT");
  acoes.push({ tipo, mensagem, valor: 25, data: new Date().toISOString() });
  setLista("acoesComunitariasUVT", acoes);

  mostrarToast(25, txt("communitySuccess"));
  if (mensagemEl) mensagemEl.value = "";
};


/* =====================================================
   DASHBOARD
===================================================== */

function getAcoesLocaisDashboard() {
  const montar = (lista, tipo) => lista.map((item) => ({
    tipo,
    valorUVT: item.valor || item.uvt || 0,
    dados: item,
    createdAt: item.data || item.createdAt || new Date().toISOString()
  }));

  return [
    ...montar(getLista("enquetesUVT"), "poll"),
    ...montar(getLista("prioridadesUVT"), "priority"),
    ...montar(getLista("sugestoesUVT"), "suggestion"),
    ...montar(getLista("problemasUVT"), "problem"),
    ...montar(getLista("locaisUVT"), "place"),
    ...montar(getLista("indicacoesUVT"), "share"),
    ...montar(getLista("acoesComunitariasUVT"), "community_action")
  ];
}

window.renderDashboard = async function () {
  let actions = [];

  try {
    if (window.firebaseReady) await window.firebaseReady;

    if (typeof window.buscarDadosDashboardFirestore === "function") {
      const dados = await window.buscarDadosDashboardFirestore();
      actions = dados.actions || [];
    }

    if (!actions.length) {
      actions = getAcoesLocaisDashboard();
    }
  } catch {
    actions = getAcoesLocaisDashboard();
  }

  const acoesPositivas = actions.filter((a) => (a.valorUVT || a.uvt || 0) > 0);

  const totalUVT = acoesPositivas.reduce((soma, item) => soma + (item.valorUVT || item.uvt || 0), 0);
  const totalAcoes = acoesPositivas.length;

  const participantesUnicos = new Set(
    acoesPositivas
      .map((a) => a.userUID || a.userId || a.uid || a.dados?.userUID || a.dados?.userId)
      .filter(Boolean)
  ).size;

  const sugestoes = acoesPositivas.filter((a) => a.tipo === "suggestion");
  const problemas = acoesPositivas.filter((a) => a.tipo === "problem");
  const locais = acoesPositivas.filter((a) => a.tipo === "place");
  const acoesComunitarias = acoesPositivas.filter((a) => a.tipo === "community_action");
  const indicacoes = acoesPositivas.filter((a) => a.tipo === "share");
  const enquetes = acoesPositivas.filter((a) => a.tipo === "poll");
  const prioridades = acoesPositivas.filter((a) => a.tipo === "priority");

  impactoTotal = totalUVT;
  salvarImpacto();

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
  };

  set("totalUVT", formatarNumero(totalUVT));
  set("totalParticipantes", formatarNumero(participantesUnicos));
  set("totalAcoes", formatarNumero(totalAcoes));
  set("totalContribuicoes", formatarNumero(sugestoes.length + problemas.length + locais.length));
  set("totalEngajamento", formatarNumero(indicacoes.length + acoesComunitarias.length));
  set("totalSugestoes", formatarNumero(sugestoes.length));
  set("totalProblemas", formatarNumero(problemas.length));
  set("totalLocais", formatarNumero(locais.length));
  set("totalAcoesComunitarias", formatarNumero(acoesComunitarias.length));

  const contagem = {};

  enquetes.forEach((e) => {
    const resposta = e.dados?.resposta || e.resposta || "No answer";
    contagem[resposta] = (contagem[resposta] || 0) + 1;
  });

  const totalEnquetes = enquetes.length;
  let html = "";
  let maiorOpcao = "";
  let maiorValor = 0;

  Object.keys(contagem).forEach((chave) => {
    const qtd = contagem[chave];
    const porcentagem = totalEnquetes ? Math.round((qtd / totalEnquetes) * 100) : 0;

    if (qtd > maiorValor) {
      maiorValor = qtd;
      maiorOpcao = chave;
    }

    html += `
      <div class="data-row">
        <div class="data-row-top">
          <span>${chave}</span>
          <strong>${qtd} · ${porcentagem}%</strong>
        </div>
        <div class="data-bar">
          <div class="data-fill" style="width:${porcentagem}%"></div>
        </div>
      </div>
    `;
  });

  const dadosEnquete = document.getElementById("dadosEnquete");
  if (dadosEnquete) {
    dadosEnquete.innerHTML = html || `<p class="sub">${txt("noData")}</p>`;
  }

  const insight = document.getElementById("insightPrincipal");
  if (insight) {
    insight.innerText = maiorOpcao
      ? `Sinal inicial: "${maiorOpcao}" aparece como prioridade principal.`
      : txt("dashboardInsightEmpty");
  }

  set("dashboardMainSignal", maiorOpcao || txt("dashboardWaiting"));

  const contagemPrioridades = {};

  prioridades.forEach((p) => {
    const prioridade = p.dados?.prioridade || p.prioridade || "No priority";
    contagemPrioridades[prioridade] = (contagemPrioridades[prioridade] || 0) + 1;
  });

  const totalPrioridades = prioridades.length;
  let htmlPrioridades = "";
  let maiorPrioridade = "";
  let maiorPrioridadeValor = 0;

  Object.keys(contagemPrioridades).forEach((chave) => {
    const qtd = contagemPrioridades[chave];
    const porcentagem = totalPrioridades ? Math.round((qtd / totalPrioridades) * 100) : 0;

    if (qtd > maiorPrioridadeValor) {
      maiorPrioridadeValor = qtd;
      maiorPrioridade = chave;
    }

    htmlPrioridades += `
      <div class="data-row">
        <div class="data-row-top">
          <span>${chave}</span>
          <strong>${qtd} · ${porcentagem}%</strong>
        </div>
        <div class="data-bar">
          <div class="data-fill" style="width:${porcentagem}%"></div>
        </div>
      </div>
    `;
  });

  const dadosPrioridades = document.getElementById("dadosPrioridades");
  if (dadosPrioridades) {
    dadosPrioridades.innerHTML = htmlPrioridades || `<p class="sub">${txt("noData")}</p>`;
  }

  const insightPrioridade = document.getElementById("insightPrioridade");
  if (insightPrioridade) {
    insightPrioridade.innerText = maiorPrioridade
      ? `Prioridade mais votada: "${maiorPrioridade}".`
      : txt("dashboardInsightEmpty");
  }

  const goalBarEl = document.getElementById("dashboardGoalBar");
  const goalTextEl = document.getElementById("dashboardGoalText");

  if (goalBarEl && goalTextEl) {
    const fase = getFaseProjetoAtual(totalUVT);
    const progresso = Math.min((totalUVT / META_FINAL_PROJETO) * 100, 100);

    goalBarEl.style.width = progresso + "%";
    goalTextEl.innerText = totalUVT >= META_FINAL_PROJETO
      ? txt("goalReached")
      : `${fase.nome}: ${fase.objetivo}`;
  }

  atualizarImpacto();
  atualizarTeaserDashboard();
  atualizarJornadaProjeto();
};


/* =====================================================
   CARTEIRA
===================================================== */

function descricaoHistoricoCarteira(item) {
  const dados = item.dados || item;

  if (item.tipo === "poll") return dados.resposta || "Survey answer";
  if (item.tipo === "priority") return dados.prioridade || "Priority vote";
  if (item.tipo === "suggestion") return dados.texto || "Suggestion";
  if (item.tipo === "problem") return dados.descricao || "Reported issue";
  if (item.tipo === "place") return dados.nome || "Suggested place";
  if (item.tipo === "share") return dados.nome || "Recommendation";
  if (item.tipo === "community_action") return dados.mensagem || dados.tipo || "Community action";
  if (item.tipo === "redeem") return dados.descricao || "Reward redemption";

  return "Participation";
}

function montarHistoricoCarteira(lista) {
  return lista.map((item) => {
    const valor = item.valorUVT || item.valor || item.uvt || 0;
    const sinal = valor >= 0 ? "+" : "";

    return `
      <div class="wallet-history-item">
        <div>
          <span>${item.tipo || "participation"}</span>
          <small>${descricaoHistoricoCarteira(item)}</small>
        </div>
        <strong>${sinal}${formatarNumero(valor)} UVT</strong>
      </div>
    `;
  }).join("");
}

window.renderWallet = async function () {
  const saldoEl = document.getElementById("walletSaldo");
  const totalEl = document.getElementById("walletTotalGerado");
  const statusEl = document.getElementById("walletStatus");
  const historicoEl = document.getElementById("walletHistorico");

  let carteira = null;
  let historico = [];

  try {
    if (window.firebaseReady) await window.firebaseReady;

    if (typeof window.buscarCarteiraUsuario === "function") {
      carteira = await window.buscarCarteiraUsuario();
    }

    if (typeof window.buscarHistoricoUsuario === "function") {
      historico = await window.buscarHistoricoUsuario();
    }
  } catch {
    carteira = null;
  }

  if (!carteira) {
    carteira = {
      saldoUVT: saldo,
      totalGerado: totalGeradoUsuario
    };
  }

  if (!historico.length) {
    historico = getAcoesLocaisDashboard()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const saldoCarteira = carteira.saldoUVT || carteira.uvtBalance || saldo || 0;
  const totalGerado = carteira.totalGerado || carteira.totalUVTGenerated || totalGeradoUsuario || 0;

  if (saldoEl) saldoEl.innerText = formatarNumero(saldoCarteira);
  if (totalEl) totalEl.innerText = formatarNumero(totalGerado);
  if (statusEl) statusEl.innerText = totalGerado > 0 ? "Contributor" : "Member";

  const nivel = calcularNivelUsuario(totalGerado);

  const levelEl = document.getElementById("walletLevel");
  const iconEl = document.getElementById("walletLevelIcon");
  const progressEl = document.getElementById("walletLevelProgress");
  const nextEl = document.getElementById("walletLevelNext");

  if (levelEl) levelEl.innerText = nivel.nome;
  if (iconEl) iconEl.innerText = nivel.icone;

  if (progressEl && nextEl) {
    if (!nivel.proximo) {
      progressEl.style.width = "100%";
      nextEl.innerText = txt("maxLevel");
    } else {
      const progresso = Math.min(((totalGerado - nivel.minimo) / (nivel.proximo - nivel.minimo)) * 100, 100);
      const faltam = Math.max(nivel.proximo - totalGerado, 0);

      progressEl.style.width = progresso + "%";
      nextEl.innerText = `${formatarNumero(faltam)} ${txt("nextLevel")}`;
    }
  }

  if (historicoEl) {
    historicoEl.innerHTML = historico.length
      ? montarHistoricoCarteira(historico.slice(0, 5))
      : `<p class="sub">${txt("noData")}</p>`;
  }
};


/* =====================================================
   RECOMPENSAS
===================================================== */

window.trocar = async function (valor, imagem) {
  const sucesso = await gastar(valor);
  if (!sucesso) return;

  abrirModalRecompensa(imagem);
};

window.extra = function (tipo) {
  if (tipo === "instagram") {
    window.open(INSTAGRAM_URL, "_blank");
    abrirModalRecompensa("assets/Imagem promocional Instagram.png");
  }

  if (tipo === "linkedin") {
    window.open(LINKEDIN_URL, "_blank");
    abrirModalRecompensa("assets/Imagem promocional LinkedIn.png");
  }
};

function abrirModalRecompensa(src) {
  let modal = document.getElementById("rewardModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "rewardModal";
    modal.className = "reward-modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="reward-modal-content">
      <button class="modal-close" onclick="fecharModalRecompensa()">×</button>
      <span class="badge">Reward unlocked</span>
      <h2>${txt("rewardReady")}</h2>
      <img src="${src}" class="modal-reward-img" alt="UVT Localyze Reward">
      <a href="${src}" download class="btn primary">${txt("downloadImage")}</a>
      <button onclick="fecharModalRecompensa()" class="btn secondary">${txt("close")}</button>
    </div>
  `;

  modal.classList.add("active");
}

window.fecharModalRecompensa = function () {
  const modal = document.getElementById("rewardModal");
  if (modal) modal.classList.remove("active");
};


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  atualizarSaldo();
  atualizarImpacto();
  atualizarTeaserDashboard();
  atualizarNivelUsuario();
  atualizarJornadaProjeto();

  await atualizarCarteiraFirestore();
  await atualizarImpactoColetivoFirestore();

  atualizarSaldo();
  atualizarImpacto();
  atualizarTeaserDashboard();
  atualizarNivelUsuario();
  atualizarJornadaProjeto();

  const topbar = document.querySelector(".topbar");

  window.addEventListener("scroll", () => {
    if (!topbar) return;
    topbar.classList.toggle("scrolled", window.scrollY > 24);
  });
});