import { auth, db } from "./firebase-init.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const OWNER_EMAIL = "entredunaschale@gmail.com";

const BR_STATES = [
  ["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"], ["BA", "Bahia"],
  ["CE", "Ceará"], ["DF", "Distrito Federal"], ["ES", "Espírito Santo"], ["GO", "Goiás"],
  ["MA", "Maranhão"], ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"], ["MG", "Minas Gerais"],
  ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"], ["PE", "Pernambuco"], ["PI", "Piauí"],
  ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"], ["RS", "Rio Grande do Sul"],
  ["RO", "Rondônia"], ["RR", "Roraima"], ["SC", "Santa Catarina"], ["SP", "São Paulo"],
  ["SE", "Sergipe"], ["TO", "Tocantins"]
];

const accountButton = document.getElementById("accountButton");
const accountAvatar = document.getElementById("accountAvatar");
const siteHeader = document.getElementById("siteHeader");

const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");
const tabs = Array.from(document.querySelectorAll("[data-auth-tab]"));
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const googleSignInButton = document.getElementById("googleSignIn");

const accountPanel = document.getElementById("accountPanel");
const closeAccountPanel = document.getElementById("closeAccountPanel");
const accountViewAvatar = document.getElementById("accountViewAvatar");
const accountViewGreeting = document.getElementById("accountViewGreeting");
const accountViewEmail = document.getElementById("accountViewEmail");
const profileForm = document.getElementById("profileForm");
const profileSaveButton = document.getElementById("profileSaveButton");
const profileState = document.getElementById("profileState");
const logoutButton = document.getElementById("logoutButton");
const adminPanelLink = document.getElementById("adminPanelLink");

if (accountButton && authModal && accountPanel) {
  BR_STATES.forEach(([uf, name]) => {
    const option = document.createElement("option");
    option.value = uf;
    option.textContent = `${uf} - ${name}`;
    profileState?.appendChild(option);
  });

  function formatPhone(value) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  document.getElementById("signupPhone")?.addEventListener("input", (event) => {
    event.target.value = formatPhone(event.target.value);
  });
  document.getElementById("profilePhone")?.addEventListener("input", (event) => {
    event.target.value = formatPhone(event.target.value);
  });

  const profileFields = profileForm ? Array.from(profileForm.querySelectorAll("input, select")) : [];
  profileFields.forEach((field) => {
    field.addEventListener("input", () => {
      field.classList.remove("is-saved");
      if (profileSaveButton) profileSaveButton.disabled = false;
    });
    field.addEventListener("change", () => {
      field.classList.remove("is-saved");
      if (profileSaveButton) profileSaveButton.disabled = false;
    });
  });

  function authErrorMessage(error) {
    const map = {
      "auth/invalid-credential": "E-mail ou senha incorretos. Se você criou a conta pelo Google, use o botão \"Continuar com Google\".",
      "auth/wrong-password": "E-mail ou senha incorretos. Se você criou a conta pelo Google, use o botão \"Continuar com Google\".",
      "auth/user-not-found": "Não encontramos uma conta com esse e-mail.",
      "auth/email-already-in-use": "Já existe uma conta com esse e-mail. Tente entrar (ou use \"Continuar com Google\" se foi assim que você criou a conta).",
      "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
      "auth/invalid-email": "E-mail inválido.",
      "auth/too-many-requests": "Muitas tentativas. Tente novamente em alguns minutos.",
      "auth/unauthorized-domain": "Este site ainda não está autorizado no Firebase (Authentication > Settings > Authorized domains).",
      "auth/operation-not-allowed": "Esse método de login ainda não está habilitado no Firebase (Authentication > Sign-in method)."
    };
    return map[error?.code] || `Não foi possível concluir (${error?.code || "erro desconhecido"}). Tente novamente.`;
  }

  function setAvatar(container, photoURL) {
    if (!container) return;
    container.innerHTML = "";
    if (photoURL) {
      const img = document.createElement("img");
      img.src = photoURL;
      img.alt = "";
      img.referrerPolicy = "no-referrer";
      container.appendChild(img);
    } else {
      container.innerHTML = '<svg class="icon"><use href="#icon-user"></use></svg>';
    }
  }

  let toastTimeout;

  function showToast(message, type = "success") {
    let toast = document.getElementById("appToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appToast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast is-${type} is-visible`;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 3000);
  }

  function showGuestView() {
    tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.authTab === "login"));
    loginForm.hidden = false;
    signupForm.hidden = true;
    document.getElementById("loginError").textContent = "";
    document.getElementById("signupError").textContent = "";
  }

  function openModal() {
    showGuestView();
    authModal.hidden = false;
    document.body.classList.add("account-open");
  }

  function closeModal() {
    authModal.hidden = true;
    document.body.classList.remove("account-open");
  }

  let headerWasScrolled = false;

  function onPanelKeydown(event) {
    if (event.key === "Escape") closeAccountPanelFn();
  }

  function fillAccountPanel(profile) {
    document.getElementById("profileName").value = profile.name || "";
    document.getElementById("profilePhone").value = profile.phone || "";
    document.getElementById("profileEmail").value = profile.email || "";
    document.getElementById("profileCity").value = profile.city || "";
    if (profileState) profileState.value = profile.state || "";
    if (accountViewGreeting) accountViewGreeting.textContent = profile.name ? `Olá, ${profile.name.split(" ")[0]}` : "Olá";
    if (accountViewEmail) accountViewEmail.textContent = profile.email || "";
    setAvatar(accountViewAvatar, profile.photoURL);
    if (adminPanelLink) adminPanelLink.hidden = profile.email !== OWNER_EMAIL;
  }

  function openAccountPanel(profile) {
    fillAccountPanel(profile);
    accountPanel.hidden = false;
    accountPanel.scrollTop = 0;
    document.body.classList.add("profile-open");
    headerWasScrolled = siteHeader?.classList.contains("is-scrolled") ?? false;
    siteHeader?.classList.add("is-scrolled");
    document.addEventListener("keydown", onPanelKeydown);
  }

  function closeAccountPanelFn() {
    accountPanel.hidden = true;
    document.body.classList.remove("profile-open");
    if (!headerWasScrolled) siteHeader?.classList.remove("is-scrolled");
    document.removeEventListener("keydown", onPanelKeydown);
    accountButton.focus({ preventScroll: true });
  }

  async function fetchProfile(user) {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) return { ...snap.data(), email: user.email, photoURL: user.photoURL || null };
    return { name: user.displayName || "", phone: "", email: user.email, photoURL: user.photoURL || null };
  }

  function applyProfile(profile) {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    setAvatar(accountAvatar, profile.photoURL);
    accountButton.setAttribute("aria-label", profile.name ? `Minha conta, ${profile.name.split(" ")[0]}` : "Minha conta");
  }

  accountButton.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      openModal();
    } else {
      openAccountPanel(await fetchProfile(user));
    }
  });

  closeAuthModal?.addEventListener("click", closeModal);
  document.querySelectorAll("[data-auth-close]").forEach((el) => el.addEventListener("click", closeModal));
  closeAccountPanel?.addEventListener("click", closeAccountPanelFn);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !authModal.hidden) closeModal();
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
      loginForm.hidden = tab.dataset.authTab !== "login";
      signupForm.hidden = tab.dataset.authTab !== "signup";
    });
  });

  googleSignInButton?.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const profile = await fetchProfile(result.user);
      applyProfile(profile);
      closeModal();
      if (!profile.phone) openAccountPanel(profile);
    } catch (error) {
      if (error?.code === "auth/popup-closed-by-user") return;
      if (error?.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, new GoogleAuthProvider());
        return;
      }
      console.error("Google sign-in error:", error?.code, error?.message);
      document.getElementById("loginError").textContent = authErrorMessage(error);
    }
  });

  getRedirectResult(auth)
    .then(async (result) => {
      if (!result) return;
      const profile = await fetchProfile(result.user);
      applyProfile(profile);
      closeModal();
      if (!profile.phone) openAccountPanel(profile);
    })
    .catch((error) => {
      console.error("Google redirect sign-in error:", error?.code, error?.message);
      openModal();
      document.getElementById("loginError").textContent = authErrorMessage(error);
    });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("loginError");
    errorEl.textContent = "";
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      applyProfile(await fetchProfile(credential.user));
      closeModal();
    } catch (error) {
      errorEl.textContent = authErrorMessage(error);
    }
  });

  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const phone = document.getElementById("signupPhone").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const errorEl = document.getElementById("signupError");
    errorEl.textContent = "";
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      await setDoc(doc(db, "users", credential.user.uid), {
        name,
        phone,
        email,
        updatedAt: new Date().toISOString()
      });
      applyProfile({ name, phone, email, photoURL: null });
      closeModal();
    } catch (error) {
      errorEl.textContent = authErrorMessage(error);
    }
  });

  profileForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    const name = document.getElementById("profileName").value.trim();
    const phone = document.getElementById("profilePhone").value.trim();
    const city = document.getElementById("profileCity").value.trim();
    const state = profileState?.value || "";
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { name, phone, city, state, email: user.email, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      if (user.displayName !== name) await updateProfile(user, { displayName: name });
      applyProfile({ name, phone, city, state, email: user.email, photoURL: user.photoURL || null });
      if (accountViewGreeting) accountViewGreeting.textContent = name ? `Olá, ${name.split(" ")[0]}` : "Olá";
      profileFields.forEach((field) => field.classList.add("is-saved"));
      if (profileSaveButton) profileSaveButton.disabled = true;
      showToast("Dados salvos com sucesso!");
    } catch (error) {
      showToast("Não foi possível salvar agora. Tente de novo.", "error");
    }
  });

  logoutButton?.addEventListener("click", async () => {
    await signOut(auth);
    localStorage.removeItem("userProfile");
    closeAccountPanelFn();
  });

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setAvatar(accountAvatar, null);
      accountButton.setAttribute("aria-label", "Entrar");
      localStorage.removeItem("userProfile");
      return;
    }
    applyProfile(await fetchProfile(user));
  });
}
