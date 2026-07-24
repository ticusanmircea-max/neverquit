const STORAGE_KEY = "neverquit_state_v4_tasks";
const PREVIOUS_STORAGE_KEYS = ["neverquit_state_v3_tasks", "neverquit_state_v2"];
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
const bottomNavButtons = [...document.querySelectorAll(".bottom-nav-button")];
const achievementNavBadge = document.getElementById("achievementNavBadge");
const rewardNavBadge = document.getElementById("rewardNavBadge");
const childNameInput = document.getElementById("childNameInput");
const childAgeInput = document.getElementById("childAgeInput");
const saveProfileButton = document.getElementById("saveProfileButton");
const welcomeTitle = document.getElementById("welcomeTitle");
const PROFILE_KEY = "neverquit_child_profile_v1";
function loadChildProfile() { try { return { name: "Iosif", age: "10", ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") }; } catch { return { name: "Iosif", age: "10" }; } }
function renderChildProfile() { const profile = loadChildProfile(); if (childNameInput) childNameInput.value = profile.name || ""; if (childAgeInput) childAgeInput.value = profile.age || ""; if (welcomeTitle) welcomeTitle.textContent = `Bună, ${profile.name || "campionule"}!`; }

const topbarToggle = document.getElementById("topbarToggle");
const topbarDetails = document.getElementById("topbarDetails");
const topStreak = document.getElementById("topStreak");
const topSpark = document.getElementById("topSpark");
const topLevel = document.getElementById("topLevel");
const topProgress = document.getElementById("topProgress");
const topCurrentStreak = document.getElementById("topCurrentStreak");
const topBestStreak = document.getElementById("topBestStreak");
const topBestVisible = document.getElementById("topBestVisible");
const topSparkDetail = document.getElementById("topSparkDetail");
const topLevelDetail = document.getElementById("topLevelDetail");
const topProgressText = document.getElementById("topProgressText");
const topProgressBar = document.getElementById("topProgressBar");
const topParentButton = document.getElementById("topParentButton");
const topResetButton = document.getElementById("topResetButton");

const ACTIVE_MISSION_KEY = "neverquit_active_mission_v60";
const previousMissionButton = document.getElementById("previousMissionButton");
const nextMissionButton = document.getElementById("nextMissionButton");
const activeMissionName = document.getElementById("activeMissionName");
const nextMissionHint = document.getElementById("nextMissionHint");
let activeMissionId = localStorage.getItem(ACTIVE_MISSION_KEY) || missionCards[0]?.dataset.id || "start";

function getCardProgress(card) {
  const checks = [...card.querySelectorAll(".task-check")];
  const requiredChecks = checks;
  const done = checks.filter((check) => Boolean(state.dailyTasks[check.dataset.taskId])).length;
  const requiredDone = requiredChecks.filter((check) => Boolean(state.dailyTasks[check.dataset.taskId])).length;
  return {
    done,
    total: checks.length,
    percent: checks.length ? (done / checks.length) * 100 : 0,
    requiredDone,
    requiredTotal: requiredChecks.length,
    unlockReady: requiredChecks.length === 0 || requiredDone === requiredChecks.length,
  };
}

function isMissionUnlocked(index) {
  if (index <= 0) return true;
  return getCardProgress(missionCards[index - 1]).unlockReady;
}

function setActiveMission(index) {
  if (index < 0 || index >= missionCards.length || !isMissionUnlocked(index)) return;
  activeMissionId = missionCards[index].dataset.id;
  localStorage.setItem(ACTIVE_MISSION_KEY, activeMissionId);
  renderMissionSequence();
  missionCards[index].scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderMissionSequence() {
  let activeIndex = missionCards.findIndex((card) => card.dataset.id === activeMissionId);
  if (activeIndex < 0 || !isMissionUnlocked(activeIndex)) {
    activeIndex = Math.max(0, missionCards.findLastIndex ? missionCards.findLastIndex((_, index) => isMissionUnlocked(index)) : 0);
    activeMissionId = missionCards[activeIndex]?.dataset.id || missionCards[0]?.dataset.id;
    localStorage.setItem(ACTIVE_MISSION_KEY, activeMissionId);
  }

  missionCards.forEach((card, index) => {
    const shouldHide = index !== activeIndex;
    card.hidden = shouldHide;
    card.classList.toggle("sequence-hidden", shouldHide);
    card.setAttribute("aria-hidden", shouldHide ? "true" : "false");
  });

  const activeCard = missionCards[activeIndex];
  const activeTitle = activeCard?.querySelector(".mission-content strong")?.textContent || "Misiune";
  if (activeMissionName) activeMissionName.textContent = activeTitle;

  const progress = activeCard ? getCardProgress(activeCard) : { percent: 0 };
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < missionCards.length - 1;
  const nextUnlocked = hasNext && progress.unlockReady;

  if (previousMissionButton) previousMissionButton.hidden = !hasPrevious;
  if (nextMissionButton) {
    nextMissionButton.hidden = !nextUnlocked;
    nextMissionButton.textContent = nextUnlocked ? "Urmatoarea misiune →" : "Urmatoarea →";
  }
  if (nextMissionHint) {
    if (!hasNext) nextMissionHint.textContent = "Aceasta este ultima misiune a zilei.";
    else if (nextUnlocked) nextMissionHint.textContent = "Ai deblocat urmatoarea misiune!";
    else nextMissionHint.textContent = `Finalizează toate activitățile acestei misiuni pentru a continua.`;
  }
}


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
    unreadAchievementIds: [],
    seenAvailableRewardIds: [],
    lastKnownLevel: 1,
    stats: {
      totalMissions: 0,
    },
  };
}

function loadState() {
  try {
    const savedRaw = localStorage.getItem(STORAGE_KEY) || PREVIOUS_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    const saved = savedRaw ? JSON.parse(savedRaw) : null;
    if (saved && typeof saved === "object") {
      return {
        ...createDefaultState(), ...saved,
        dailyTasks: saved.dailyTasks || {},
        requests: Array.isArray(saved.requests) ? saved.requests : [],
        totalEarned: Number.isFinite(saved.totalEarned) ? saved.totalEarned : Math.max(0, Number(saved.wallet) || 0),
        completedDays: Array.isArray(saved.completedDays) ? saved.completedDays : [],
        unlockedAchievements: Array.isArray(saved.unlockedAchievements) ? saved.unlockedAchievements : [],
        unreadAchievementIds: Array.isArray(saved.unreadAchievementIds) ? saved.unreadAchievementIds : [],
        seenAvailableRewardIds: Array.isArray(saved.seenAvailableRewardIds) ? saved.seenAvailableRewardIds : [],
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
      if (!state.unreadAchievementIds.includes(achievement.id)) state.unreadAchievementIds.push(achievement.id);
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

function getAvailableRewardIds() {
  const spendable = availableToRequest();
  return rewardCards
    .filter((card) => spendable >= Number(card.dataset.cost) && !(card.dataset.id === "ps" && psUsedToday()))
    .map((card) => card.dataset.id);
}

function getNewAvailableRewardIds() {
  const available = getAvailableRewardIds();
  return available.filter((id) => !state.seenAvailableRewardIds.includes(id));
}

function renderBottomNotifications() {
  const achievementCountUnread = state.unreadAchievementIds.length;
  achievementNavBadge.textContent = achievementCountUnread;
  achievementNavBadge.classList.toggle("hidden", achievementCountUnread === 0);

  const newRewards = getNewAvailableRewardIds();
  rewardNavBadge.textContent = newRewards.length;
  rewardNavBadge.classList.toggle("hidden", newRewards.length === 0);
}

function switchView(view) {
  document.body.dataset.activeView = view;
  bottomNavButtons.forEach((button) => button.classList.toggle("active", button.dataset.targetView === view));

  if (view === "achievements") state.unreadAchievementIds = [];
  if (view === "rewards") {
    state.seenAvailableRewardIds = [...new Set([...state.seenAvailableRewardIds, ...getAvailableRewardIds()])];
  }
  saveState();
  renderBottomNotifications();
  window.scrollTo({ top: 0, behavior: "smooth" });
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
  progressBar.style.width = `${taskChecks.length ? (completedTasks.length / taskChecks.length) * 100 : 0}%`;
  progressBar.setAttribute("aria-valuenow", String(completedTasks.length));
  const dayPercent = taskChecks.length ? Math.round((completedTasks.length / taskChecks.length) * 100) : 0;
  const streakInfo = getStreaks(state.completedDays);
  const topLevelInfo = getLevelInfo(state.totalEarned);
  if (topStreak) topStreak.textContent = streakInfo.current;
  if (topSpark) topSpark.textContent = state.wallet;
  if (topLevel) topLevel.textContent = topLevelInfo.level;
  if (topProgress) topProgress.textContent = `${dayPercent}%`;
  if (topCurrentStreak) topCurrentStreak.textContent = streakInfo.current;
  if (topBestStreak) topBestStreak.textContent = streakInfo.best;
  if (topBestVisible) topBestVisible.textContent = streakInfo.best;
  if (topSparkDetail) topSparkDetail.textContent = state.wallet;
  if (topLevelDetail) topLevelDetail.textContent = `${topLevelInfo.level} · ${topLevelInfo.current.title}`;
  if (topProgressText) topProgressText.textContent = `${completedTasks.length} / ${taskChecks.length} activități`;
  if (topProgressBar) topProgressBar.style.width = `${dayPercent}%`;

  renderChildProfile();

  if (todayLabel) todayLabel.textContent = new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  missionCards.forEach((card) => {
    const checks = [...card.querySelectorAll(".task-check")];
    const done = checks.filter((check) => Boolean(state.dailyTasks[check.dataset.taskId])).length;
    const percent = checks.length ? (done / checks.length) * 100 : 0;
    card.classList.toggle("completed", done === checks.length);
    const cardBar = card.querySelector(".card-progress-bar");
    const cardText = card.querySelector(".card-progress-text");
    if (cardBar) cardBar.style.width = `${percent}%`;
    if (cardText) cardText.textContent = `${done} / ${checks.length} bifate`;
  });
  renderMissionSequence();

  const pendingCount = pendingRequests().length;
  pendingBadge.textContent = pendingCount;
  pendingBadge.classList.toggle("hidden", pendingCount === 0);

  renderRpg();
  renderRewards();
  renderHistory(publicHistory);
  renderHistory(parentHistory, 20);
  renderBottomNotifications();

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
    const currentIndex = missionCards.indexOf(card);
    const progressNow = getCardProgress(card);
    if (progressNow.unlockReady && currentIndex >= 0 && currentIndex < missionCards.length - 1) {
      activeMissionId = missionCards[currentIndex + 1].dataset.id;
      localStorage.setItem(ACTIVE_MISSION_KEY, activeMissionId);
    }
    setMessage(`${taskName}: +${points} Spark.`); render(); return;
  }
  if (!checkbox.checked && wasChecked) {
    if (state.wallet - points < reservedSpark()) { checkbox.checked = true; setMessage("Acești Spark sunt deja rezervați."); return; }
    state.dailyTasks[taskId] = false;
    state.wallet -= points; state.totalEarned = Math.max(0, state.totalEarned - points);
    if (cardWasComplete) state.stats.totalMissions = Math.max(0, state.stats.totalMissions - 1);
    recordCompletedDayIfNeeded();
    state.unlockedAchievements = state.unlockedAchievements.filter((id) => { const a=ACHIEVEMENTS.find((x)=>x.id===id); return a ? a.test(state) : false; });
    state.unreadAchievementIds = state.unreadAchievementIds.filter((id) => state.unlockedAchievements.includes(id));
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
  checkbox.addEventListener("change", () => {
    handleTaskChange(card, checkbox);
  });
});

// Fallback pentru unele WebView-uri Android: asigură declanșarea la atingerea rândului.
document.querySelectorAll(".task-toggle").forEach((toggle) => {
  toggle.addEventListener("click", (event) => {
    const checkbox = toggle.querySelector(".task-check");
    if (!checkbox || event.target === checkbox) return;
    // Comportamentul implicit al label-ului schimbă checkbox-ul; nu dublăm apăsarea.
  });
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
  state.unreadAchievementIds = state.unreadAchievementIds.filter((id) => state.unlockedAchievements.includes(id));
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


if (previousMissionButton) previousMissionButton.addEventListener("click", () => {
  const index = missionCards.findIndex((card) => card.dataset.id === activeMissionId);
  setActiveMission(index - 1);
});
if (nextMissionButton) nextMissionButton.addEventListener("click", () => {
  const index = missionCards.findIndex((card) => card.dataset.id === activeMissionId);
  setActiveMission(index + 1);
});

bottomNavButtons.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.targetView));
});

document.body.dataset.activeView = "missions";

rolloverDayIfNeeded();
updateAchievements();
state.lastKnownLevel = getLevelInfo(state.totalEarned).level;
saveState();
render();


if (topbarToggle && topbarDetails) {
  if (topbarToggle) topbarToggle.addEventListener("click", () => {
    const willOpen = topbarDetails.hidden;
    topbarDetails.hidden = !willOpen;
    topbarToggle.setAttribute("aria-expanded", String(willOpen));
    document.body.classList.toggle("topbar-open", willOpen);
  });
}
if (topParentButton) topParentButton.addEventListener("click", () => parentButton?.click());
if (topResetButton) topResetButton.addEventListener("click", () => resetButton?.click());

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


if (saveProfileButton) saveProfileButton.addEventListener("click", () => {
  const name = (childNameInput?.value || "").trim() || "Iosif";
  const age = String(childAgeInput?.value || "").trim();
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, age }));
  renderChildProfile();
  setMessage("Profilul copilului a fost salvat.");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}
