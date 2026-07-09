import { auth, db } from "./firebase-init.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
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

const accountButton = document.getElementById("accountButton");
const accountLabel = document.getElementById("accountLabel");
const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");
const guestView = document.getElementById("authGuestView");
const accountView = document.getElementById("authAccountView");
const tabs = Array.from(document.querySelectorAll("[data-auth-tab]"));
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const profileForm = document.getElementById("profileForm");
const googleSignInButton = document.getElementById("googleSignIn");
const logoutButton = document.getElementById("logoutButton");
const adminPanelLink = document.getElementById("adminPanelLink");

if (accountButton && authModal) {
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

  function authErrorMessage(error) {
    const map = {
      "auth/invalid-credential": "E-mail ou senha incorretos.",
      "auth/wrong-password": "E-mail ou senha incorretos.",
      "auth/user-not-found": "Não encontramos uma conta com esse e-mail.",
      "auth/email-already-in-use": "Já existe uma conta com esse e-mail. Tente entrar.",
      "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
      "auth/invalid-email": "E-mail inválido.",
      "auth/too-many-requests": "Muitas tentativas. Tente novamente em alguns minutos."
    };
    return map[error?.code] || "Não foi possível concluir. Tente novamente.";
  }

  function showGuestView() {
    guestView.hidden = false;
    accountView.hidden = true;
    tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.authTab === "login"));
    loginForm.hidden = false;
    signupForm.hidden = true;
    document.getElementById("loginError").textContent = "";
    document.getElementById("signupError").textContent = "";
  }

  function showAccountView(profile) {
    guestView.hidden = true;
    accountView.hidden = false;
    document.getElementById("profileName").value = profile.name || "";
    document.getElementById("profilePhone").value = profile.phone || "";
    document.getElementById("profileEmail").value = profile.email || "";
    document.getElementById("profileStatus").textContent = "";
    if (adminPanelLink) adminPanelLink.hidden = profile.email !== OWNER_EMAIL;
  }

  function openModal() {
    authModal.hidden = false;
    document.body.classList.add("account-open");
  }

  function closeModal() {
    authModal.hidden = true;
    document.body.classList.remove("account-open");
  }

  async function fetchProfile(user) {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) return { ...snap.data(), email: user.email };
    return { name: user.displayName || "", phone: "", email: user.email };
  }

  function applyProfile(profile) {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    if (accountLabel) accountLabel.textContent = profile.name ? profile.name.split(" ")[0] : "Minha conta";
  }

  accountButton.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      showGuestView();
    } else {
      showAccountView(await fetchProfile(user));
    }
    openModal();
  });

  closeAuthModal?.addEventListener("click", closeModal);
  document.querySelectorAll("[data-auth-close]").forEach((el) => el.addEventListener("click", closeModal));
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
      if (!profile.phone) {
        showAccountView(profile);
      } else {
        closeModal();
      }
    } catch (error) {
      if (error?.code === "auth/popup-closed-by-user") return;
      document.getElementById("loginError").textContent = authErrorMessage(error);
    }
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
      applyProfile({ name, phone, email });
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
    const statusEl = document.getElementById("profileStatus");
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { name, phone, email: user.email, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      if (user.displayName !== name) await updateProfile(user, { displayName: name });
      applyProfile({ name, phone, email: user.email });
      statusEl.textContent = "Salvo!";
      statusEl.className = "field-hint is-success";
    } catch (error) {
      statusEl.textContent = "Não foi possível salvar agora. Tente de novo.";
      statusEl.className = "field-hint is-error";
    }
  });

  logoutButton?.addEventListener("click", async () => {
    await signOut(auth);
    localStorage.removeItem("userProfile");
    closeModal();
  });

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      accountLabel.textContent = "Entrar";
      localStorage.removeItem("userProfile");
      return;
    }
    applyProfile(await fetchProfile(user));
  });
}
