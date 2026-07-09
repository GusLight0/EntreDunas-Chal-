import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const OWNER_EMAIL = "entredunaschale@gmail.com";

const gate = document.getElementById("adminGate");
const denied = document.getElementById("adminDenied");
const tableWrap = document.getElementById("adminTableWrap");
const tableBody = document.getElementById("adminTableBody");
const loginButton = document.getElementById("adminLoginButton");

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const STATUS_LABEL = { pending: "Pendente", approved: "Pago", rejected: "Recusado", cancelled: "Cancelado" };

function formatDate(iso) {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function escapeHtml(value) {
  return String(value ?? "—").replace(/[&<>"']/g, (char) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
  ));
}

loginButton?.addEventListener("click", () => {
  document.getElementById("accountButton")?.click();
});

async function loadReservations() {
  tableBody.innerHTML = '<tr><td colspan="8">Carregando...</td></tr>';
  try {
    const snap = await getDocs(query(collection(db, "reservations"), orderBy("checkInISO", "desc")));
    if (snap.empty) {
      tableBody.innerHTML = '<tr><td colspan="8">Nenhuma reserva ainda.</td></tr>';
      return;
    }
    tableBody.innerHTML = "";
    snap.forEach((docSnap) => {
      const r = docSnap.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.phone)}</td>
        <td>${formatDate(r.checkInISO)}</td>
        <td>${formatDate(r.checkOutISO)}</td>
        <td>${escapeHtml(r.nights)}</td>
        <td>${escapeHtml(r.guests)}</td>
        <td>${money.format(r.total || 0)}</td>
        <td>${escapeHtml(STATUS_LABEL[r.status] || r.status)}</td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (error) {
    console.error("admin loadReservations error:", error);
    tableBody.innerHTML = '<tr><td colspan="8">Erro ao carregar reservas.</td></tr>';
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    gate.hidden = false;
    denied.hidden = true;
    tableWrap.hidden = true;
    return;
  }
  if (user.email !== OWNER_EMAIL) {
    gate.hidden = true;
    denied.hidden = false;
    tableWrap.hidden = true;
    return;
  }
  gate.hidden = true;
  denied.hidden = true;
  tableWrap.hidden = false;
  await loadReservations();
});
