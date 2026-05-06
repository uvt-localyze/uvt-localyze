// =====================================================
// UVT LOCALYZE — WALLET.JS
// Carteira real com Firebase + fallback local
// =====================================================

function walletLang() {
  return localStorage.getItem("uvt_lang") || "en";
}

function walletText(key) {
  const lang = walletLang();

  const texts = {
    en: {
      member: "Member",
      contributor: "Contributor",
      noHistory: "No participation yet.",
      loading: "Loading history...",
      error: "Could not load wallet data.",
      nextLevel: "UVT to the next level.",
      maxLevel: "Maximum prototype level reached."
    },
    pt: {
      member: "Membro",
      contributor: "Colaborador",
      noHistory: "Nenhuma participação ainda.",
      loading: "Carregando histórico...",
      error: "Não foi possível carregar a carteira.",
      nextLevel: "UVT para o próximo nível.",
      maxLevel: "Nível máximo do protótipo alcançado."
    },
    es: {
      member: "Miembro",
      contributor: "Colaborador",
      noHistory: "Sin participación todavía.",
      loading: "Cargando historial...",
      error: "No fue posible cargar la cartera.",
      nextLevel: "UVT para el próximo nivel.",
      maxLevel: "Nivel máximo del prototipo alcanzado."
    }
  };

  return texts[lang]?.[key] || texts.en[key];
}

function walletFormatNumber(value) {
  const locale = walletLang() === "en" ? "en-US" : "pt-BR";
  return Number(value || 0).toLocaleString(locale);
}

function walletGetList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function walletCalculateLevel(total = 0) {
  const lang = walletLang();

  const names = {
    en: [
      "Level 1 — Participant",
      "Level 2 — Contributor",
      "Level 3 — Mobilizer",
      "Level 4 — Local Guardian",
      "Level 5 — Ambassador"
    ],
    pt: [
      "Nível 1 — Participante",
      "Nível 2 — Contribuidor",
      "Nível 3 — Mobilizador",
      "Nível 4 — Guardião Local",
      "Nível 5 — Embaixador"
    ],
    es: [
      "Nivel 1 — Participante",
      "Nivel 2 — Contribuidor",
      "Nivel 3 — Movilizador",
      "Nivel 4 — Guardián Local",
      "Nivel 5 — Embajador"
    ]
  };

  const n = names[lang] || names.en;

  const levels = [
    { name: n[0], min: 0, next: 100, icon: "🌱" },
    { name: n[1], min: 100, next: 300, icon: "🤝" },
    { name: n[2], min: 300, next: 700, icon: "🚀" },
    { name: n[3], min: 700, next: 1500, icon: "🛡️" },
    { name: n[4], min: 1500, next: null, icon: "👑" }
  ];

  let current = levels[0];

  for (const level of levels) {
    if (total >= level.min) current = level;
  }

  return current;
}

function walletLocalHistory() {
  const mapItems = (list, type) =>
    list.map((item) => ({
      tipo: type,
      valorUVT: item.valor || item.uvt || item.valorUVT || 0,
      dados: item.dados || item,
      criadoEm: item.data || item.createdAt || new Date().toISOString()
    }));

  return [
    ...mapItems(walletGetList("enquetesUVT"), "poll"),
    ...mapItems(walletGetList("prioridadesUVT"), "priority"),
    ...mapItems(walletGetList("sugestoesUVT"), "suggestion"),
    ...mapItems(walletGetList("problemasUVT"), "problem"),
    ...mapItems(walletGetList("locaisUVT"), "place"),
    ...mapItems(walletGetList("indicacoesUVT"), "share"),
    ...mapItems(walletGetList("acoesComunitariasUVT"), "community_action")
  ].sort((a, b) => {
    const dateA = new Date(a.criadoEm?.toDate ? a.criadoEm.toDate() : a.criadoEm);
    const dateB = new Date(b.criadoEm?.toDate ? b.criadoEm.toDate() : b.criadoEm);
    return dateB - dateA;
  });
}

function walletDescribeHistory(item) {
  const dados = item.dados || {};

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

function walletRenderHistory(history) {
  const box = document.getElementById("walletHistorico");
  if (!box) return;

  if (!history || history.length === 0) {
    box.innerHTML = `<p class="sub">${walletText("noHistory")}</p>`;
    return;
  }

  box.innerHTML = history.slice(0, 5).map((item) => {
    const value = item.valorUVT || item.valor || item.uvt || 0;
    const signal = value >= 0 ? "+" : "";

    return `
      <div class="wallet-history-item">
        <div>
          <span>${item.tipo || "participation"}</span>
          <small>${walletDescribeHistory(item)}</small>
        </div>
        <strong>${signal}${walletFormatNumber(value)} UVT</strong>
      </div>
    `;
  }).join("");
}

function walletUpdateUI({ saldo, totalGerado, history }) {
  const walletSaldo = document.getElementById("walletSaldo");
  const walletTotalGerado = document.getElementById("walletTotalGerado");
  const walletStatus = document.getElementById("walletStatus");

  const walletLevelIcon = document.getElementById("walletLevelIcon");
  const walletLevel = document.getElementById("walletLevel");
  const walletLevelProgress = document.getElementById("walletLevelProgress");
  const walletLevelNext = document.getElementById("walletLevelNext");

  const level = walletCalculateLevel(totalGerado);

  if (walletSaldo) walletSaldo.innerText = walletFormatNumber(saldo);
  if (walletTotalGerado) walletTotalGerado.innerText = walletFormatNumber(totalGerado);
  if (walletStatus) walletStatus.innerText = totalGerado > 0 ? walletText("contributor") : walletText("member");

  if (walletLevelIcon) walletLevelIcon.innerText = level.icon;
  if (walletLevel) walletLevel.innerText = level.name;

  if (walletLevelProgress && walletLevelNext) {
    if (!level.next) {
      walletLevelProgress.style.width = "100%";
      walletLevelNext.innerText = walletText("maxLevel");
    } else {
      const progress = Math.min(
        ((totalGerado - level.min) / (level.next - level.min)) * 100,
        100
      );

      const missing = Math.max(level.next - totalGerado, 0);

      walletLevelProgress.style.width = `${progress}%`;
      walletLevelNext.innerText = `${walletFormatNumber(missing)} ${walletText("nextLevel")}`;
    }
  }

  walletRenderHistory(history);
}

window.renderWallet = async function () {
  const historyBox = document.getElementById("walletHistorico");

  if (historyBox) {
    historyBox.innerHTML = `<p class="sub">${walletText("loading")}</p>`;
  }

  try {
    if (window.firebaseReady) {
      await window.firebaseReady;
    }

    let carteira = null;
    let historico = [];

    if (typeof window.buscarCarteiraUsuario === "function") {
      carteira = await window.buscarCarteiraUsuario();
    }

    if (typeof window.buscarHistoricoUsuario === "function") {
      historico = await window.buscarHistoricoUsuario();
    }

    const saldoLocal = parseInt(localStorage.getItem("uvt") || "0", 10);
    const totalLocal = parseInt(
      localStorage.getItem("totalGeradoUVT") ||
      localStorage.getItem("totalUVTGenerated") ||
      saldoLocal ||
      "0",
      10
    );

    const saldo = carteira?.saldoUVT ?? carteira?.uvtBalance ?? saldoLocal;
    const totalGerado = carteira?.totalGerado ?? carteira?.totalUVTGenerated ?? totalLocal;

    if (!historico || historico.length === 0) {
      historico = walletLocalHistory();
    }

    walletUpdateUI({
      saldo,
      totalGerado,
      history: historico
    });
  } catch (error) {
    console.error("Wallet render error:", error);

    const saldoLocal = parseInt(localStorage.getItem("uvt") || "0", 10);
    const totalLocal = parseInt(
      localStorage.getItem("totalGeradoUVT") ||
      localStorage.getItem("totalUVTGenerated") ||
      saldoLocal ||
      "0",
      10
    );

    walletUpdateUI({
      saldo: saldoLocal,
      totalGerado: totalLocal,
      history: walletLocalHistory()
    });

    if (historyBox && walletLocalHistory().length === 0) {
      historyBox.innerHTML = `<p class="sub">${walletText("error")}</p>`;
    }
  }
};