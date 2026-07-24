const STORAGE_KEY = "neverquit_state_v3_tasks";
const LEGACY_STORAGE_KEY = "neverquit_state_v2";

const missionCards = [...document.querySelectorAll(".mission-card")];
const taskChecks = [...document.querySelectorAll(".task-check")];
const helpButtons = [...document.querySelectorAll(".help-button")];
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

const levelNumber = document.getElementById("levelNumber");
const levelTitle = document.getElementById("levelTitle");
const levelProgressText = document.getElementById("levelProgressText");
const levelProgressBar = document.getElementById("levelProgressBar");
const currentStreak = document.getElementById("currentStreak");
const bestStreak = document.getElementById("bestStreak");
const totalMissions = document.getElementById("totalMissions");
const lifetimeSpark = document.getElementById("lifetimeSpark");
const achievementCount = document.getElementById("achievementCount");
const achievementGrid = document.getElementById("achievementGrid");
const levelUpDialog = document.getElementById("levelUpDialog");
const levelUpMessage = document.getElementById("levelUpMessage");
const closeLevelUp = document.getElementById("closeLevelUp");
const missionCompleteDialog = document.getElementById("missionCompleteDialog");
const closeMissionComplete = document.getElementById("closeMissionComplete");
const celebrationMission = document.getElementById("celebrationMission");
const celebrationSpark = document.getElementById("celebrationSpark");
const celebrationStreak = document.getElementById("celebrationStreak");
const celebrationLevel = document.getElementById("celebrationLevel");
const celebrationMessage = document.getElementById("celebrationMessage");
const taskHelpDialog = document.getElementById("taskHelpDialog");
const taskHelpTitle = document.getElementById("taskHelpTitle");
const taskHelpText = document.getElementById("taskHelpText");
const closeTaskHelp = document.getElementById("closeTaskHelp");
const closeTaskHelpBottom = document.getElementById("closeTaskHelpBottom");


const LEVELS = [
  { threshold: 0, title: "Începător curajos" },
  { threshold: 500, title: "Aprinzător de Spark" },
  { threshold: 1200, title: "Luptător consecvent" },
  { threshold: 2200, title: "Maestru al misiunilor" },
  { threshold: 3500, title: "Campion în devenire" },
  { threshold: 5000, title: "Erou NeverQuit" },
  { threshold: 7000, title: "Legendă disciplinată" },
  { threshold: 9500, title: "Maestru NeverQuit" },
  { threshold: 12500, title: "Campion legendar" },
  { threshold: 16000, title: "Nivel suprem" },
];

const ACHIEVEMENTS = [
  { id: "first-mission", emoji: "⚡", name: "Primul Spark", description: "Termină prima misiune.", test: (s) => s.stats.totalMissions >= 1 },
  { id: "first-day", emoji: "🥇", name: "Zi de campion", description: "Termină toate misiunile într-o zi.", test: (s) => s.completedDays.length >= 1 },
  { id: "spark-500", emoji: "💎", name: "Rezervă de energie", description: "Câștigă 500 Spark în total.", test: (s) => s.totalEarned >= 500 },
  { id: "streak-3", emoji: "🔥", name: "Foc aprins", description: "Ajunge la un streak de 3 zile.", test: (s) => getBestStreak(s.completedDays) >= 3 },
  { id: "missions-25", emoji: "🎯", name: "Vânător de misiuni", description: "Termină 25 de misiuni.", test: (s) => s.stats.totalMissions >= 25 },
  { id: "rewards-5", emoji: "🏆", name: "Strategul recompenselor", description: "Primește aprobarea pentru 5 recompense.", test: (s) => s.requests.filter((r) => r.status === "approved").length >= 5 },
];


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
    dailyTasks: {},
    requests: [],
    parentPin: null,
    totalEarned: 0,
    completedDays: [],
    unlockedAchievements: [],
    lastKnownLevel: 1,
    stats: {
      totalMissions: 0,
    },
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") {
      return {
        ...createDefaultState(), ...saved,
        dailyTasks: saved.dailyTasks || {},
        requests: Array.isArray(saved.requests) ? saved.requests : [],
        totalEarned: Number.isFinite(saved.totalEarned) ? saved.totalEarned : Math.max(0, Number(saved.wallet) || 0),
        completedDays: Array.isArray(saved.completedDays) ? saved.completedDays : [],
        unlockedAchievements: Array.isArray(saved.unlockedAchievements) ? saved.unlockedAchievements : [],
        stats: { totalMissions: Number(saved.stats?.totalMissions) || 0 },
      };
    }
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    const migrated = createDefaultState();
    if (legacy && typeof legacy === "object") {
      Object.assign(migrated, legacy);
      migrated.dailyTasks = {};
      missionCards.forEach((card) => {
        if (legacy.dailyCompleted?.[card.dataset.id]) {
          card.querySelectorAll(".task-check").forEach((check) => migrated.dailyTasks[check.dataset.taskId] = true);
        }
      });
      delete migrated.dailyCompleted;
    }
    return migrated;
  } catch (error) { return createDefaultState(); }
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function rolloverDayIfNeeded() {
  const today = getTodayKey();
  if (state.currentDate !== today) {
    state.currentDate = today;
    state.dailyTasks = {};
    saveState();
  }
}


function dateKeyToUtc(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function getStreaks(completedDays) {
  const days = [...new Set(completedDays)].sort();
  if (days.length === 0) {
    return { current: 0, best: 0 };
  }

  let best = 1;
  let running = 1;

  for (let index = 1; index < days.length; index += 1) {
    const difference = (dateKeyToUtc(days[index]) - dateKeyToUtc(days[index - 1])) / 86400000;
    if (difference === 1) {
      running += 1;
      best = Math.max(best, running);
    } else {
      running = 1;
    }
  }

  const today = getTodayKey();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = [
    yesterdayDate.getFullYear(),
    String(yesterdayDate.getMonth() + 1).padStart(2, "0"),
    String(yesterdayDate.getDate()).padStart(2, "0"),
  ].join("-");

  const lastDay = days[days.length - 1];
  if (lastDay !== today && lastDay !== yesterday) {
    return { current: 0, best };
  }

  let current = 1;
  for (let index = days.length - 1; index > 0; index -= 1) {
    const difference = (dateKeyToUtc(days[index]) - dateKeyToUtc(days[index - 1])) / 86400000;
    if (difference !== 1) break;
    current += 1;
  }

  return { current, best };
}

function getBestStreak(completedDays) {
  return getStreaks(completedDays).best;
}

function getLevelInfo(totalEarned) {
  let index = LEVELS.length - 1;
  for (let i = 0; i < LEVELS.length; i += 1) {
    const next = LEVELS[i + 1];
    if (!next || totalEarned < next.threshold) {
      index = i;
      break;
    }
  }

  const current = LEVELS[index];
  const next = LEVELS[index + 1] || null;
  const level = index + 1;
  const progress = next
    ? Math.max(0, Math.min(100, ((totalEarned - current.threshold) / (next.threshold - current.threshold)) * 100))
    : 100;

  return { level, current, next, progress };
}

function showLevelUp(levelInfo) {
  if (!levelUpDialog || levelUpDialog.open) return;
  levelUpMessage.textContent = `Ai ajuns la Level ${levelInfo.level}: ${levelInfo.current.title}.`;
  levelUpDialog.showModal();
}

function createSparkBurst(points, card) {
  const rect = card.getBoundingClientRect();
  const burst = document.createElement("span");
  burst.className = "spark-burst";
  burst.textContent = `+${points} ✦`;
  burst.style.left = `${rect.right - 72}px`;
  burst.style.top = `${rect.top + 20}px`;
  document.body.appendChild(burst);
  window.setTimeout(() => burst.remove(), 950);
}

function isCardComplete(card) {
  const checks = [...card.querySelectorAll(".task-check")];
  return checks.length > 0 && checks.every((check) => Boolean(state.dailyTasks[check.dataset.taskId]));
}

function recordCompletedDayIfNeeded() {
  const allCompleted = taskChecks.every((check) => Boolean(state.dailyTasks[check.dataset.taskId]));
  const today = getTodayKey();
  if (allCompleted && !state.completedDays.includes(today)) { state.completedDays.push(today); return true; }
  if (!allCompleted && state.completedDays.includes(today)) state.completedDays = state.completedDays.filter((day) => day !== today);
  return false;
}

function updateAchievements() {
  const newlyUnlocked = [];

  ACHIEVEMENTS.forEach((achievement) => {
    if (achievement.test(state) && !state.unlockedAchievements.includes(achievement.id)) {
      state.unlockedAchievements.push(achievement.id);
      newlyUnlocked.push(achievement);
    }
  });

  return newlyUnlocked;
}

function renderRpg() {
  const levelInfo = getLevelInfo(state.totalEarned);
  const streaks = getStreaks(state.completedDays);

  levelNumber.textContent = levelInfo.level;
  levelTitle.textContent = levelInfo.current.title;
  levelProgressBar.style.width = `${levelInfo.progress}%`;

  if (levelInfo.next) {
    levelProgressText.textContent = `${state.totalEarned} / ${levelInfo.next.threshold} Spark`;
  } else {
    levelProgressText.textContent = `${state.totalEarned} Spark · nivel maxim`;
  }

  currentStreak.textContent = streaks.current;
  bestStreak.textContent = streaks.best;
  totalMissions.textContent = state.stats.totalMissions;
  lifetimeSpark.textContent = state.totalEarned;

  achievementCount.textContent = `${state.unlockedAchievements.length} / ${ACHIEVEMENTS.length} deblocate`;
  achievementGrid.innerHTML = ACHIEVEMENTS.map((achievement) => {
    const unlocked = state.unlockedAchievements.includes(achievement.id);
    return `
      <article class="achievement-card ${unlocked ? "unlocked" : ""}">
        <span class="achievement-emoji">${unlocked ? achievement.emoji : "🔒"}</span>
        <strong>${achievement.name}</strong>
        <small>${achievement.description}</small>
      </article>
    `;
  }).join("");
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
  taskChecks.forEach((check) => { check.checked = Boolean(state.dailyTasks[check.dataset.taskId]); });
}
function calculateCompletedTasks() { return taskChecks.filter((check) => Boolean(state.dailyTasks[check.dataset.taskId])); }

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

  const completedTasks = calculateCompletedTasks();
  const reserved = reservedSpark();

  sparkTotal.textContent = state.wallet;
  reservedText.textContent = reserved > 0 ? `${reserved} rezervați în cereri` : "";
  progressText.textContent = `${completedTasks.length} / ${taskChecks.length} activități`;
  progressBar.style.width = `${(completedTasks.length / taskChecks.length) * 100}%`;

  todayLabel.textContent = new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  missionCards.forEach((card) => {
    const checks = [...card.querySelectorAll(".task-check")];
    const done = checks.filter((check) => Boolean(state.dailyTasks[check.dataset.taskId])).length;
    const percent = checks.length ? (done / checks.length) * 100 : 0;
    card.classList.toggle("completed", done === checks.length);
    card.querySelector(".card-progress-bar").style.width = `${percent}%`;
    card.querySelector(".card-progress-text").textContent = `${done} / ${checks.length} bifate`;
  });

  const pendingCount = pendingRequests().length;
  pendingBadge.textContent = pendingCount;
  pendingBadge.classList.toggle("hidden", pendingCount === 0);

  renderRpg();
  renderRewards();
  renderHistory(publicHistory);
  renderHistory(parentHistory, 20);

  if (parentUnlocked) {
    renderPendingList();
  }

  if (completedTasks.length === taskChecks.length) {
    setMessage("Toate misiunile sunt gata. Zi completă de campion!");
  }
}

function showMissionCelebration({ missionName, points, completedToday, newlyUnlocked, leveledUp, levelInfo, cardCompleted }) {
  if (!missionCompleteDialog || missionCompleteDialog.open) return;

  const streak = getStreaks(state.completedDays).current;
  celebrationMission.textContent = missionName;
  missionCompleteDialog.querySelector(".eyebrow").textContent = cardCompleted ? "Misiune finalizată" : "Progres înregistrat";
  celebrationSpark.textContent = `+${points} ✦ Spark`;
  celebrationStreak.textContent = `🔥 Streak: ${streak} ${streak === 1 ? "zi" : "zile"}`;
  celebrationLevel.textContent = `⭐ Nivel ${levelInfo.level}`;

  let ottoText = cardCompleted ? "Misiune completă! Ai dus-o până la capăt." : "Super! Încă un pas bifat.";
  if (leveledUp) {
    ottoText = `🚀 Ai ajuns la Nivelul ${levelInfo.level}: ${levelInfo.current.title}!`;
  } else if (newlyUnlocked.length > 0) {
    ottoText = `🏅 Insignă nouă: ${newlyUnlocked[0].name}!`;
  } else if (completedToday) {
    ottoText = "🏆 Zi perfectă! Ai terminat toate misiunile de azi.";
  } else if (state.stats.totalMissions === 1) {
    ottoText = "⚡ Primul pas este făcut. Bravo!";
  }
  celebrationMessage.textContent = ottoText;

  if (navigator.vibrate) navigator.vibrate(45);
  missionCompleteDialog.showModal();
}

function handleTaskChange(card, checkbox) {
  const taskId = checkbox.dataset.taskId;
  const points = Number(checkbox.dataset.points);
  const wasChecked = Boolean(state.dailyTasks[taskId]);
  const cardWasComplete = isCardComplete(card);
  const previousLevel = getLevelInfo(state.totalEarned).level;

  if (checkbox.checked && !wasChecked) {
    state.dailyTasks[taskId] = true;
    state.wallet += points; state.totalEarned += points;
    const cardCompleted = isCardComplete(card);
    if (cardCompleted && !cardWasComplete) state.stats.totalMissions += 1;
    const completedToday = recordCompletedDayIfNeeded();
    const newlyUnlocked = updateAchievements();
    const newLevelInfo = getLevelInfo(state.totalEarned);
    state.lastKnownLevel = newLevelInfo.level; saveState(); createSparkBurst(points, card);
    const taskName = checkbox.closest(".task-row").querySelector(".task-name")?.textContent || "Activitate bifată";
    showMissionCelebration({ missionName: cardCompleted ? card.querySelector(".mission-content strong").textContent : taskName, points, completedToday, newlyUnlocked, leveledUp: newLevelInfo.level > previousLevel, levelInfo: newLevelInfo, cardCompleted });
    setMessage(`${taskName}: +${points} Spark.`); render(); return;
  }
  if (!checkbox.checked && wasChecked) {
    if (state.wallet - points < reservedSpark()) { checkbox.checked = true; setMessage("Acești Spark sunt deja rezervați."); return; }
    state.dailyTasks[taskId] = false;
    state.wallet -= points; state.totalEarned = Math.max(0, state.totalEarned - points);
    if (cardWasComplete) state.stats.totalMissions = Math.max(0, state.stats.totalMissions - 1);
    recordCompletedDayIfNeeded();
    state.unlockedAchievements = state.unlockedAchievements.filter((id) => { const a=ACHIEVEMENTS.find((x)=>x.id===id); return a ? a.test(state) : false; });
    state.lastKnownLevel = getLevelInfo(state.totalEarned).level; saveState(); setMessage("Activitatea a fost debifată."); render();
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

taskChecks.forEach((checkbox) => {
  const card = checkbox.closest(".mission-card");
  checkbox.addEventListener("change", () => handleTaskChange(card, checkbox));
});
helpButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault(); event.stopPropagation();
    taskHelpTitle.textContent = button.dataset.helpTitle;
    taskHelpText.textContent = button.dataset.help;
    taskHelpDialog.showModal();
  });
});

claimButtons.forEach((button) => {
  const card = button.closest(".reward-card");
  button.addEventListener("click", () => requestReward(card));
});

resetButton.addEventListener("click", () => {
  const checkedTasks = calculateCompletedTasks();
  const pointsToday = checkedTasks.reduce((sum, check) => sum + Number(check.dataset.points), 0);

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
  state.totalEarned = Math.max(0, state.totalEarned - pointsToday);
  const completedCardsCount = missionCards.filter(isCardComplete).length;
  state.stats.totalMissions = Math.max(0, state.stats.totalMissions - completedCardsCount);
  state.dailyTasks = {};
  recordCompletedDayIfNeeded();
  state.unlockedAchievements = state.unlockedAchievements.filter((id) => {
    const achievement = ACHIEVEMENTS.find((item) => item.id === id);
    return achievement ? achievement.test(state) : false;
  });
  state.lastKnownLevel = getLevelInfo(state.totalEarned).level;
  saveState();
  setMessage("Misiunile zilei au fost resetate.");
  render();
});


closeTaskHelp.addEventListener("click", () => taskHelpDialog.close());
closeTaskHelpBottom.addEventListener("click", () => taskHelpDialog.close());
taskHelpDialog.addEventListener("click", (event) => { if (event.target === taskHelpDialog) taskHelpDialog.close(); });

closeMissionComplete.addEventListener("click", () => missionCompleteDialog.close());
missionCompleteDialog.addEventListener("click", (event) => {
  if (event.target === missionCompleteDialog) missionCompleteDialog.close();
});

closeLevelUp.addEventListener("click", () => levelUpDialog.close());
levelUpDialog.addEventListener("click", (event) => {
  if (event.target === levelUpDialog) levelUpDialog.close();
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
updateAchievements();
state.lastKnownLevel = getLevelInfo(state.totalEarned).level;
saveState();
render();


const installButton = document.getElementById("installButton");
const installHelp = document.getElementById("installHelp");
let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.classList.remove("hidden");
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    installHelp.classList.remove("hidden");
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.classList.add("hidden");
});

window.addEventListener("appinstalled", () => {
  setMessage("NeverQuit a fost instalată pe dispozitiv.");
  installButton.classList.add("hidden");
  installHelp.classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}
