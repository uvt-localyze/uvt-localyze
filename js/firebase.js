/* =====================================================
   UVT LOCALYZE — FIREBASE.JS COMPLETO
===================================================== */

/* =====================================================
   1. IMPORTAÇÕES FIREBASE
===================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  increment,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


/* =====================================================
   2. CONFIGURAÇÃO DO FIREBASE
===================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyCuGtEyyhj5ZKobzF8Qlk1UKAs9hHoevPY",
  authDomain: "uvt-localyze.firebaseapp.com",
  projectId: "uvt-localyze",
  storageBucket: "uvt-localyze.firebasestorage.app",
  messagingSenderId: "636798619484",
  appId: "1:636798619484:web:ba1e760979e280562b3b99",
  measurementId: "G-JGVY8EYXN0"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();


/* =====================================================
   3. VARIÁVEIS GLOBAIS
===================================================== */

window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;
window.currentUserUID = null;

window.firebaseUVT = {
  app,
  auth,
  db,
  storage,
  provider,

  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup,

  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  increment,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit,

  ref,
  uploadBytes,
  getDownloadURL
};

window.firebaseReady = new Promise((resolve) => {
  window._resolverFirebaseReady = resolve;
});


/* =====================================================
   4. CONFIGURAÇÕES ECONÔMICAS
===================================================== */

const SALDO_INICIAL = 0;
const LIMITE_DIARIO_FIRESTORE = 50;


/* =====================================================
   5. FUNÇÕES AUXILIARES
===================================================== */

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function gerarChaveDuplicidade(tipo, dados = {}) {
  if (tipo === "poll") {
    return `poll:${dados.pergunta || "pergunta_padrao"}`;
  }

  if (tipo === "priority") {
    return `priority:${dados.pergunta || "prioridade_geral"}`;
  }

  return null;
}


/* =====================================================
   6. CRIAÇÃO / ATUALIZAÇÃO DE USUÁRIO
===================================================== */

async function garantirUsuario(uid, extra = {}) {
  const refUser = doc(db, "users", uid);
  const snap = await getDoc(refUser);

  if (!snap.exists()) {
    await setDoc(refUser, {
      uid,
      saldoUVT: SALDO_INICIAL,
      totalGerado: 0,
      elo: 0,
      nivel: 1,
      tipoConta: "anonima",
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
      ...extra
    });

    console.log("Carteira criada:", uid);
    return;
  }

  await updateDoc(refUser, {
    atualizadoEm: serverTimestamp(),
    ...extra
  });
}


/* =====================================================
   7. AUTENTICAÇÃO AUTOMÁTICA
===================================================== */

onAuthStateChanged(auth, async (user) => {
  try {
    if (user) {
      window.currentUserUID = user.uid;

      await garantirUsuario(user.uid, {
        tipoConta: user.isAnonymous ? "anonima" : "google",
        nome: user.displayName || null,
        email: user.email || null,
        foto: user.photoURL || null
      });

      console.log("Usuário ativo:", user.uid);

      if (window._resolverFirebaseReady) {
        window._resolverFirebaseReady(user);
      }

      return;
    }

    const result = await signInAnonymously(auth);

    window.currentUserUID = result.user.uid;

    await garantirUsuario(result.user.uid, {
      tipoConta: "anonima"
    });

    console.log("Login anônimo criado:", result.user.uid);

    if (window._resolverFirebaseReady) {
      window._resolverFirebaseReady(result.user);
    }
  } catch (error) {
    console.error("Erro no Firebase/Auth:", error);
  }
});


/* =====================================================
   8. CONTROLE ANTI-FARM NO FIRESTORE
===================================================== */

async function verificarLimiteDiarioFirestore(uid, valor) {
  const hoje = hojeISO();

  const q = query(
    collection(db, "actions"),
    where("userUID", "==", uid),
    where("diaControle", "==", hoje)
  );

  const snap = await getDocs(q);

  const totalHoje = snap.docs.reduce((soma, item) => {
    const dados = item.data();
    return soma + Math.max(dados.valorUVT || 0, 0);
  }, 0);

  return totalHoje + valor <= LIMITE_DIARIO_FIRESTORE;
}

async function verificarDuplicidadeFirestore(uid, tipo, dados = {}) {
  const chaveDuplicidade = gerarChaveDuplicidade(tipo, dados);

  if (!chaveDuplicidade) {
    return false;
  }

  const q = query(
    collection(db, "actions"),
    where("userUID", "==", uid),
    where("chaveDuplicidade", "==", chaveDuplicidade),
    limit(1)
  );

  const snap = await getDocs(q);

  return !snap.empty;
}


/* =====================================================
   9. GANHAR UVT NO FIRESTORE
===================================================== */

window.ganharUVTFirestore = async function(valor, tipo, dados = {}) {
  const uid = window.currentUserUID;

  if (!uid) {
    console.warn("Usuário ainda não carregado. Ação não salva no Firestore.");
    return {
      sucesso: false,
      motivo: "usuario_nao_carregado"
    };
  }

  const dentroDoLimite = await verificarLimiteDiarioFirestore(uid, valor);

  if (!dentroDoLimite) {
    alert("Limite diário atingido. Volte amanhã.");
    return {
      sucesso: false,
      motivo: "limite_diario"
    };
  }

  const duplicado = await verificarDuplicidadeFirestore(uid, tipo, dados);

  if (duplicado) {
    alert("Essa participação já foi registrada.");
    return {
      sucesso: false,
      motivo: "acao_duplicada"
    };
  }

  const diaControle = hojeISO();
  const chaveDuplicidade = gerarChaveDuplicidade(tipo, dados);

  await addDoc(collection(db, "actions"), {
    userUID: uid,
    tipo,
    valorUVT: valor,
    dados,
    diaControle,
    chaveDuplicidade,
    criadoEm: serverTimestamp()
  });

  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    saldoUVT: increment(valor),
    totalGerado: increment(valor),
    atualizadoEm: serverTimestamp()
  });

  console.log(`+${valor} UVT salvo no Firestore`);

  return {
    sucesso: true,
    valor,
    tipo
  };
};


/* =====================================================
   10. GASTAR UVT NO FIRESTORE
===================================================== */

window.gastarUVTFirestore = async function(valor) {
  const uid = window.currentUserUID;

  if (!uid) {
    return {
      sucesso: false,
      motivo: "usuario_nao_carregado"
    };
  }

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return {
      sucesso: false,
      motivo: "usuario_nao_encontrado"
    };
  }

  const dadosUsuario = userSnap.data();
  const saldoAtual = dadosUsuario.saldoUVT || 0;

  if (saldoAtual < valor) {
    alert("Saldo insuficiente.");
    return {
      sucesso: false,
      motivo: "saldo_insuficiente"
    };
  }

  await updateDoc(userRef, {
    saldoUVT: increment(-valor),
    atualizadoEm: serverTimestamp()
  });

  await addDoc(collection(db, "actions"), {
    userUID: uid,
    tipo: "redeem",
    valorUVT: -valor,
    dados: {
      descricao: "Resgate de recompensa"
    },
    diaControle: hojeISO(),
    chaveDuplicidade: null,
    criadoEm: serverTimestamp()
  });

  console.log(`-${valor} UVT salvo no Firestore`);

  return {
    sucesso: true,
    valor
  };
};


/* =====================================================
   11. LOGIN COM GOOGLE
===================================================== */

window.loginComGoogle = async function () {
  try {
    const usuarioAtual = auth.currentUser;

    if (!usuarioAtual) {
      const result = await signInWithPopup(auth, provider);

      window.currentUserUID = result.user.uid;

      await garantirUsuario(result.user.uid, {
        tipoConta: "google",
        nome: result.user.displayName || null,
        email: result.user.email || null,
        foto: result.user.photoURL || null
      });

      alert("Carteira acessada com sucesso 🚀");
      return result.user;
    }

    if (usuarioAtual.isAnonymous) {
      const result = await linkWithPopup(usuarioAtual, provider);
      const user = result.user;

      window.currentUserUID = user.uid;

      await garantirUsuario(user.uid, {
        tipoConta: "google",
        nome: user.displayName || null,
        email: user.email || null,
        foto: user.photoURL || null
      });

      alert("Carteira salva com sucesso 🚀");
      return user;
    }

    alert("Sua carteira já está salva.");
    return usuarioAtual;
  } catch (erro) {
    console.error("Erro no login Google:", erro);

    if (erro.code === "auth/credential-already-in-use") {
      alert("Essa conta Google já está vinculada a outra carteira.");
      return null;
    }

    alert("Erro ao conectar com Google.");
    return null;
  }
};


/* =====================================================
   12. BUSCAR CARTEIRA DO USUÁRIO
===================================================== */

window.buscarCarteiraUsuario = async function () {
  if (window.firebaseReady) {
    await window.firebaseReady;
  }

  const uid = window.currentUserUID;

  if (!uid) {
    return null;
  }

  const refUser = doc(db, "users", uid);
  const snap = await getDoc(refUser);

  if (!snap.exists()) {
    return null;
  }

  return snap.data();
};


/* =====================================================
   13. BUSCAR HISTÓRICO DO USUÁRIO
===================================================== */

window.buscarHistoricoUsuario = async function () {
  if (window.firebaseReady) {
    await window.firebaseReady;
  }

  const uid = window.currentUserUID;

  if (!uid) {
    return [];
  }

  const q = query(
    collection(db, "actions"),
    where("userUID", "==", uid),
    orderBy("criadoEm", "desc"),
    limit(50)
  );

  const snap = await getDocs(q);

  return snap.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data()
  }));
};


/* =====================================================
   14. DADOS DO DASHBOARD
===================================================== */

window.buscarDadosDashboardFirestore = async function() {
  const actionsSnap = await getDocs(collection(db, "actions"));
  const usersSnap = await getDocs(collection(db, "users"));

  const actions = actionsSnap.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data()
  }));

  const users = usersSnap.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data()
  }));

  return {
    actions,
    users
  };
};