const STORAGE_KEY = "neverquit_state_v2";

const missionCards = [...document.querySelectorAll(".mission-card")];
const missionChecks = [...document.querySelectorAll(".mission-check")];
const rewardCards = [...document.querySelectorAll(".reward-card")];
const sparkTotal = document.getElementById("sparkTotal");
const reservedText = document.getElementById("reservedText");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const resetButton = document.getElementById("resetButton");
const message = document.getElementById("message");
const claimButtons = [...document.querySelectorAll(".claim-button")];
const todayLabel = document.getElementById("todayLabel");
const publicHistory = document.getElementById("publicHistory");

const parentButton = document.getElementById("parentButton");
const pendingBadge = document.getElementById("pendingBadge");
const parentDialog = document.getElementById("parentDialog");
const parentAuth = document.getElementById("parentAuth");
const parentConsole = document.getElementById("parentConsole");
const pinTitle = document.getElementById("pinTitle");
const pinHelp = document.getElementById("pinHelp");
const pinInput = document.getElementById("pinInput");
const pinAction = document.getElementById("pinAction");
const pinError = document.getElementById("pinError");
const pendingList = document.getElementById("pendingList");
const parentHistory = document.getElementById("parentHistory");

let parentUnlocked = false;

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTime(isoString) {
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(isoString));
}

function rewardNameFromId(rewardId) {
  const card = rewardCards.find((item) => item.dataset.id === rewardId);
  return card ? card.querySelector("h3").textContent : rewardId;
}

function createDefaultState() {
  return {
    wallet: 0,
    currentDate: getTodayKey(),
    dailyCompleted: {},
    requests: [],
    parentPin: null,
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") {
      return createDefaultState();
    }

    return {
      ...createDefaultState(),
      ...saved,
      dailyCompleted: saved.dailyCompleted || {},
      requests: Array.isArray(saved.requests) ? saved.requests : [],
    };
  } catch (error) {
    return createDefaultState();
  }
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function rolloverDayIfNeeded() {
  const today = getTodayKey();
  if (state.currentDate !== today) {
    state.currentDate = today;
    state.dailyCompleted = {};
    saveState();
  }
}

function pendingRequests() {
  return state.requests.filter((request) => request.status === "pending");
}

function reservedSpark() {
  return pendingRequests().reduce((sum, request) => sum + request.cost, 0);
}

function availableToRequest() {
  return state.wallet - reservedSpark();
}

function psUsedToday() {
  const today = getTodayKey();
  return state.requests.some((request) => {
    return (
      request.rewardId === "ps" &&
      request.requestDate === today &&
      (request.status === "pending" || request.status === "approved")
    );
  });
}

function setMessage(text) {
  message.textContent = text;
}

function restoreMissionsFromState() {
  missionCards.forEach((card) => {
    const missionId = card.dataset.id;
    const checked = Boolean(state.dailyCompleted[missionId]);
    card.querySelector(".mission-check").checked = checked;
  });
}

function calculateCompletedCards() {
  return missionCards.filter((card) => {
    const missionId = card.dataset.id;
    return Boolean(state.dailyCompleted[missionId]);
  });
}

function renderHistory(container, limit = 6) {
  const items = [...state.requests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);

  if (items.length === 0) {
    container.innerHTML = '<p class="empty-state">Nu există încă cereri.</p>';
    return;
  }

  const labels = {
    pending: "În așteptare",
    approved: "Aprobată",
    rejected: "Respinsă",
  };

  container.innerHTML = items
    .map((request) => {
      const statusClass = `status-${request.status}`;
      return `
        <div class="history-item">
          <div>
            <div class="history-title">${rewardNameFromId(request.rewardId)}</div>
            <div class="history-meta">${request.cost} Spark · ${formatDateTime(request.createdAt)}</div>
          </div>
          <div class="status-label ${statusClass}">${labels[request.status]}</div>
        </div>
      `;
    })
    .join("");
}

function renderPendingList() {
  const pending = pendingRequests();

  if (pending.length === 0) {
    pendingList.innerHTML = '<p class="empty-state">Nu există cereri în așteptare.</p>';
    return;
  }

  pendingList.innerHTML = pending
    .map((request) => {
      return `
        <article class="pending-item">
          <h3>${rewardNameFromId(request.rewardId)}</h3>
          <p>${request.cost} Spark · cerută la ${formatDateTime(request.createdAt)}</p>
          <div class="pending-actions">
            <button class="approve-button" type="button" data-request-id="${request.id}">Aprobă</button>
            <button class="reject-button" type="button" data-request-id="${request.id}">Respinge</button>
          </div>
        </article>
      `;
    })
    .join("");

  pendingList.querySelectorAll(".approve-button").forEach((button) => {
    button.addEventListener("click", () => approveRequest(button.dataset.requestId));
  });

  pendingList.querySelectorAll(".reject-button").forEach((button) => {
    button.addEventListener("click", () => rejectRequest(button.dataset.requestId));
  });
}

function renderRewards() {
  const spendable = availableToRequest();

  rewardCards.forEach((card) => {
    const cost = Number(card.dataset.cost);
    const rewardId = card.dataset.id;
    const button = card.querySelector(".claim-button");
    const blockedByDailyLimit = rewardId === "ps" && psUsedToday();

    button.disabled = spendable < cost || blockedByDailyLimit;

    if (blockedByDailyLimit) {
      button.textContent = "Limita zilnică atinsă";
    } else if (spendable < cost) {
      button.textContent = `Mai trebuie ${cost - spendable} Spark`;
    } else {
      button.textContent = "Cere recompensa";
    }
  });
}

function render() {
  rolloverDayIfNeeded();
  restoreMissionsFromState();

  const completedCards = calculateCompletedCards();
  const reserved = reservedSpark();

  sparkTotal.textContent = state.wallet;
  reservedText.textContent = reserved > 0 ? `${reserved} rezervați în cereri` : "";
  progressText.textContent = `${completedCards.length} / ${missionCards.length} misiuni`;
  progressBar.style.width = `${(completedCards.length / missionCards.length) * 100}%`;

  todayLabel.textContent = new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  missionCards.forEach((card) => {
    card.classList.toggle("completed", Boolean(state.dailyCompleted[card.dataset.id]));
  });

  const pendingCount = pendingRequests().length;
  pendingBadge.textContent = pendingCount;
  pendingBadge.classList.toggle("hidden", pendingCount === 0);

  renderRewards();
  renderHistory(publicHistory);
  renderHistory(parentHistory, 20);

  if (parentUnlocked) {
    renderPendingList();
  }

  if (completedCards.length === missionCards.length) {
    setMessage("Toate misiunile sunt gata. Zi completă de campion!");
  }
}

function handleMissionChange(card, checkbox) {
  const missionId = card.dataset.id;
  const points = Number(card.dataset.points);
  const wasCompleted = Boolean(state.dailyCompleted[missionId]);

  if (checkbox.checked && !wasCompleted) {
    state.dailyCompleted[missionId] = true;
    state.wallet += points;
    saveState();
    setMessage(`Misiune completată: +${points} Spark.`);
    render();
    return;
  }

  if (!checkbox.checked && wasCompleted) {
    if (state.wallet - points < reservedSpark()) {
      checkbox.checked = true;
      setMessage("Acești Spark sunt deja rezervați pentru o recompensă în așteptare.");
      return;
    }

    state.dailyCompleted[missionId] = false;
    state.wallet -= points;
    saveState();
    setMessage(`Misiunea a fost debifată: -${points} Spark.`);
    render();
  }
}

function requestReward(card) {
  const rewardId = card.dataset.id;
  const cost = Number(card.dataset.cost);
  const name = card.querySelector("h3").textContent;

  if (rewardId === "ps" && psUsedToday()) {
    setMessage("Ora de PS poate fi cerută maximum o dată pe zi.");
    return;
  }

  if (availableToRequest() < cost) {
    setMessage("Nu sunt suficienți Spark disponibili.");
    return;
  }

  state.requests.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    rewardId,
    cost,
    status: "pending",
    requestDate: getTodayKey(),
    createdAt: new Date().toISOString(),
  });

  saveState();
  setMessage(`Cererea pentru „${name}” a fost trimisă părintelui.`);
  render();
}

function approveRequest(requestId) {
  const request = state.requests.find((item) => item.id === requestId);
  if (!request || request.status !== "pending") {
    return;
  }

  if (state.wallet < request.cost) {
    setMessage("Soldul nu mai este suficient pentru aprobarea acestei recompense.");
    return;
  }

  state.wallet -= request.cost;
  request.status = "approved";
  request.reviewedAt = new Date().toISOString();
  saveState();
  setMessage(`Recompensă aprobată: ${rewardNameFromId(request.rewardId)}.`);
  render();
  renderPendingList();
}

function rejectRequest(requestId) {
  const request = state.requests.find((item) => item.id === requestId);
  if (!request || request.status !== "pending") {
    return;
  }

  request.status = "rejected";
  request.reviewedAt = new Date().toISOString();
  saveState();
  setMessage(`Cererea pentru ${rewardNameFromId(request.rewardId)} a fost respinsă.`);
  render();
  renderPendingList();
}

function openParentDialog() {
  pinError.textContent = "";
  pinInput.value = "";

  if (parentUnlocked) {
    parentAuth.classList.add("hidden");
    parentConsole.classList.remove("hidden");
    renderPendingList();
  } else {
    parentAuth.classList.remove("hidden");
    parentConsole.classList.add("hidden");

    if (state.parentPin) {
      pinTitle.textContent = "Introdu PIN-ul părintelui";
      pinHelp.textContent = "PIN-ul permite aprobarea sau respingerea recompenselor.";
      pinAction.textContent = "Deblochează";
    } else {
      pinTitle.textContent = "Creează PIN-ul părintelui";
      pinHelp.textContent = "Alege un PIN din 4 cifre. Va fi salvat numai pe acest dispozitiv.";
      pinAction.textContent = "Salvează PIN-ul";
    }
  }

  parentDialog.showModal();
  window.setTimeout(() => pinInput.focus(), 80);
}

function handlePinAction() {
  const pin = pinInput.value.trim();

  if (!/^\d{4}$/.test(pin)) {
    pinError.textContent = "PIN-ul trebuie să conțină exact 4 cifre.";
    return;
  }

  if (!state.parentPin) {
    state.parentPin = pin;
    saveState();
    parentUnlocked = true;
    pinError.textContent = "";
    parentAuth.classList.add("hidden");
    parentConsole.classList.remove("hidden");
    renderPendingList();
    return;
  }

  if (pin !== state.parentPin) {
    pinError.textContent = "PIN incorect.";
    return;
  }

  parentUnlocked = true;
  pinError.textContent = "";
  parentAuth.classList.add("hidden");
  parentConsole.classList.remove("hidden");
  renderPendingList();
}

missionChecks.forEach((checkbox) => {
  const card = checkbox.closest(".mission-card");
  checkbox.addEventListener("change", () => handleMissionChange(card, checkbox));
});

claimButtons.forEach((button) => {
  const card = button.closest(".reward-card");
  button.addEventListener("click", () => requestReward(card));
});

resetButton.addEventListener("click", () => {
  const checkedCards = calculateCompletedCards();
  const pointsToday = checkedCards.reduce((sum, card) => sum + Number(card.dataset.points), 0);

  if (pointsToday === 0) {
    setMessage("Nu există misiuni bifate pentru resetare.");
    return;
  }

  if (state.wallet - pointsToday < reservedSpark()) {
    setMessage("Ziua nu poate fi resetată: există Spark rezervați într-o cerere.");
    return;
  }

  const confirmed = window.confirm(
    `Resetezi misiunile de azi? Se vor retrage ${pointsToday} Spark.`
  );

  if (!confirmed) {
    return;
  }

  state.wallet -= pointsToday;
  state.dailyCompleted = {};
  saveState();
  setMessage("Misiunile zilei au fost resetate.");
  render();
});

parentButton.addEventListener("click", openParentDialog);
pinAction.addEventListener("click", handlePinAction);
pinInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handlePinAction();
  }
});

rolloverDayIfNeeded();
render();
