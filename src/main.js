const BOARD_COLUMNS = 7;
const BOARD_ROWS = 7;
const CELL_COUNT = BOARD_COLUMNS * BOARD_ROWS;
const START_MOVES = 60;
const GOAL_MOVE_BONUS = 3;
const GAME_SET_DELAY = 850;
const BEST_KEY = "machi-narabe-best-v1";
const RANKING_API_URL = globalThis.MACHI_NARABE_CONFIG?.rankingApiUrl?.trim() || "";
const RANKING_LIMIT = 10;
const MAX_RANKING_SCORE = 999999999;
const MERGE_SIZE = 3;
const TRASH = -1;
const CLEANUP = -2;
const CONSTRUCTION = -3;
const CRANE = -4;
const PARK = -5;
const STALL = -6;
const REDEVELOPMENT = -7;
const DIRECT_SPAWN_MAX_LEVEL = 3;
const CRANE_MAX_UPGRADE_LEVEL = 3;
const TRASH_PENALTY = 280;
const CLEANUP_BONUS = 180;
const CLEANUP_CHAIN_BONUS = 130;
const CONSTRUCTION_PENALTY = 160;
const CONSTRUCTION_SPREAD_INTERVAL = 6;
const CONSTRUCTION_SPREAD_LIMIT = 2;
const CRANE_BONUS = 220;
const PARK_BONUS = 90;
const STALL_BASE_BONUS = 180;
const STALL_VALUE_RATE = 0.08;
const LOT_BONUS = 60;
const UNLOCK_START_MISSION = 2;
const LOTS_PER_UNLOCK = 6;
const DEFAULT_EFFECT_DURATION = 960;
const UNLOCK_EFFECT_DURATION = 1350;
const REDEVELOPMENT_LEVELS = [1, 1.2, 1.5];
const EPIC_EFFECT_DURATION = 2800;

const LEVELS = [
  null,
  { mark: "小", name: "小屋", color: "#d86b5f", soft: "#fde8e4", score: 40 },
  { mark: "家", name: "住宅", color: "#d9962d", soft: "#fbefd1", score: 150 },
  { mark: "店", name: "商店", color: "#2e9a6f", soft: "#dff1e7", score: 520 },
  { mark: "ビ", name: "ビル", color: "#2f78b7", soft: "#dfedf8", score: 4200 },
  { mark: "ラ", name: "ランドマーク", color: "#162329", soft: "#e4e8e6", score: 52000 },
];

const MAX_LEVEL = LEVELS.length - 1;
const MISSIONS = [
  { type: "reachLevel", level: 2, title: "住宅を作ろう", hint: "小屋を3つつなげる", bonus: LEVELS[2].score },
  { type: "reachLevel", level: 3, title: "商店を作ろう", hint: "住宅を3つつなげる", bonus: LEVELS[3].score },
  { type: "countLevel", level: 2, count: 3, title: "住宅以上を3つ残す", hint: "合体させすぎず、3か所に残す", bonus: 700 },
  { type: "reachLevel", level: 4, title: "ビルを作ろう", hint: "商店を3つつなげる", bonus: LEVELS[4].score },
  { type: "chain", level: 4, count: 2, title: "2コンボを出す", hint: "合体後も3つそろう形を作る", bonus: 2400, mark: "合", color: "#d99a2d", soft: "#fff8df" },
  { type: "countLevel", level: 4, count: 2, title: "ビル以上を2つ残す", hint: "大きい建物を2か所に分ける", bonus: 6500 },
  { type: "reachLevel", level: 5, title: "ランドマークを作ろう", hint: "ビルを3つつなげる", bonus: LEVELS[5].score },
  { type: "countLevel", level: 5, count: 2, title: "ランドマークを2つ作る", hint: "最高ランクを2か所に残す", bonus: LEVELS[5].score * 2, epic: true },
];

const SPECIALS = {
  [TRASH]: { mark: "汚", name: "ゴミ屋敷", color: "#6b7177", soft: "#eceeed", score: -TRASH_PENALTY },
  [CLEANUP]: { mark: "掃", name: "清掃車", color: "#2b86a3", soft: "#dff2f7", score: CLEANUP_BONUS },
  [CONSTRUCTION]: { mark: "工", name: "工事中", color: "#8b6a4a", soft: "#f1e5d9", score: -CONSTRUCTION_PENALTY },
  [CRANE]: { mark: "ク", name: "クレーン", color: "#c08a19", soft: "#fff0c9", score: CRANE_BONUS },
  [PARK]: { mark: "緑", name: "公園", color: "#3c9a62", soft: "#e0f1e5", score: PARK_BONUS },
  [STALL]: { mark: "屋", name: "屋台", color: "#cf6b43", soft: "#fae8dd", score: STALL_BASE_BONUS },
  [REDEVELOPMENT]: { mark: "再", name: "再開発", color: "#466978", soft: "#e6eff1", score: 0 },
};

const GRADE_LINES = [
  { min: 90000, grade: "S", text: "名所が生まれた、見ごたえのある街です。" },
  { min: 42000, grade: "A", text: "通りの使い方がうまい、いい街になりました。" },
  { min: 15000, grade: "B", text: "街の形がしっかり見えてきました。" },
  { min: 0, grade: "C", text: "小さな街が動き出しました。次は大きな建物を狙おう。" },
];

const EVENTS = [
  { id: "festival", name: "まち祭り", label: "合体すると手数+1", moves: 5 },
  { id: "boom", name: "建設日和", label: "合体のスコア1.5倍", moves: 5 },
  { id: "cleanup", name: "朝の清掃", label: "清掃車が来やすい", moves: 6 },
  { id: "market", name: "商店街セール", label: "合体のスコア+25%", moves: 5 },
  { id: "moveIn", name: "引っ越し日", label: "小屋・住宅が出やすい", moves: 6 },
  { id: "lotBonus", name: "区画点検", label: `置くだけで+${LOT_BONUS}`, moves: 5 },
  { id: "shortage", name: "資材待ち", label: "合体のスコア0.8倍", moves: 4 },
];

const PLAYER_NAME_ADJECTIVES = [
  "ゆるい",
  "きらり",
  "のんびり",
  "すました",
  "こつこつ",
  "まちなか",
  "夕焼け",
  "朝いち",
  "路地裏",
  "小さな",
  "気ままな",
  "ひらめき",
  "おだやか",
  "角地の",
  "公園前",
  "屋台好き",
];

const PLAYER_NAME_NOUNS = [
  "小屋番",
  "街づくり屋",
  "屋根職人",
  "公園係",
  "通り番",
  "地図係",
  "広場さん",
  "合体名人",
  "区画係",
  "クレーン屋",
  "清掃係",
  "住宅好き",
  "ビル番",
  "屋台番",
  "道しるべ",
  "街の人",
];

const SPAWN_TABLES = [
  null,
  [[1, 100]],
  [[1, 72], [2, 28]],
  [[1, 46], [2, 34], [3, 20]],
];

const dom = {
  resetButton: document.querySelector("#resetButton"),
  overlayStartButton: document.querySelector("#overlayStartButton"),
  againButton: document.querySelector("#againButton"),
  resetOverlay: document.querySelector("#resetOverlay"),
  cancelResetButton: document.querySelector("#cancelResetButton"),
  confirmResetButton: document.querySelector("#confirmResetButton"),
  rankingButton: document.querySelector("#rankingButton"),
  rankingOverlay: document.querySelector("#rankingOverlay"),
  closeRankingButton: document.querySelector("#closeRankingButton"),
  recommendButton: document.querySelector("#recommendButton"),
  recommendOverlay: document.querySelector("#recommendOverlay"),
  closeRecommendButton: document.querySelector("#closeRecommendButton"),
  startOverlay: document.querySelector("#startOverlay"),
  gameSetOverlay: document.querySelector("#gameSetOverlay"),
  resultOverlay: document.querySelector("#resultOverlay"),
  moves: document.querySelector("#timeValue"),
  movesBar: document.querySelector("#timeBar"),
  score: document.querySelector("#scoreValue"),
  scoreCard: document.querySelector("#scoreValue").closest(".score-card"),
  scoreDelta: document.querySelector("#scoreDelta"),
  chain: document.querySelector("#chainValue"),
  best: document.querySelector("#bestValue"),
  targetChip: document.querySelector("#targetChip"),
  targetMark: document.querySelector("#targetMark"),
  goal: document.querySelector("#goalValue"),
  goalHint: document.querySelector("#goalHint"),
  evolution: document.querySelector("#evolutionRail"),
  event: document.querySelector("#eventValue"),
  empty: document.querySelector("#emptyValue"),
  dockTitle: document.querySelector("#dockTitle"),
  dockMessage: document.querySelector("#dockMessage"),
  boardStory: document.querySelector("#boardStoryValue"),
  openedLots: document.querySelector("#openedLotsValue"),
  unlockHint: document.querySelector("#unlockHintValue"),
  board: document.querySelector("#board"),
  hand: document.querySelector("#hand"),
  resultTitle: document.querySelector("#resultTitle"),
  grade: document.querySelector("#gradeValue"),
  gameSetLabel: document.querySelector("#gameSetLabel"),
  gameSetScore: document.querySelector("#gameSetScoreValue"),
  resultPlayerName: document.querySelector("#resultPlayerName"),
  resultRank: document.querySelector("#resultRankValue"),
  resultRankingStatus: document.querySelector("#resultRankingStatus"),
  resultRankingList: document.querySelector("#resultRankingList"),
  resultHighlights: document.querySelector("#resultHighlights"),
  resultNextMoves: document.querySelector("#resultNextMoves"),
  scoreBreakdown: document.querySelector("#scoreBreakdown"),
  rankingStatus: document.querySelector("#rankingStatus"),
  overallRankingList: document.querySelector("#overallRankingList"),
  finalScore: document.querySelector("#finalScoreValue"),
  resultMessage: document.querySelector("#resultMessage"),
  resultCityTitle: document.querySelector("#resultCityTitle"),
  finalLevel: document.querySelector("#finalLevelValue"),
  finalChain: document.querySelector("#finalChainValue"),
  finalTurns: document.querySelector("#finalTurnsValue"),
};

const state = {
  running: false,
  ended: false,
  movesLeft: START_MOVES,
  score: 0,
  best: readBest(),
  bestChain: 0,
  lastChain: 0,
  turns: 0,
  grid: [],
  current: 1,
  next: 1,
  afterNext: 1,
  rng: Math.random,
  seed: "",
  targetLevel: 2,
  activeEvent: null,
  eventMovesLeft: 0,
  lastEventId: "",
  playerName: "",
  lastPlaced: -1,
  mergeCells: new Set(),
  upgradedCell: -1,
  effectMode: "",
  effectTimer: 0,
  resultTimer: 0,
  latestRecord: null,
  scoreBeforeTurn: 0,
  scoreDelta: 0,
  clearedMissions: 0,
  unlockedLots: new Set(),
  unlockQueue: [],
  newlyUnlockedCells: new Set(),
  redevelopmentLevels: [],
  constructionAges: new Map(),
  stallBonusTotal: 0,
  landmarkCompletions: 0,
  scoreParts: {
    building: 0,
    stall: 0,
    redevelopment: 0,
    other: 0,
  },
  isNewRecord: false,
  reactionText: "",
  reactionTone: "",
};

let rankingRecords = [];
let rankingStatusText = "確認中";
let latestResultCreatedAt = "";
let recommendationRefreshId = 0;

function createEmptyScoreParts() {
  return {
    building: 0,
    stall: 0,
    redevelopment: 0,
    other: 0,
  };
}

dom.resetButton.addEventListener("click", requestReset);
dom.overlayStartButton.addEventListener("click", startGame);
dom.rankingButton.addEventListener("click", openRankingOverlay);
dom.recommendButton.addEventListener("click", openRecommendOverlay);
dom.againButton.addEventListener("click", () => {
  resetGame();
  startGame();
});
dom.cancelResetButton.addEventListener("click", closeResetConfirm);
dom.closeRankingButton.addEventListener("click", closeRankingOverlay);
dom.closeRecommendButton.addEventListener("click", closeRecommendOverlay);
dom.confirmResetButton.addEventListener("click", () => {
  closeResetConfirm();
  resetGame();
});
dom.board.addEventListener("click", (event) => {
  const tile = event.target.closest("[data-index]");
  if (!tile) {
    return;
  }
  placeCurrent(Number(tile.dataset.index));
});
dom.recommendOverlay.addEventListener("click", (event) => {
  if (event.target === dom.recommendOverlay) {
    closeRecommendOverlay();
  }
});
dom.rankingOverlay.addEventListener("click", (event) => {
  if (event.target === dom.rankingOverlay) {
    closeRankingOverlay();
  }
});

resetGame();
loadRankings();
refreshRecommendationCards();

function resetGame() {
  const seed = getJstDateKey();
  state.running = false;
  state.ended = false;
  state.movesLeft = START_MOVES;
  state.score = 0;
  state.bestChain = 0;
  state.lastChain = 0;
  state.turns = 0;
  state.seed = seed;
  state.rng = mulberry32(hashText(seed));
  state.targetLevel = 2;
  state.activeEvent = null;
  state.eventMovesLeft = 0;
  state.lastEventId = "";
  state.playerName = generateRandomPlayerName(secureRandom);
  state.grid = Array.from({ length: CELL_COUNT }, () => null);
  state.current = 1;
  state.next = 1;
  state.afterNext = 1;
  state.mergeCells = new Set();
  state.upgradedCell = -1;
  state.effectMode = "";
  state.lastPlaced = -1;
  state.latestRecord = null;
  state.scoreBeforeTurn = 0;
  state.scoreDelta = 0;
  state.clearedMissions = 0;
  state.unlockedLots = new Set(coreLotIndexes());
  state.unlockQueue = createUnlockQueue();
  state.newlyUnlockedCells = new Set();
  state.redevelopmentLevels = Array.from({ length: CELL_COUNT }, () => 0);
  state.constructionAges = new Map();
  state.stallBonusTotal = 0;
  state.landmarkCompletions = 0;
  state.scoreParts = createEmptyScoreParts();
  state.isNewRecord = false;
  state.reactionText = "";
  state.reactionTone = "";
  window.clearTimeout(state.resultTimer);
  state.resultTimer = 0;

  prepareOpening();
  state.afterNext = drawLevel();
  dom.startOverlay.classList.add("show");
  dom.startOverlay.setAttribute("aria-hidden", "false");
  dom.resultOverlay.classList.remove("show");
  dom.resultOverlay.setAttribute("aria-hidden", "true");
  hideGameSet();
  closeRankingOverlay();
  closeRecommendOverlay();
  closeResetConfirm();
  clearMergeEffects(false);
  updatePlacementMessage();
  render(true);
}

function prepareOpening() {
  state.grid[indexFor(2, 3)] = 1;
  state.grid[indexFor(3, 3)] = 1;
}

function requestReset() {
  if (state.running || state.turns > 0 || state.score > 0) {
    openResetConfirm();
    return;
  }
  resetGame();
}

function openResetConfirm() {
  dom.resetOverlay.classList.add("show");
  dom.resetOverlay.setAttribute("aria-hidden", "false");
}

function closeResetConfirm() {
  dom.resetOverlay.classList.remove("show");
  dom.resetOverlay.setAttribute("aria-hidden", "true");
}

function openRankingOverlay() {
  void loadRankings();
  dom.rankingOverlay.classList.add("show");
  dom.rankingOverlay.setAttribute("aria-hidden", "false");
}

function closeRankingOverlay() {
  dom.rankingOverlay.classList.remove("show");
  dom.rankingOverlay.setAttribute("aria-hidden", "true");
}

function openRecommendOverlay() {
  refreshRecommendationCards();
  dom.recommendOverlay.classList.add("show");
  dom.recommendOverlay.setAttribute("aria-hidden", "false");
}

function closeRecommendOverlay() {
  dom.recommendOverlay.classList.remove("show");
  dom.recommendOverlay.setAttribute("aria-hidden", "true");
}

function startGame() {
  if (state.ended || state.running) {
    return;
  }
  state.running = true;
  dom.startOverlay.classList.remove("show");
  dom.startOverlay.setAttribute("aria-hidden", "true");
  updatePlacementMessage();
  render(true);
}

function drawLevel() {
  const candidates = spawnCandidates();
  const total = candidates.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = state.rng() * total;
  for (const [level, weight] of candidates) {
    roll -= weight;
    if (roll <= 0) {
      return level;
    }
  }
  return candidates.at(-1)[0];
}

function spawnCandidates() {
  const cap = Math.min(DIRECT_SPAWN_MAX_LEVEL, Math.max(1, maxLevel()));
  const candidates = [...(SPAWN_TABLES[cap] || SPAWN_TABLES[1])];
  if (state.activeEvent?.id === "moveIn") {
    candidates.push([1, 24], [2, 14]);
  }
  if (state.turns >= 8) {
    candidates.push([TRASH, Math.min(24, 10 + Math.floor(state.turns / 8))]);
  }
  if (state.turns >= 10) {
    candidates.push([PARK, 7]);
  }
  if (state.turns >= 12) {
    candidates.push([CONSTRUCTION, Math.min(16, 6 + Math.floor(state.turns / 10))]);
  }
  if (trashCount() > 0) {
    candidates.push([CLEANUP, state.activeEvent?.id === "cleanup" ? 22 : 8]);
  }
  if (constructionCount() > 0) {
    candidates.push([CRANE, 10]);
  }
  if (parkCount() > 0) {
    candidates.push([STALL, 10]);
  }
  if (state.turns >= 14 && hasRedevelopmentMove()) {
    candidates.push([REDEVELOPMENT, 12]);
  }
  return candidates;
}

function placeCurrent(index) {
  if (!state.running || state.ended) {
    return;
  }
  if (state.movesLeft <= 0) {
    endGame();
    return;
  }
  if (!Number.isInteger(index) || index < 0 || index >= CELL_COUNT) {
    return;
  }
  if (!isLotUnlocked(index)) {
    setMessage("まだ工事待ちの区画です。掲示板のお願いを達成すると開きます。", "区画係");
    return;
  }
  state.scoreBeforeTurn = state.score;
  state.scoreDelta = 0;
  if (state.current === CLEANUP) {
    cleanTrash(index);
    return;
  }
  if (state.current === CRANE) {
    useCrane(index);
    return;
  }
  if (state.current === STALL) {
    useStall(index);
    return;
  }
  if (state.current === REDEVELOPMENT) {
    useRedevelopment(index);
    return;
  }
  if (state.grid[index]) {
    if (redevelopmentLevel(index) > 0 && isBuilding(state.grid[index])) {
      setMessage(
        `再開発 Lv${redevelopmentLevel(index)}。評価倍率 ×${redevelopmentMultiplier(index).toFixed(1)}。`,
        tileName(state.grid[index]),
      );
      return;
    }
    setMessage("空いている区画だけに置けます。", tileName(state.current));
    return;
  }
  if (isBuilding(state.current) && isTrashBlockedLot(index)) {
    setMessage("ゴミ屋敷の近くには建物を置けません。先に清掃車で片づけよう。", "ゴミ屋敷");
    return;
  }

  const placedLevel = state.current;
  state.grid[index] = placedLevel;
  state.current = normalizeQueuedCard(state.next);
  state.turns += 1;
  state.movesLeft = Math.max(0, state.movesLeft - 1);
  state.lastPlaced = index;
  state.mergeCells = new Set([index]);
  state.upgradedCell = -1;
  state.effectMode = "place";

  if (placedLevel === TRASH) {
    state.lastChain = 0;
    addScore(-TRASH_PENALTY);
    const queued = queueRescueCard(CLEANUP);
    setReaction(queued ? "清掃車チャンス" : "おじゃま", queued ? "clean" : "bad");
    setMessage(`スコア -${formatNumber(TRASH_PENALTY)}。${queued ? "清掃車が近くに来ます。" : "通りの端に寄せて、清掃車で片づけよう。"}`, "ゴミ屋敷");
    finishTurn(false, 16, false);
    return;
  }
  if (placedLevel === CONSTRUCTION) {
    setConstructionProgress(index, 0);
    state.lastChain = 0;
    addScore(-CONSTRUCTION_PENALTY);
    const queued = queueRescueCard(CRANE);
    setReaction(queued ? "クレーンチャンス" : "工事中", queued ? "crane" : "bad");
    setMessage(`スコア -${formatNumber(CONSTRUCTION_PENALTY)}。6手後に近くへ広がります。工事ごとに2回まで。${queued ? "工務店のクレーンが近くに来ます。" : "クレーンで直そう。"}`, "工事中");
    finishTurn(false, 16, false);
    return;
  }
  if (placedLevel === PARK) {
    const bonus = PARK_BONUS + adjacentBuildingCount(index) * 35;
    state.lastChain = 0;
    addScore(bonus);
    setReaction(`公園 +${formatNumber(bonus)}`, "good");
    setMessage(`スコア +${formatNumber(bonus)}。屋台が来たら、周りの建物でさらににぎわいます。`, "公園");
    finishTurn(false, 10, false);
    return;
  }

  const result = resolveMerges(index);
  if (result.chain > 0) {
    const madeLandmark = result.highestCreatedLevel >= MAX_LEVEL;
    state.effectMode = madeLandmark ? "landmark" : "merge";
    state.lastChain = result.chain;
    state.bestChain = Math.max(state.bestChain, result.chain);
    if (madeLandmark) {
      state.landmarkCompletions += 1;
    }
    const multiplier = eventScoreMultiplier();
    const score = Math.round(result.score * multiplier);
    let extraMove = 0;
    if (state.activeEvent?.id === "festival") {
      extraMove = 1;
      state.movesLeft += extraMove;
    }
    addSplitScore(score, "building", result.redevelopmentBonus * multiplier);
    const growthText = result.chain > 1 ? `コンボ${result.chain}` : "合体";
    const eventText = multiplier !== 1 ? ` ${state.activeEvent.label}` : "";
    setReaction(madeLandmark ? "街の象徴完成!" : result.chain > 1 ? `コンボ ${result.chain}!` : `合体 +${formatNumber(score)}`, madeLandmark ? "epic" : "merge");
    setMessage(
      madeLandmark
        ? `ランドマーク完成。大型ボーナス +${formatNumber(score)}${extraMove ? "、手数+1" : ""}${eventText}`
        : `${growthText}成功。スコア +${formatNumber(score)}${extraMove ? "、手数+1" : ""}${eventText}`,
      madeLandmark ? "街の象徴" : "ナイス",
    );
    if (madeLandmark) {
      playLandmarkSound();
    }
  } else {
    state.lastChain = 0;
    const bonus = noMergeBonus();
    if (bonus > 0) {
      addScore(bonus);
      setReaction(`+${formatNumber(bonus)}`, "good");
      setMessage(`区画点検ボーナス +${formatNumber(bonus)}。次の3つそろえを作ろう。`, "区画点検");
    } else {
      setMessage("同じ建物の近くに置くと、次の合体につながります。", "まちメモ");
    }
  }

  finishTurn(result.chain > 0, result.chain > 0 ? 24 : 10, true);
}

function cleanTrash(index) {
  if (!state.grid[index]) {
    setMessage("清掃車はゴミ屋敷だけ片づけられます。", "清掃班");
    return;
  }
  if (state.grid[index] !== TRASH) {
    setMessage("このマスには使えません。ゴミ屋敷を選んでください。", "清掃班");
    return;
  }

  const pile = collectTrashPile(index);
  for (const cell of pile) {
    state.grid[cell] = null;
  }
  state.current = normalizeQueuedCard(state.next);
  state.turns += 1;
  state.movesLeft = Math.max(0, state.movesLeft - 1);
  state.lastPlaced = index;
  state.mergeCells = new Set(pile);
  state.upgradedCell = -1;
  state.effectMode = "clean";
  state.lastChain = 0;
  const bonus = CLEANUP_BONUS + Math.max(0, pile.length - 1) * CLEANUP_CHAIN_BONUS;
  addScore(bonus);
  setReaction(pile.length > 1 ? `まとめて清掃 +${formatNumber(bonus)}` : `清掃 +${formatNumber(bonus)}`, "clean");
  setMessage(`${pile.length > 1 ? `ゴミ屋敷を${pile.length}つまとめて片づけました。` : "ゴミ屋敷を片づけました。"}スコア +${formatNumber(bonus)}。`, "清掃班");
  finishTurn(false, 18, false);
}

function useRedevelopment(index) {
  if (state.grid[index] === TRASH || state.grid[index] === CONSTRUCTION) {
    setMessage("このマスには使えません。再開発は空き地・建物・公園に使えます。", "再開発");
    return;
  }
  if (redevelopmentLevel(index) >= 2) {
    setMessage("ここはもう再開発Lv2です。別のマスを選ぼう。", "再開発");
    return;
  }

  consumeSpecial(index);
  const level = upgradeRedevelopment(index);
  state.effectMode = "redevelop";
  state.lastChain = 0;
  const multiplier = redevelopmentMultiplier(index);
  setReaction(`再開発 Lv${level}`, level >= 2 ? "epic" : "crane");
  setMessage(`このマスの評価倍率が×${multiplier.toFixed(1)}になりました。`, "再開発");
  finishTurn(false, level >= 2 ? 24 : 18, false);
}

function upgradeRedevelopment(index) {
  const nextLevel = Math.min(2, redevelopmentLevel(index) + 1);
  state.redevelopmentLevels[index] = nextLevel;
  return nextLevel;
}

function useCrane(index) {
  if (state.grid[index] === CONSTRUCTION) {
    buildFromConstruction(index);
    return;
  }

  if (!isBuilding(state.grid[index])) {
    setMessage("このマスには使えません。工事中か、小屋・住宅を選んでください。", "クレーン");
    return;
  }
  if (state.grid[index] >= CRANE_MAX_UPGRADE_LEVEL) {
    setMessage("この建物には使えません", "クレーン");
    return;
  }
  upgradeBuilding(index);
}

function buildFromConstruction(index) {
  const newLevel = constructionUpgradeLevel(index);
  state.constructionAges.delete(index);
  state.grid[index] = newLevel;
  consumeSpecial(index);
  state.upgradedCell = index;
  addScore(CRANE_BONUS);
  const result = resolveMerges(index);
  if (result.chain > 0) {
    const madeLandmark = result.highestCreatedLevel >= MAX_LEVEL;
    state.effectMode = madeLandmark ? "landmark" : "merge";
    state.lastChain = result.chain;
    state.bestChain = Math.max(state.bestChain, result.chain);
    if (madeLandmark) {
      state.landmarkCompletions += 1;
    }
    addSplitScore(result.score, "building", result.redevelopmentBonus);
    setReaction(madeLandmark ? "街の象徴完成!" : "修理して合体!", madeLandmark ? "epic" : "merge");
    setMessage(
      madeLandmark
        ? `修理からランドマーク完成。スコア +${formatNumber(CRANE_BONUS + result.score)}。`
        : `${tileName(newLevel)}に直して、そのまま合体。スコア +${formatNumber(CRANE_BONUS + result.score)}。`,
      madeLandmark ? "街の象徴" : "クレーン",
    );
    if (madeLandmark) {
      playLandmarkSound();
    }
  } else {
    state.effectMode = "upgrade";
    state.lastChain = 0;
    setReaction("修理完了", "crane");
    setMessage(`${tileName(newLevel)}に直しました。スコア +${formatNumber(CRANE_BONUS)}。`, "クレーン");
  }
  finishTurn(result.chain > 0, 22, true);
}

function upgradeBuilding(index) {
  const newLevel = Math.min(CRANE_MAX_UPGRADE_LEVEL, state.grid[index] + 1);
  state.grid[index] = newLevel;
  consumeSpecial(index);
  state.upgradedCell = index;
  addScore(CRANE_BONUS);
  const result = resolveMerges(index);
  if (result.chain > 0) {
    const madeLandmark = result.highestCreatedLevel >= MAX_LEVEL;
    state.effectMode = madeLandmark ? "landmark" : "merge";
    state.lastChain = result.chain;
    state.bestChain = Math.max(state.bestChain, result.chain);
    if (madeLandmark) {
      state.landmarkCompletions += 1;
    }
    addSplitScore(result.score, "building", result.redevelopmentBonus);
    setReaction(madeLandmark ? "街の象徴完成!" : "増築して合体!", madeLandmark ? "epic" : "merge");
    setMessage(
      madeLandmark
        ? `増築からランドマーク完成。スコア +${formatNumber(CRANE_BONUS + result.score)}。`
        : `建物を大きくして、そのまま合体。スコア +${formatNumber(CRANE_BONUS + result.score)}。`,
      madeLandmark ? "街の象徴" : "クレーン",
    );
    if (madeLandmark) {
      playLandmarkSound();
    }
  } else {
    state.effectMode = "upgrade";
    state.lastChain = 0;
    setReaction("増築!", "crane");
    setMessage(`${tileName(newLevel)}に大きくしました。スコア +${formatNumber(CRANE_BONUS)}。`, "クレーン");
  }
  finishTurn(result.chain > 0, 22, true);
}

function useStall(index) {
  if (parkCount() > 0) {
    if (state.grid[index] !== PARK) {
      setMessage("屋台を出したい公園を選びます。周りの建物が立派なほどにぎわいます。", "屋台通り");
      return;
    }
    openStallAtPark(index);
    return;
  }

  if (state.grid[index]) {
    setMessage("公園を作るため、空き区画を選びます。", "屋台通り");
    return;
  }
  state.grid[index] = PARK;
  consumeSpecial(index);
  state.effectMode = "park";
  const bonus = PARK_BONUS + STALL_BASE_BONUS;
  addScore(PARK_BONUS);
  addScore(STALL_BASE_BONUS, "stall");
  state.stallBonusTotal += STALL_BASE_BONUS;
  state.lastChain = 0;
  setReaction(`公園 +${formatNumber(bonus)}`, "good");
  setMessage(`空き区画に公園を作って屋台を出しました。スコア +${formatNumber(bonus)}。`, "屋台通り");
  finishTurn(false, 16, false);
}

function openStallAtPark(index) {
  const value = stallBuildingValue(index);
  const baseValue = stallBuildingBaseValue(index);
  const bonus = STALL_BASE_BONUS + Math.round(value * STALL_VALUE_RATE);
  const baseBonus = STALL_BASE_BONUS + Math.round(baseValue * STALL_VALUE_RATE);
  state.grid[index] = null;
  consumeSpecial(index);
  state.effectMode = "stall";
  addSplitScore(bonus, "stall", bonus - baseBonus);
  state.stallBonusTotal += bonus;
  state.lastChain = 0;
  setReaction(`屋台ボーナス +${formatNumber(bonus)}`, "stall");
  setMessage(`屋台が大盛況。周りの建物の評価で、スコア +${formatNumber(bonus)}。`, "屋台通り");
  finishTurn(false, 20, false);
}

function consumeSpecial(index) {
  state.current = normalizeQueuedCard(state.next);
  state.turns += 1;
  state.movesLeft = Math.max(0, state.movesLeft - 1);
  state.lastPlaced = index;
  state.mergeCells = new Set([index]);
  state.upgradedCell = -1;
}

function finishTurn(didMerge, vibration, shouldCheckGoal) {
  if (shouldCheckGoal) {
    checkGoalBonus();
  }
  updateEventAfterMove(didMerge);
  spreadConstructionIfNeeded();
  advanceCardQueue();
  state.scoreDelta = state.score - state.scoreBeforeTurn;
  vibrate(vibration);
  render(true);
  scheduleEffectClear();

  if (!hasPlayableMove() || state.movesLeft <= 0) {
    window.setTimeout(endGame, 360);
  }
}

function advanceCardQueue() {
  state.next = normalizeQueuedCard(state.afterNext);
  state.afterNext = normalizeQueuedCard(drawLevel(), new Set(state.next < 0 ? [state.next] : []));
  if (state.next < 0 && state.afterNext === state.next) {
    state.afterNext = drawReplacementCard(new Set([state.next]));
  }
}

function queueRescueCard(card) {
  if (state.next === card || state.afterNext === card) {
    return false;
  }
  state.afterNext = card;
  return true;
}

function normalizeQueuedCard(card, excluded = new Set()) {
  if (
    (card === CLEANUP && trashCount() === 0)
    || (card === REDEVELOPMENT && !hasRedevelopmentMove())
    || excluded.has(card)
  ) {
    return drawReplacementCard(excluded);
  }
  return card;
}

function drawReplacementCard(excluded = new Set()) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const card = drawLevel();
    if (card === CLEANUP && trashCount() === 0) {
      continue;
    }
    if (card === REDEVELOPMENT && !hasRedevelopmentMove()) {
      continue;
    }
    if (excluded.has(card)) {
      continue;
    }
    return card;
  }
  return 1;
}

function hasPlayableMove() {
  if (state.current === CLEANUP) {
    return trashCount() > 0;
  }
  if (state.current === CRANE) {
    return constructionCount() > 0 || state.grid.some((level) => isBuilding(level) && level < CRANE_MAX_UPGRADE_LEVEL);
  }
  if (state.current === STALL) {
    return parkCount() > 0 || emptyLotIndexes().length > 0;
  }
  if (state.current === REDEVELOPMENT) {
    return hasRedevelopmentMove();
  }
  if (isBuilding(state.current)) {
    return buildingPlaceableIndexes().length > 0;
  }
  return emptyLotIndexes().length > 0;
}

function resolveMerges(startIndex) {
  let anchor = startIndex;
  let chain = 0;
  let gained = 0;
  let redevelopmentBonus = 0;
  let highestCreatedLevel = 0;
  const touched = new Set([startIndex]);

  while (true) {
    const level = state.grid[anchor];
    if (!isBuilding(level) || level >= MAX_LEVEL) {
      break;
    }

    const group = collectGroup(anchor, level);
    if (group.length < MERGE_SIZE) {
      break;
    }

    chain += 1;
    const nextLevel = level + 1;
    const extra = Math.max(0, group.length - MERGE_SIZE);
    const basePoints = LEVELS[nextLevel].score * (1 + (chain - 1) * 0.8 + extra * 0.35);
    const points = Math.round(basePoints * redevelopmentMultiplier(anchor));
    redevelopmentBonus += Math.max(0, points - Math.round(basePoints));

    for (const cell of group) {
      state.grid[cell] = null;
      touched.add(cell);
    }

    state.grid[anchor] = nextLevel;
    state.upgradedCell = anchor;
    touched.add(anchor);
    gained += points;
    highestCreatedLevel = Math.max(highestCreatedLevel, nextLevel);
  }

  state.mergeCells = touched;
  return { chain, score: gained, redevelopmentBonus, highestCreatedLevel };
}

function currentMission() {
  return MISSIONS[state.clearedMissions] || null;
}

function missionTargetLevel(mission = currentMission()) {
  return Math.min(MAX_LEVEL, Math.max(1, mission?.level || MAX_LEVEL));
}

function missionTargetMeta(mission = currentMission()) {
  if (mission?.mark) {
    return {
      mark: mission.mark,
      color: mission.color || LEVELS[missionTargetLevel(mission)].color,
      soft: mission.soft || LEVELS[missionTargetLevel(mission)].soft,
    };
  }
  return LEVELS[missionTargetLevel(mission)];
}

function missionBonus(mission) {
  return mission.bonus || LEVELS[missionTargetLevel(mission)].score;
}

function isMissionComplete(mission) {
  if (!mission) {
    return false;
  }
  if (mission.type === "reachLevel") {
    return maxLevel() >= mission.level;
  }
  if (mission.type === "countLevel") {
    return countBuildingsAtLeast(mission.level) >= mission.count;
  }
  if (mission.type === "chain") {
    return state.lastChain >= mission.count;
  }
  return false;
}

function missionClearText(mission) {
  if (mission?.epic) {
    return "やった、ランドマークが2つ並びました。";
  }
  return "掲示板のお願いを達成。";
}

function startEpicMissionEffect(mission) {
  const targetLevel = missionTargetLevel(mission);
  const cells = state.grid
    .map((level, index) => (isBuilding(level) && level >= targetLevel ? index : -1))
    .filter((index) => index >= 0);
  state.effectMode = "epic";
  state.mergeCells = new Set(cells);
  state.upgradedCell = -1;
}

function checkGoalBonus() {
  const mission = currentMission();
  if (!mission) {
    return;
  }
  if (!isMissionComplete(mission)) {
    return;
  }

  const bonus = missionBonus(mission);
  addScore(bonus);
  state.movesLeft += GOAL_MOVE_BONUS;
  state.clearedMissions += 1;
  state.targetLevel = missionTargetLevel(currentMission());
  const openedLots = unlockNextLots();
  const unlockText = openedLots > 0
    ? `新しい区画が${openedLots}マス開きました。`
    : state.unlockQueue.length > 0
      ? "次のミッションで区画が開きます。"
      : "";
  if (!state.activeEvent) {
    startEvent("festival");
  }
  const shouldKeepLandmarkMoment = state.effectMode === "landmark";
  if (mission.epic && !shouldKeepLandmarkMoment) {
    startEpicMissionEffect(mission);
  }
  if (!shouldKeepLandmarkMoment) {
    setReaction(mission.epic ? "ランドマーク2つ!" : openedLots > 0 ? "区画オープン!" : "掲示板クリア!", mission.epic ? "epic" : "mission");
    setMessage(`${missionClearText(mission)}${unlockText}手数+${GOAL_MOVE_BONUS}、スコア +${formatNumber(bonus)}。`, "まち掲示板");
  }
}

function render(force = false) {
  const max = maxLevel();
  const mission = currentMission();
  const target = missionTargetMeta(mission);

  dom.moves.textContent = state.movesLeft;
  dom.movesBar.style.transform = `scaleX(${Math.min(1, state.movesLeft / START_MOVES)})`;
  dom.score.textContent = formatNumber(state.score);
  dom.scoreDelta.textContent = formatScoreDelta(state.scoreDelta);
  dom.scoreDelta.classList.toggle("is-negative", state.scoreDelta < 0);
  dom.scoreCard.classList.toggle("is-score-pop", state.scoreDelta !== 0);
  dom.chain.textContent = state.lastChain;
  dom.best.textContent = formatNumber(Math.max(state.best, state.score));
  dom.empty.textContent = emptyCount();
  dom.boardStory.textContent = boardStoryLabel();
  dom.openedLots.textContent = `${unlockedLotCount()}/${CELL_COUNT}`;
  dom.unlockHint.textContent = unlockHintLabel();
  dom.targetMark.textContent = target.mark;
  dom.targetChip.style.setProperty("--target-color", target.color);
  dom.event.textContent = state.activeEvent
    ? `${state.activeEvent.name} あと${state.eventMovesLeft}手`
    : "まち静か";
  dom.event.classList.toggle("is-empty", !state.activeEvent);

  if (mission) {
    dom.goal.textContent = mission.title;
    dom.goalHint.textContent = missionGoalHint(mission);
  } else {
    dom.goal.textContent = "街の評判を伸ばそう";
    dom.goalHint.textContent = "ランドマークを増やすほど高スコア";
  }
  renderEvolutionRail(max);

  renderBoard(force);
  renderPreview();
}

function renderBoard(force = false) {
  const hint = bestPlacementHint(state.current);
  const cells = [];
  const isMergeEffect = ["merge", "landmark"].includes(state.effectMode) && state.mergeCells.size >= MERGE_SIZE;
  dom.board.classList.toggle("bursting", isMergeEffect);
  dom.board.classList.toggle("unlocking-lots", state.newlyUnlockedCells.size > 0);
  dom.board.classList.toggle("epic-mission", state.effectMode === "epic" || state.effectMode === "landmark");

  for (let index = 0; index < CELL_COUNT; index += 1) {
    const level = state.grid[index];
    const unlocked = isLotUnlocked(index);
    const redevelopLevel = redevelopmentLevel(index);
    const preview = unlocked ? previewPlacement(index, state.current) : null;
    const hintMode = index === hint.index ? hint.mode : "";
    const meta = level ? tileMeta(level) : tileMeta(state.current);
    const classes = ["tile"];
    const style = [`--tile-color: ${meta.color}`, `--tile-soft: ${meta.soft}`];

    if (!unlocked && !level) {
      classes.push("locked");
    } else if (level) {
      classes.push("filled", `level-${level}`);
      if (redevelopLevel > 0) {
        classes.push(`redevelop-lv${redevelopLevel}`);
      }
      if (!isBuilding(level)) {
        classes.push("special", "special-tile");
        if (level === TRASH) {
          classes.push("trash-tile");
        }
      }
      if (preview) {
        classes.push("targetable");
      }
      if (["clean", "crane", "upgrade", "stall"].includes(hintMode)) {
        classes.push("hint-ready", "clean-ready");
      }
    } else {
      classes.push("empty");
      if (redevelopLevel > 0) {
        classes.push(`redevelop-lv${redevelopLevel}`);
      }
      if (isTrashBlockedLot(index)) {
        classes.push("trash-zone");
      }
      if (preview) {
        classes.push("placeable");
      }
      if (state.current === REDEVELOPMENT && preview?.redevelop) {
        classes.push("redevelop-ready");
      }
      if (state.newlyUnlockedCells.has(index)) {
        classes.push("just-unlocked");
      }
      if (hintMode === "merge" && preview?.merge) {
        classes.push("hint-ready", "merge-ready");
      } else if (hintMode === "tidy") {
        classes.push("hint-ready", "clean-ready");
      } else if (hintMode === "park") {
        classes.push("hint-ready", "recommend-ready");
      } else if (hintMode === "redevelop") {
        classes.push("hint-ready");
      } else if (hintMode === "prep" || hintMode === "seed") {
        classes.push("hint-ready", "recommend-ready");
      }
    }

    if (state.lastPlaced === index) {
      classes.push("placed");
    }
    if (state.mergeCells.has(index)) {
      classes.push("effect-cell");
      if (state.effectMode) {
        classes.push(`effect-${state.effectMode}`);
      }
      if (isMergeEffect) {
        classes.push("merged");
      }
    }
    if (state.upgradedCell === index) {
      classes.push("upgraded");
    }

    cells.push(`
      <button
        class="${classes.join(" ")}"
        style="${style.join(";")}"
        type="button"
        data-index="${index}"
        aria-label="${escapeHtml(tileAriaLabel(index, level, unlocked, redevelopLevel))}"
      >
        ${renderTileInner(index, level, hintMode, unlocked, redevelopLevel)}
      </button>
    `);
  }

  if (force || dom.board.childElementCount !== CELL_COUNT) {
    dom.board.innerHTML = cells.join("") + renderBoardReaction();
    return;
  }
  dom.board.innerHTML = cells.join("") + renderBoardReaction();
}

function renderBoardReaction() {
  if (!state.reactionText) {
    return "";
  }
  return `<div class="board-reaction reaction-${state.reactionTone || "good"}" aria-hidden="true">${escapeHtml(state.reactionText)}</div>`;
}

function tileAriaLabel(index, level, unlocked, redevelopLevel) {
  if (level) {
    const base = tileName(level);
    return redevelopLevel > 0 && isBuilding(level)
      ? `${base}。再開発 Lv${redevelopLevel}。評価倍率 ×${redevelopmentMultiplier(index).toFixed(1)}`
      : base;
  }
  if (unlocked) {
    return redevelopLevel > 0
      ? `空き地。再開発 Lv${redevelopLevel}。評価倍率 ×${redevelopmentMultiplier(index).toFixed(1)}`
      : "空き地";
  }
  return "まだ使えない区画。ミッションで開きます";
}

function renderTileInner(index, level, hintMode, unlocked = true, redevelopLevel = 0) {
  if (!level && !unlocked) {
    return `
      <span class="locked-mark">＋</span>
      <span class="locked-label">未開放</span>
    `;
  }

  if (!level) {
    const badge = hintMode === "merge"
      ? "合体"
      : hintMode === "tidy"
        ? "整備"
        : hintMode === "redevelop"
          ? "再開発"
        : hintMode === "park"
          ? "公園"
        : hintMode === "prep" || hintMode === "seed"
        ? "おすすめ"
        : "";
    const hidesGhost = state.current === CLEANUP || state.current === CRANE || (state.current === STALL && parkCount() > 0);
    const ghost = hidesGhost ? "" : `<span class="ghost-mark">${tileMeta(state.current).mark}</span>`;
    return `
      ${renderTileBadges({ action: badge, redevelopLevel })}
      <span class="empty-label">${redevelopLevel > 0 ? "再開発済" : "空き地"}</span>
      ${ghost}
    `;
  }

  const meta = tileMeta(level);
  const badgeText = {
    clean: "清掃",
    crane: "直す",
    upgrade: "増築",
    stall: "屋台",
    redevelop: "再開発",
  }[hintMode] || "";
  const timer = level === CONSTRUCTION ? constructionTurnsLeft(index) : 0;
  return `
    ${renderTileBadges({ action: badgeText, redevelopLevel, timer })}
    <span class="tile-art" aria-hidden="true"><b>${meta.mark}</b></span>
    <span class="tile-label">${meta.name}</span>
  `;
}

function renderTileBadges({ action = "", redevelopLevel = 0, timer = 0 } = {}) {
  const badges = [];
  if (action) {
    badges.push(`<span class="merge-badge">${escapeHtml(action)}</span>`);
  }
  if (redevelopLevel > 0) {
    badges.push(`<span class="redevelop-badge">Lv${redevelopLevel}</span>`);
  }
  if (timer > 0) {
    badges.push(`<span class="construction-timer" aria-hidden="true">${timer}</span>`);
  }
  return badges.length ? `<span class="tile-badges" aria-hidden="true">${badges.join("")}</span>` : "";
}

function renderPreview() {
  const current = tileMeta(state.current);
  const currentClass = state.current < 0 ? " special-card" : "";
  dom.hand.innerHTML = `
    <button
      class="card selected${currentClass}"
      style="--tile-color: ${current.color}; --tile-soft: ${current.soft}"
      type="button"
      aria-label="${tileName(state.current)}"
      disabled
    >
      <span class="card-kicker">${currentCardLabel()}</span>
      <span class="card-art" aria-hidden="true"><b>${current.mark}</b></span>
      <span class="card-name">${current.name}</span>
    </button>
    <div class="next-stack" aria-label="次のカード">
      ${renderNextToken(state.next, "next", "次")}
      ${renderNextToken(state.afterNext, "2nd", "次の次")}
    </div>
  `;
}

function renderNextToken(level, label, ariaLabel = label) {
  const meta = tileMeta(level);
  const cardClass = level < 0 ? " special-card" : "";
  return `
    <span
      class="next-token${cardClass}"
      style="--tile-color: ${meta.color}; --tile-soft: ${meta.soft}"
      aria-label="${ariaLabel}: ${tileName(level)}"
      title="${ariaLabel}: ${tileName(level)}"
    >
      <em>${label}</em>
      <i>${meta.mark}</i>
    </span>
  `;
}

function currentCardLabel() {
  return "now";
}

function renderEvolutionRail(max) {
  const targetLevel = missionTargetLevel();
  dom.evolution.innerHTML = LEVELS.slice(1).map((meta, offset) => {
    const level = offset + 1;
    const classes = ["evolution-step"];
    if (level <= max) {
      classes.push("done");
    }
    if (level === state.current) {
      classes.push("current");
    }
    if (level === targetLevel) {
      classes.push("target");
    }
    return `
      <span
        class="${classes.join(" ")}"
        style="--step-color: ${meta.color}; --step-soft: ${meta.soft}"
        aria-label="${tileName(level)}"
      >
        <b>${meta.mark}</b>
        <i>${meta.name}</i>
      </span>
    `;
  }).join("");
}

function previewPlacement(index, level) {
  if (!isLotUnlocked(index)) {
    return null;
  }
  if (level === CLEANUP) {
    if (state.grid[index] === TRASH) {
      return { merge: false, groupSize: 1, clean: true };
    }
    return null;
  }
  if (level === CRANE) {
    if (state.grid[index] === CONSTRUCTION) {
      return { merge: false, groupSize: 1, crane: true };
    }
    return isBuilding(state.grid[index]) && state.grid[index] < CRANE_MAX_UPGRADE_LEVEL
      ? { merge: false, groupSize: 1, upgrade: true }
      : null;
  }
  if (level === STALL) {
    if (parkCount() > 0) {
      return state.grid[index] === PARK ? { merge: false, groupSize: 1, stall: true } : null;
    }
    return state.grid[index] ? null : { merge: false, groupSize: 0, park: true };
  }
  if (level === REDEVELOPMENT) {
    if (state.grid[index] === TRASH || state.grid[index] === CONSTRUCTION || redevelopmentLevel(index) >= 2) {
      return null;
    }
    return { merge: false, groupSize: 0, redevelop: true, nextRedevelopmentLevel: redevelopmentLevel(index) + 1 };
  }
  if (state.grid[index]) {
    return null;
  }
  if (level === TRASH || level === CONSTRUCTION) {
    return { merge: false, groupSize: 0, bad: true };
  }
  if (level === PARK) {
    return { merge: false, groupSize: 0, park: true };
  }
  if (!isBuilding(level)) {
    return null;
  }
  if (isTrashBlockedLot(index)) {
    return null;
  }
  const group = collectVirtualGroup(index, level);
  return {
    merge: group.length >= MERGE_SIZE,
    groupSize: group.length,
  };
}

function bestPlacementHint(level) {
  if (isBadTile(level)) {
    return { index: -1, mode: "", value: -Infinity };
  }

  const candidates = [];
  const centerRow = (BOARD_ROWS - 1) / 2;
  const centerCol = (BOARD_COLUMNS - 1) / 2;

  for (let index = 0; index < CELL_COUNT; index += 1) {
    const preview = previewPlacement(index, level);
    if (!preview) {
      continue;
    }

    const row = Math.floor(index / BOARD_COLUMNS);
    const col = index % BOARD_COLUMNS;
    const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
    const mode = placementMode(preview);
    const value = scorePlacement(index, level, preview, mode, distance);
    candidates.push({ index, mode, value });
  }

  if (candidates.length === 0) {
    return { index: -1, mode: "", value: -Infinity };
  }

  candidates.sort((a, b) => b.value - a.value);
  const bestValue = candidates[0].value;
  const closeEnough = candidates
    .filter((candidate, order) => order < 4 && bestValue - candidate.value <= recommendationSpread(candidate.mode));
  const pick = Math.floor(seededRatio(`${state.seed}:${state.turns}:${level}:${state.next}:${emptyCount()}`) * closeEnough.length);

  return closeEnough[pick] || candidates[0];
}

function placementMode(preview) {
  if (preview.clean) {
    return "clean";
  }
  if (preview.tidy) {
    return "tidy";
  }
  if (preview.crane) {
    return "crane";
  }
  if (preview.upgrade) {
    return "upgrade";
  }
  if (preview.stall) {
    return "stall";
  }
  if (preview.park) {
    return "park";
  }
  if (preview.redevelop) {
    return "redevelop";
  }
  if (preview.bad) {
    return "bad";
  }
  if (preview.groupSize >= MERGE_SIZE) {
    return "merge";
  }
  if (preview.groupSize === 2) {
    return "prep";
  }
  return "seed";
}

function scorePlacement(index, level, preview, mode, distance) {
  const row = Math.floor(index / BOARD_COLUMNS);
  const col = index % BOARD_COLUMNS;
  const edge = Number(row === 0 || row === BOARD_ROWS - 1) + Number(col === 0 || col === BOARD_COLUMNS - 1);
  const emptyNeighbors = neighbors(index).filter((cell) => isLotUnlocked(cell) && !state.grid[cell]).length;
  const occupiedNeighbors = neighbors(index).filter((cell) => state.grid[cell]).length;
  const jitter = seededRatio(`${state.seed}:hint:${state.turns}:${level}:${index}`) * 22;

  if (mode === "clean") {
    return 5200 + occupiedNeighbors * 44 - distance * 18 + jitter;
  }
  if (mode === "tidy") {
    return 3600 + emptyNeighbors * 55 - distance * 16 + edge * 18 + jitter;
  }
  if (mode === "crane") {
    return 4600 + constructionUpgradeLevel(index) * 210 + occupiedNeighbors * 52 - distance * 12 + jitter;
  }
  if (mode === "upgrade") {
    return 3900 + state.grid[index] * 170 + occupiedNeighbors * 44 - distance * 14 + jitter;
  }
  if (mode === "stall") {
    return 3800 + adjacentBuildingCount(index) * 260 - distance * 10 + jitter;
  }
  if (mode === "park") {
    return 2100 + occupiedNeighbors * 130 + emptyNeighbors * 38 - distance * 12 + jitter;
  }
  if (mode === "redevelop") {
    const levelBonus = preview.nextRedevelopmentLevel >= 2 ? 980 : 380;
    const buildingBonus = isBuilding(state.grid[index]) ? state.grid[index] * 180 : 0;
    return 3550 + levelBonus + buildingBonus + edge * 22 + emptyNeighbors * 24 - distance * 12 + jitter;
  }
  if (mode === "bad") {
    return 2600 + distance * 62 + edge * 120 - occupiedNeighbors * 35 + jitter;
  }
  if (mode === "merge") {
    const nextLevel = Math.min(MAX_LEVEL, level + 1);
    const goalBonus = nextLevel >= missionTargetLevel() ? 460 : 0;
    return 4300 + nextLevel * 180 + preview.groupSize * 90 + goalBonus - distance * 12 + jitter;
  }
  if (mode === "prep") {
    return 2750 + emptyNeighbors * 90 - distance * 18 + level * 48 + jitter;
  }
  return 1400 + emptyNeighbors * 96 - distance * 22 + level * 36 + jitter;
}

function recommendationSpread(mode) {
  if (["clean", "tidy", "crane", "upgrade", "stall", "redevelop", "merge"].includes(mode)) {
    return 95;
  }
  if (mode === "bad") {
    return 150;
  }
  return 180;
}

function collectGroup(start, level) {
  if (!isBuilding(level)) {
    return [];
  }
  return collectMatching(start, (index) => state.grid[index] === level);
}

function collectTrashPile(start) {
  return collectMatching(start, (index) => state.grid[index] === TRASH);
}

function collectVirtualGroup(start, level) {
  if (!isBuilding(level)) {
    return [];
  }
  return collectMatching(start, (index) => index === start || state.grid[index] === level);
}

function collectMatching(start, matches) {
  const seen = new Set([start]);
  const stack = [start];
  const group = [];

  while (stack.length > 0) {
    const index = stack.pop();
    if (!matches(index)) {
      continue;
    }
    group.push(index);
    for (const next of neighbors(index)) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }

  return group;
}

function neighbors(index) {
  const row = Math.floor(index / BOARD_COLUMNS);
  const col = index % BOARD_COLUMNS;
  const cells = [];
  if (row > 0) {
    cells.push(indexFor(row - 1, col));
  }
  if (row < BOARD_ROWS - 1) {
    cells.push(indexFor(row + 1, col));
  }
  if (col > 0) {
    cells.push(indexFor(row, col - 1));
  }
  if (col < BOARD_COLUMNS - 1) {
    cells.push(indexFor(row, col + 1));
  }
  return cells;
}

function surroundingCells(index) {
  const row = Math.floor(index / BOARD_COLUMNS);
  const col = index % BOARD_COLUMNS;
  const cells = [];
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) {
        continue;
      }
      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;
      if (nextRow >= 0 && nextRow < BOARD_ROWS && nextCol >= 0 && nextCol < BOARD_COLUMNS) {
        cells.push(indexFor(nextRow, nextCol));
      }
    }
  }
  return cells;
}

function adjacentBuildingCount(index) {
  return neighbors(index).filter((cell) => isBuilding(state.grid[cell])).length;
}

function stallBuildingValue(index) {
  return neighbors(index).reduce((sum, cell) => {
    const level = state.grid[cell];
    return isBuilding(level) ? sum + LEVELS[level].score * redevelopmentMultiplier(cell) : sum;
  }, 0);
}

function stallBuildingBaseValue(index) {
  return neighbors(index).reduce((sum, cell) => {
    const level = state.grid[cell];
    return isBuilding(level) ? sum + LEVELS[level].score : sum;
  }, 0);
}

function constructionUpgradeLevel(index) {
  const bestNeighbor = neighbors(index).reduce((best, cell) => {
    const level = state.grid[cell];
    return isBuilding(level) ? Math.max(best, level) : best;
  }, 0);
  return Math.min(CRANE_MAX_UPGRADE_LEVEL, Math.max(1, bestNeighbor + 1));
}

function indexFor(row, col) {
  return row * BOARD_COLUMNS + col;
}

function emptyCount() {
  return buildingPlaceableIndexes().length;
}

function emptyLotIndexes() {
  return state.grid
    .map((tile, index) => (!tile && isLotUnlocked(index) ? index : -1))
    .filter((index) => index >= 0);
}

function buildingPlaceableIndexes() {
  return emptyLotIndexes().filter((index) => !isTrashBlockedLot(index));
}

function maxLevel() {
  return state.grid.reduce((max, level) => Math.max(max, isBuilding(level) ? level : 0), 0);
}

function trashCount() {
  return state.grid.filter((tile) => tile === TRASH).length;
}

function constructionCount() {
  return state.grid.filter((tile) => tile === CONSTRUCTION).length;
}

function constructionTurnsLeft(index) {
  const progress = constructionProgress(index);
  if (!progress || progress.spreadCount >= CONSTRUCTION_SPREAD_LIMIT) {
    return 0;
  }
  return Math.max(1, CONSTRUCTION_SPREAD_INTERVAL - (state.turns - progress.turn));
}

function parkCount() {
  return state.grid.filter((tile) => tile === PARK).length;
}

function redevelopmentLevel(index) {
  return state.redevelopmentLevels[index] || 0;
}

function redevelopmentMultiplier(index) {
  return REDEVELOPMENT_LEVELS[redevelopmentLevel(index)] || 1;
}

function redevelopmentLv2Count() {
  return state.redevelopmentLevels.filter((level) => level >= 2).length;
}

function isTrashBlockedLot(index) {
  if (!isLotUnlocked(index) || state.grid[index]) {
    return false;
  }
  return surroundingCells(index).some((cell) => state.grid[cell] === TRASH);
}

function countBuildingsAtLeast(level) {
  return state.grid.filter((tile) => isBuilding(tile) && tile >= level).length;
}

function unlockNextLots() {
  if (state.clearedMissions < UNLOCK_START_MISSION || state.unlockQueue.length === 0) {
    state.newlyUnlockedCells = new Set();
    return 0;
  }

  const opened = state.unlockQueue.splice(0, LOTS_PER_UNLOCK);
  for (const index of opened) {
    state.unlockedLots.add(index);
  }
  state.newlyUnlockedCells = new Set(opened);
  return opened.length;
}

function spreadConstructionIfNeeded() {
  syncConstructionAges();
  if (state.constructionAges.size === 0) {
    return false;
  }

  const eligible = [...state.constructionAges.keys()]
    .map((index) => [index, constructionProgress(index)])
    .filter(
      ([index, progress]) =>
        progress
        && state.grid[index] === CONSTRUCTION
        && progress.spreadCount < CONSTRUCTION_SPREAD_LIMIT
        && state.turns - progress.turn >= CONSTRUCTION_SPREAD_INTERVAL,
    )
    .sort(([, aProgress], [, bProgress]) => aProgress.turn - bProgress.turn);
  if (eligible.length === 0) {
    return false;
  }

  const touched = new Set();
  let spreadCount = 0;

  for (const [source, progress] of eligible) {
    if (state.grid[source] !== CONSTRUCTION) {
      continue;
    }

    const target = constructionSpreadTarget(source);
    if (target < 0) {
      setConstructionProgress(source, progress.spreadCount);
      continue;
    }

    const nextSpreadCount = progress.spreadCount + 1;
    state.grid[target] = CONSTRUCTION;
    state.constructionAges.delete(source);
    setConstructionProgress(target, nextSpreadCount);
    touched.add(source);
    touched.add(target);
    spreadCount += 1;
  }

  if (spreadCount === 0) {
    return false;
  }

  state.mergeCells = touched;
  state.upgradedCell = -1;
  state.effectMode = "construction";
  state.lastChain = 0;
  queueRescueCard(CRANE);
  setReaction(spreadCount > 1 ? `工事中 ${spreadCount}か所` : "工事中が広がった", "bad");
  setMessage(
    spreadCount > 1
      ? `工事中が${spreadCount}か所に広がりました。それぞれ6手ごとに進み、2回で止まります。`
      : "工事中が近くの空き地に広がりました。6手ごとに進み、2回で止まります。",
    "工事中",
  );
  return true;
}

function syncConstructionAges() {
  for (const index of [...state.constructionAges.keys()]) {
    if (state.grid[index] !== CONSTRUCTION) {
      state.constructionAges.delete(index);
    }
  }
}

function setConstructionProgress(index, spreadCount) {
  if (spreadCount >= CONSTRUCTION_SPREAD_LIMIT) {
    state.constructionAges.delete(index);
    return;
  }
  state.constructionAges.set(index, { turn: state.turns, spreadCount });
}

function constructionProgress(index) {
  const progress = state.constructionAges.get(index);
  if (typeof progress === "number" && Number.isFinite(progress)) {
    return { turn: progress, spreadCount: 0 };
  }
  if (
    progress
    && typeof progress === "object"
    && Number.isFinite(progress.turn)
    && Number.isInteger(progress.spreadCount)
  ) {
    return {
      turn: progress.turn,
      spreadCount: Math.min(CONSTRUCTION_SPREAD_LIMIT, Math.max(0, progress.spreadCount)),
    };
  }
  return null;
}

function constructionSpreadTarget(source) {
  const adjacent = neighbors(source).filter((index) => canSpreadConstructionTo(index));
  if (adjacent.length > 0) {
    return adjacent[Math.floor(state.rng() * adjacent.length)];
  }
  const empty = emptyLotIndexes().filter((index) => canSpreadConstructionTo(index));
  if (empty.length === 0) {
    return -1;
  }
  return empty[Math.floor(state.rng() * empty.length)];
}

function canSpreadConstructionTo(index) {
  return isLotUnlocked(index) && !state.grid[index] && redevelopmentLevel(index) === 0;
}

function hasRedevelopmentMove() {
  return redevelopmentCandidateIndexes().length > 0;
}

function redevelopmentCandidateIndexes() {
  return [...state.unlockedLots].filter((index) => canUseRedevelopment(index));
}

function canUseRedevelopment(index) {
  if (!isLotUnlocked(index)) {
    return false;
  }
  if (state.grid[index] === TRASH || state.grid[index] === CONSTRUCTION) {
    return false;
  }
  return redevelopmentLevel(index) < 2;
}

function unlockedLotCount() {
  return state.unlockedLots.size;
}

function coreLotIndexes() {
  const indexes = [];
  for (let index = 0; index < CELL_COUNT; index += 1) {
    if (isCoreLot(index)) {
      indexes.push(index);
    }
  }
  return indexes;
}

function createUnlockQueue() {
  const indexes = [];
  for (let index = 0; index < CELL_COUNT; index += 1) {
    if (!isCoreLot(index)) {
      indexes.push(index);
    }
  }

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(secureRandom() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  return indexes;
}

function isCoreLot(index) {
  const row = Math.floor(index / BOARD_COLUMNS);
  const col = index % BOARD_COLUMNS;
  return row >= 1 && row <= 5 && col >= 1 && col <= 5;
}

function isLotUnlocked(index) {
  return state.unlockedLots.has(index);
}

function missionGoalHint(mission = currentMission()) {
  if (!mission) {
    return "大きい建物ほど高スコア";
  }
  const progress = missionProgressText(mission);
  const reward = missionRewardHint();
  return progress ? `${progress}・${reward}` : reward;
}

function missionProgressText(mission) {
  if (mission.type === "reachLevel") {
    return `${tileName(maxLevel())} / ${tileName(mission.level)}`;
  }
  if (mission.type === "countLevel") {
    return `${countBuildingsAtLeast(mission.level)}/${mission.count}`;
  }
  if (mission.type === "chain") {
    return `${mission.count}コンボで達成`;
  }
  return "";
}

function missionRewardHint() {
  if (state.unlockQueue.length > 0 && state.clearedMissions + 1 >= UNLOCK_START_MISSION) {
    return `達成で区画+${Math.min(LOTS_PER_UNLOCK, state.unlockQueue.length)}・手数+${GOAL_MOVE_BONUS}`;
  }
  return `達成で手数+${GOAL_MOVE_BONUS}`;
}

function boardStoryLabel() {
  if (state.unlockQueue.length === 0) {
    return "全部の区画が使えます";
  }
  if (state.clearedMissions < UNLOCK_START_MISSION) {
    return "中央区画からスタート";
  }
  return "外側の区画も開発中";
}

function unlockHintLabel() {
  if (state.unlockQueue.length === 0) {
    return "全開放";
  }
  const missionsUntilUnlock = UNLOCK_START_MISSION - state.clearedMissions;
  if (missionsUntilUnlock > 0) {
    return `あと${missionsUntilUnlock}回`;
  }
  return `次は+${Math.min(LOTS_PER_UNLOCK, state.unlockQueue.length)}`;
}

function tileName(level) {
  return tileMeta(level)?.name || "なし";
}

function tileMeta(level) {
  return SPECIALS[level] || LEVELS[level] || LEVELS[1];
}

function isBuilding(level) {
  return Number.isInteger(level) && level > 0;
}

function isBadTile(level) {
  return level === TRASH || level === CONSTRUCTION;
}

function setHint(title, message) {
  dom.dockTitle.textContent = title;
  dom.dockMessage.textContent = message;
}

function setMessage(message, title = "結果") {
  setHint(title, message);
}

function setReaction(text, tone = "good") {
  state.reactionText = text;
  state.reactionTone = tone;
}

function addScore(amount, part = "other") {
  state.score += amount;
  state.scoreParts[part] = (state.scoreParts[part] || 0) + amount;
}

function addSplitScore(total, primaryPart, redevelopmentBonus = 0) {
  const safeRedevelopmentBonus = Math.max(0, Math.min(total, Math.round(redevelopmentBonus)));
  addScore(total - safeRedevelopmentBonus, primaryPart);
  if (safeRedevelopmentBonus > 0) {
    addScore(safeRedevelopmentBonus, "redevelopment");
  }
}

function updatePlacementMessage() {
  if (state.current === CLEANUP) {
    const hasTrash = trashCount() > 0;
    if (hasTrash) {
      setHint("清掃班", `ゴミ屋敷を片づけます。周り8マスの置けない場所も使えるようになります。`);
      return;
    }
    setHint("清掃班", "今は片づけるゴミ屋敷がありません。次のカードを待とう。");
    return;
  }
  if (state.current === REDEVELOPMENT) {
    const canImprove = redevelopmentCandidateIndexes().length > 0;
    if (canImprove) {
      setHint("再開発", "空き地や建物の評価倍率を上げます。Lv1は×1.2、Lv2は×1.5。");
      return;
    }
    setHint("再開発", "強化できるマスがありません。");
    return;
  }
  if (state.current === CRANE) {
    if (constructionCount() > 0) {
      setHint("工務店", "工事中を直せます。小屋・住宅なら1つ大きくできます。");
      return;
    }
    setHint("工務店", "小屋を住宅に、住宅を商店にできます。商店以上には使えません。");
    return;
  }
  if (state.current === STALL) {
    if (parkCount() > 0) {
      setHint("屋台通り", "公園に出すと屋台ボーナス。周りの建物が立派な公園ほどにぎわいます。");
      return;
    }
    setHint("屋台通り", "公園がない時は、空き区画に公園を作れます。次の屋台で稼ぐ準備になります。");
    return;
  }
  if (state.current === TRASH) {
    setHint("困った区画", `置くとスコア -${formatNumber(TRASH_PENALTY)}。周り8マスに建物を置けなくなるので、端に寄せよう。`);
    return;
  }
  if (state.current === CONSTRUCTION) {
    setHint("工事中", `置くとスコア -${formatNumber(CONSTRUCTION_PENALTY)}。6手ごとに近くへ広がります。工事ごとに2回で止まります。`);
    return;
  }
  if (state.current === PARK) {
    setHint("公園づくり", "建物の近くに置くほど、屋台が来た時に街がにぎわいます。");
    return;
  }
  const hint = bestPlacementHint(state.current);
  if (hint.mode === "merge") {
    if (state.turns === 0) {
      setHint("区画メモ", `光るマスに置くと、すぐ${tileName(Math.min(state.current + 1, MAX_LEVEL))}に合体します。`);
      return;
    }
    setHint("区画メモ", `光る空き区画で3つそろうと${tileName(Math.min(state.current + 1, MAX_LEVEL))}に合体。迷ったら光る場所でOK。`);
    return;
  }
  if (hint.mode === "prep") {
    setHint("区画メモ", "同じ建物の隣に置いて、次のカードで3つそろう形を作ろう。");
    return;
  }
  setHint("区画メモ", `${tileName(state.current)}は空き区画に置けます。同じ建物の近くに置くと、あとで合体しやすいです。`);
}

function updateEventAfterMove(didMerge) {
  if (state.activeEvent) {
    state.eventMovesLeft -= 1;
    if (state.eventMovesLeft <= 0) {
      state.activeEvent = null;
      state.eventMovesLeft = 0;
    }
    return;
  }

  if (state.turns < 5) {
    return;
  }

  const isScheduledTurn = state.turns % 6 === 0;
  const chance = didMerge ? 0.38 : 0.18;
  if (!isScheduledTurn && state.rng() > chance) {
    return;
  }
  let options = trashCount() > 0 ? EVENTS : EVENTS.filter((event) => event.id !== "cleanup");
  options = options.filter((event) => event.id !== state.lastEventId);
  if (options.length === 0) {
    options = EVENTS;
  }
  const event = options[Math.floor(state.rng() * options.length)];
  startEvent(event.id);
}

function startEvent(eventId) {
  const event = EVENTS.find((item) => item.id === eventId) || EVENTS[0];
  state.activeEvent = event;
  state.eventMovesLeft = event.moves;
  state.lastEventId = event.id;
  setMessage(event.label, event.name);
}

function eventScoreMultiplier() {
  if (state.activeEvent?.id === "boom") {
    return 1.5;
  }
  if (state.activeEvent?.id === "market") {
    return 1.25;
  }
  if (state.activeEvent?.id === "shortage") {
    return 0.8;
  }
  return 1;
}

function noMergeBonus() {
  return state.activeEvent?.id === "lotBonus" ? LOT_BONUS : 0;
}

function scheduleEffectClear(duration = DEFAULT_EFFECT_DURATION) {
  window.clearTimeout(state.effectTimer);
  const effectDuration = state.newlyUnlockedCells.size > 0
    ? Math.max(duration, UNLOCK_EFFECT_DURATION)
    : ["epic", "landmark"].includes(state.effectMode)
      ? Math.max(duration, EPIC_EFFECT_DURATION)
      : duration;
  state.effectTimer = window.setTimeout(() => clearMergeEffects(), effectDuration);
}

function clearMergeEffects(shouldRender = true) {
  window.clearTimeout(state.effectTimer);
  state.effectTimer = 0;
  state.lastPlaced = -1;
  state.mergeCells = new Set();
  state.upgradedCell = -1;
  state.effectMode = "";
  state.newlyUnlockedCells = new Set();
  state.reactionText = "";
  state.reactionTone = "";
  state.scoreDelta = 0;
  if (shouldRender) {
    if (state.running && !state.ended) {
      updatePlacementMessage();
    }
    render(true);
  }
}

function createScoreRecord() {
  return {
    randomName: state.playerName || generateRandomPlayerName(secureRandom),
    score: sanitizeInteger(state.score, 0, MAX_RANKING_SCORE),
    maxLevel: sanitizeInteger(maxLevel(), 1, MAX_LEVEL),
    maxChain: sanitizeInteger(state.bestChain, 0, 99),
    turns: sanitizeInteger(state.turns, 0, 999),
    createdAt: new Date().toISOString(),
  };
}

async function loadRankings() {
  rankingRecords = [];
  rankingStatusText = RANKING_API_URL ? "確認中" : "";
  renderRankings();

  if (!RANKING_API_URL) {
    return;
  }

  try {
    const response = await fetch(RANKING_API_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`ranking_get_${response.status}`);
    }
    const payload = await response.json();
    rankingRecords = sanitizeRankingRecords(payload.ranking ?? payload.overall ?? payload.today ?? []);
    rankingStatusText = "記録所";
  } catch {
    rankingRecords = [];
    rankingStatusText = "";
  }

  renderRankings();
}

async function submitRankingRecord(record) {
  if (!RANKING_API_URL) {
    rankingRecords = [];
    rankingStatusText = "";
    renderRankings();
    return;
  }

  try {
    const response = await fetch(RANKING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error(`ranking_post_${response.status}`);
    }
    const payload = await response.json();
    const savedRecord = sanitizeRankingRecord(payload.record) || sanitizeRankingRecord(record);
    if (savedRecord) {
      state.latestRecord = savedRecord;
      latestResultCreatedAt = savedRecord.createdAt;
    }
    rankingRecords = sanitizeRankingRecords(payload.ranking ?? payload.overall ?? []);
    rankingStatusText = "記録所";
  } catch {
    rankingRecords = [];
    rankingStatusText = "";
  }

  renderRankings();
}

function renderRankings() {
  const records = sortRankingRecords(rankingRecords).slice(0, RANKING_LIMIT);
  const markup = records.length ? renderRankingRows(records) : `<li class="ranking-empty">まだ街の記録がありません</li>`;

  dom.overallRankingList.innerHTML = markup;
  dom.resultRankingList.innerHTML = markup;
  dom.rankingStatus.textContent = rankingStatusText;
  dom.resultRankingStatus.textContent = rankingStatusText;
  dom.resultRank.textContent = getRankLabel(state.latestRecord);
  if (state.latestRecord) {
    dom.resultPlayerName.textContent = state.latestRecord.randomName;
  }
}

function renderRankingRows(records) {
  return records
    .map((record, index) => {
      const isCurrent = record.createdAt === latestResultCreatedAt;
      const podiumClass = index < 3 ? `is-podium is-podium-${index + 1}` : "";
      const crown = index < 3 ? `<b class="rank-crown" aria-hidden="true">♛</b>` : "";
      return `
        <li class="ranking-row ${podiumClass} ${isCurrent ? "is-current" : ""}">
          <span class="rank-index">${crown}<em>${index + 1}</em></span>
          <span class="rank-copy">
            <span class="rank-name">${escapeHtml(record.randomName)}</span>
            <span class="rank-meta">${isCurrent ? "今回 / " : ""}${tileName(record.maxLevel)} / ${record.maxChain}コンボ / ${record.turns}手</span>
          </span>
          <span class="rank-score">${formatNumber(record.score)}</span>
        </li>
      `;
    })
    .join("");
}

function getRankLabel(record) {
  if (!record) {
    return "確認中";
  }
  if (record.rank) {
    return `${record.rank}位`;
  }

  const sorted = sortRankingRecords(rankingRecords);
  const foundIndex = sorted.findIndex((item) => item.createdAt === record.createdAt);
  if (foundIndex >= 0) {
    return `${foundIndex + 1}位`;
  }

  return "確認中";
}

function sortRankingRecords(records) {
  return [...records].sort((a, b) => b.score - a.score || Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

function sanitizeRankingRecords(records) {
  return Array.isArray(records)
    ? sortRankingRecords(records.map(sanitizeRankingRecord).filter(Boolean))
    : [];
}

function sanitizeRankingRecord(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const randomName =
    typeof record.randomName === "string" && /^[ぁ-んァ-ン一-龥々ー]{2,16}$/.test(record.randomName)
      ? record.randomName
      : null;
  const createdAt = typeof record.createdAt === "string" && !Number.isNaN(Date.parse(record.createdAt)) ? record.createdAt : null;
  if (!randomName || !createdAt) {
    return null;
  }

  return {
    randomName,
    score: sanitizeInteger(record.score, 0, MAX_RANKING_SCORE),
    maxLevel: sanitizeInteger(record.maxLevel, 1, MAX_LEVEL),
    maxChain: sanitizeInteger(record.maxChain, 0, 99),
    turns: sanitizeInteger(record.turns, 0, 999),
    createdAt,
    rank: record.rank == null ? null : sanitizeInteger(record.rank, 1, 999999),
  };
}

function sanitizeInteger(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return min;
  }
  return Math.min(max, Math.max(min, Math.round(number)));
}

function generateRandomPlayerName(randomSource) {
  return `${pickRandomNamePart(PLAYER_NAME_ADJECTIVES, randomSource)}${pickRandomNamePart(PLAYER_NAME_NOUNS, randomSource)}`;
}

function pickRandomNamePart(items, randomSource) {
  return items[Math.floor(randomSource() * items.length)];
}

function secureRandom() {
  const browserCrypto = globalThis.crypto;
  if (browserCrypto?.getRandomValues) {
    const values = new Uint32Array(1);
    browserCrypto.getRandomValues(values);
    return values[0] / 4294967296;
  }
  return Math.random();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function endGame() {
  if (state.ended) {
    return;
  }
  const previousBest = state.best;
  state.running = false;
  state.ended = true;
  state.isNewRecord = state.score > previousBest;
  if (state.score > state.best) {
    state.best = state.score;
    writeBest(state.score);
  }
  const grade = GRADE_LINES.find((line) => state.score >= line.min) || GRADE_LINES.at(-1);
  const record = createScoreRecord();
  state.latestRecord = record;
  latestResultCreatedAt = record.createdAt;

  dom.grade.textContent = grade.grade;
  dom.resultTitle.textContent = "まちの記録";
  dom.resultCityTitle.textContent = cityPersonalityTitle();
  dom.resultPlayerName.textContent = record.randomName;
  dom.finalScore.textContent = formatNumber(state.score);
  dom.resultMessage.classList.toggle("is-new-record", state.isNewRecord);
  dom.resultMessage.textContent = state.isNewRecord
    ? `新記録！ ${grade.text}`
    : grade.text;
  dom.finalLevel.textContent = formatLevel(maxLevel());
  dom.finalChain.textContent = state.bestChain;
  dom.finalTurns.textContent = state.turns;
  renderResultNextMoves(record, previousBest);
  renderResultHighlights(record);
  renderScoreBreakdown();
  renderRankings();
  submitRankingRecord(record);
  showGameSet();
  clearMergeEffects(false);
  render(true);
  state.resultTimer = window.setTimeout(showResultOverlay, GAME_SET_DELAY);
}

function showGameSet() {
  dom.gameSetScore.textContent = formatNumber(state.score);
  dom.gameSetLabel.textContent = state.isNewRecord ? "🎉 NEW RECORD" : "本日の街づくり終了";
  dom.gameSetOverlay.classList.toggle("is-new-record", state.isNewRecord);
  dom.gameSetOverlay.classList.add("show");
  dom.gameSetOverlay.setAttribute("aria-hidden", "false");
}

function hideGameSet() {
  dom.gameSetOverlay.classList.remove("show");
  dom.gameSetOverlay.setAttribute("aria-hidden", "true");
}

function showResultOverlay() {
  state.resultTimer = 0;
  hideGameSet();
  refreshRecommendationCards();
  dom.resultOverlay.classList.add("show");
  dom.resultOverlay.setAttribute("aria-hidden", "false");
}

async function refreshRecommendationCards() {
  const refreshId = ++recommendationRefreshId;
  const cards = Array.from(document.querySelectorAll(".recommend-card[href]"));
  const targets = uniqueRecommendationTargets(cards);
  await Promise.all(
    targets.map(async ({ pageUrl, directIconUrl, shouldReadPage }) => {
      if (directIconUrl) {
        applyRecommendationIcon(pageUrl, directIconUrl);
      }
      if (!shouldReadPage) {
        return;
      }
      const metadata = await resolveRecommendationMetadata(pageUrl);
      if (refreshId !== recommendationRefreshId) {
        return;
      }
      if (!metadata) {
        clearRecommendationByPage(pageUrl);
        return;
      }
      applyRecommendationMetadata(pageUrl, metadata);
      if (metadata.iconUrl) {
        applyRecommendationIcon(pageUrl, metadata.iconUrl);
      }
    }),
  );
}

function uniqueRecommendationTargets(cards) {
  const targets = new Map();
  for (const card of cards) {
    const pageUrl = normalizePageUrl(card.dataset.metaPage || card.dataset.iconPage || card.href);
    if (!pageUrl || targets.has(pageUrl)) {
      continue;
    }
    const directIconUrl = safeAbsoluteIconUrl(card.dataset.iconSrc, card.href);
    targets.set(pageUrl, {
      pageUrl,
      directIconUrl,
      shouldReadPage: Boolean(card.dataset.metaPage || card.dataset.iconPage || !directIconUrl),
    });
  }
  return Array.from(targets.values());
}

async function resolveRecommendationMetadata(pageUrl) {
  try {
    const response = await fetch(withFreshQuery(pageUrl), { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const html = await response.text();
    const documentSnapshot = new DOMParser().parseFromString(html, "text/html");
    const jsonLd = readJsonLdMetadata(documentSnapshot);
    const manifest = await findManifestMetadata(documentSnapshot, pageUrl);
    return {
      title: firstText(
        metaContent(documentSnapshot, ["meta[name='game:title']", "meta[name='application-name']", "meta[name='apple-mobile-web-app-title']"]),
        jsonLd.title,
        manifest.title,
        metaContent(documentSnapshot, ["meta[property='og:site_name']", "meta[property='og:title']", "meta[name='twitter:title']"]),
        documentSnapshot.querySelector("title")?.textContent,
      ),
      genre: firstGenre(jsonLd.genre),
      description: firstText(
        metaContent(documentSnapshot, ["meta[name='game:description']", "meta[property='og:description']", "meta[name='description']", "meta[name='twitter:description']"]),
        jsonLd.description,
        manifest.description,
      ),
      iconUrl: firstText(findPageIcon(documentSnapshot, pageUrl), manifest.iconUrl),
    };
  } catch {
    return null;
  }
}

function findPageIcon(documentSnapshot, pageUrl) {
  const links = Array.from(documentSnapshot.querySelectorAll("link[rel][href]"));
  const preferred =
    links.find((link) => link.rel.toLowerCase().includes("apple-touch-icon")) ||
    links.find((link) => link.rel.toLowerCase().split(/\s+/).includes("icon"));
  if (!preferred) {
    return "";
  }
  return safeAbsoluteIconUrl(preferred.getAttribute("href"), pageUrl);
}

async function findManifestMetadata(documentSnapshot, pageUrl) {
  const manifest = Array.from(documentSnapshot.querySelectorAll("link[rel][href]")).find((link) =>
    link.rel.toLowerCase().split(/\s+/).includes("manifest"),
  );
  if (!manifest) {
    return {};
  }
  const manifestUrl = safeAbsoluteIconUrl(manifest.getAttribute("href"), pageUrl);
  if (!manifestUrl || manifestUrl.startsWith("data:")) {
    return {};
  }
  try {
    const response = await fetch(withFreshQuery(manifestUrl), { cache: "no-store" });
    if (!response.ok) {
      return {};
    }
    const data = await response.json();
    const icons = Array.isArray(data.icons) ? data.icons : [];
    const bestIcon = icons
      .filter((icon) => icon?.src)
      .map((icon) => ({
        src: safeAbsoluteIconUrl(icon.src, manifestUrl),
        size: largestIconSize(icon.sizes),
      }))
      .filter((icon) => icon.src)
      .sort((a, b) => b.size - a.size)[0];
    return {
      title: firstText(data.name, data.short_name),
      description: firstText(data.description),
      iconUrl: bestIcon?.src || "",
    };
  } catch {
    return {};
  }
}

function readJsonLdMetadata(documentSnapshot) {
  const entries = Array.from(documentSnapshot.querySelectorAll("script[type='application/ld+json']"))
    .flatMap((script) => parseJsonLdEntries(script.textContent));
  const preferred = entries.find((entry) => hasJsonLdType(entry, ["VideoGame", "Game", "SoftwareApplication", "WebApplication"])) || entries[0];
  if (!preferred) {
    return {};
  }
  return {
    title: firstText(preferred.name, preferred.headline),
    description: firstText(preferred.description),
    genre: firstGenre(preferred.genre),
  };
}

function parseJsonLdEntries(text) {
  try {
    const data = JSON.parse(text);
    return flattenJsonLd(data);
  } catch {
    return [];
  }
}

function flattenJsonLd(value) {
  if (Array.isArray(value)) {
    return value.flatMap(flattenJsonLd);
  }
  if (!value || typeof value !== "object") {
    return [];
  }
  const entries = [value];
  if (Array.isArray(value["@graph"])) {
    entries.push(...value["@graph"].flatMap(flattenJsonLd));
  }
  return entries;
}

function hasJsonLdType(entry, types) {
  const rawType = entry?.["@type"];
  const entryTypes = Array.isArray(rawType) ? rawType : [rawType];
  return entryTypes.some((type) => types.includes(type));
}

function metaContent(documentSnapshot, selectors) {
  for (const selector of selectors) {
    const element = documentSnapshot.querySelector(selector);
    const value = element?.getAttribute("content") || element?.textContent;
    if (normalizeText(value)) {
      return value;
    }
  }
  return "";
}

function firstText(...values) {
  for (const value of values) {
    const text = normalizeText(value);
    if (text) {
      return text;
    }
  }
  return "";
}

function firstGenre(...values) {
  for (const value of values) {
    const genres = Array.isArray(value) ? value : String(value || "").split(/[、,/|｜]/);
    const genre = genres.map(normalizeText).find((item) => item && !["games", "entertainment", "browser"].includes(item.toLowerCase()));
    if (genre) {
      return genre;
    }
  }
  return "";
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function largestIconSize(sizes) {
  if (typeof sizes !== "string") {
    return 0;
  }
  return sizes
    .split(/\s+/)
    .map((size) => {
      const match = size.match(/^(\d+)x(\d+)$/i);
      return match ? Number(match[1]) * Number(match[2]) : 0;
    })
    .reduce((max, size) => Math.max(max, size), 0);
}

function applyRecommendationMetadata(pageUrl, metadata) {
  for (const card of document.querySelectorAll(".recommend-card[href]")) {
    if (normalizePageUrl(card.href) !== pageUrl) {
      continue;
    }
    card.classList.remove("is-unavailable");
    const title = cleanRecommendationTitle(metadata.title);
    const genre = normalizeText(metadata.genre);
    const description = compactRecommendationDescription(metadata.description);
    const genreNode = card.querySelector(".recommend-card-copy em");
    const titleNode = card.querySelector(".recommend-card-copy strong");
    const descriptionNode = card.querySelector(".recommend-card-copy small");
    if (genreNode) {
      genreNode.textContent = genre;
    }
    if (title && titleNode) {
      titleNode.textContent = title;
      card.setAttribute("aria-label", `おすすめゲーム: ${title}`);
    }
    if (description && descriptionNode) {
      descriptionNode.textContent = description;
    }
  }
}

function clearRecommendationMetadata(card) {
  card.classList.add("is-unavailable");
  card.setAttribute("aria-label", "おすすめゲーム");
  const genreNode = card.querySelector(".recommend-card-copy em");
  const titleNode = card.querySelector(".recommend-card-copy strong");
  const descriptionNode = card.querySelector(".recommend-card-copy small");
  if (genreNode) {
    genreNode.textContent = "";
  }
  if (titleNode) {
    titleNode.textContent = "";
  }
  if (descriptionNode) {
    descriptionNode.textContent = "";
  }
}

function clearRecommendationByPage(pageUrl) {
  for (const card of document.querySelectorAll(".recommend-card[href]")) {
    if (normalizePageUrl(card.href) !== pageUrl) {
      continue;
    }
    clearRecommendationMetadata(card);
    const art = card.querySelector(".recommend-card-art");
    const image = art?.querySelector(".recommend-favicon");
    art?.classList.remove("is-favicon-loaded");
    art?.classList.add("is-favicon-empty");
    image?.removeAttribute("src");
  }
}

function cleanRecommendationTitle(value) {
  const text = normalizeText(value);
  if (!text) {
    return "";
  }
  return text.split(/\s*(?:\||｜| - | – | — )\s*/)[0] || text;
}

function compactRecommendationDescription(value) {
  const text = normalizeText(value);
  if (!text) {
    return "";
  }
  const firstSentence = text.split(/[。.!?！？]/)[0] || text;
  const clauses = firstSentence.split(/[、,]/).map(normalizeText).filter(Boolean);
  const compact = clauses.length > 1 ? clauses[0] : firstSentence;
  return compact.length > 34 ? compact.slice(0, 34) : compact;
}

function applyRecommendationIcon(pageUrl, iconUrl) {
  const freshIconUrl = withFreshQuery(iconUrl);
  for (const card of document.querySelectorAll(".recommend-card[href]")) {
    if (normalizePageUrl(card.href) !== pageUrl) {
      continue;
    }
    const art = card.querySelector(".recommend-card-art");
    if (!art) {
      continue;
    }
    let image = art.querySelector(".recommend-favicon");
    if (!image) {
      image = document.createElement("img");
      image.className = "recommend-favicon";
      image.alt = "";
      image.decoding = "async";
      image.loading = "eager";
      art.append(image);
    }
    art.classList.remove("is-favicon-empty");
    image.addEventListener(
      "load",
      () => {
        art.classList.remove("is-favicon-empty");
        art.classList.add("is-favicon-loaded");
      },
      { once: true },
    );
    image.addEventListener(
      "error",
      () => {
        art.classList.remove("is-favicon-loaded");
        art.classList.add("is-favicon-empty");
        image.removeAttribute("src");
        if (!card.dataset.metaPage && !card.dataset.iconPage) {
          clearRecommendationMetadata(card);
        }
      },
      { once: true },
    );
    image.src = freshIconUrl;
  }
}

function normalizePageUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    url.hash = "";
    url.search = "";
    return url.href;
  } catch {
    return "";
  }
}

function safeAbsoluteIconUrl(value, baseUrl) {
  if (!value) {
    return "";
  }
  try {
    const url = new URL(value, baseUrl);
    if (url.protocol === "data:") {
      return url.href.startsWith("data:image/") ? url.href : "";
    }
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function withFreshQuery(value) {
  if (!value || value.startsWith("data:")) {
    return value;
  }
  try {
    const url = new URL(value, window.location.href);
    url.searchParams.set("machiIcon", String(Date.now()));
    return url.href;
  } catch {
    return value;
  }
}

function renderResultHighlights(record) {
  const symbol = citySymbol();
  const highlights = [
    {
      label: "街のシンボル",
      value: `${tileName(symbol.level)} 評価${formatNumber(symbol.value)}`,
    },
    {
      label: "今回の街",
      value: resultFeatureText(),
    },
    {
      label: "残り手数",
      value: `${state.movesLeft}`,
    },
  ];

  dom.resultHighlights.innerHTML = highlights
    .map(
      (item, index) => `
        <span class="${index === 0 ? "is-hot" : ""}">
          <small>${escapeHtml(item.label)}</small>
          <b>${escapeHtml(item.value)}</b>
        </span>
      `,
    )
    .join("");
}

function citySymbol() {
  let best = { level: 1, value: 0, index: -1 };
  state.grid.forEach((level, index) => {
    if (!isBuilding(level)) {
      return;
    }
    const value = Math.round(LEVELS[level].score * redevelopmentMultiplier(index));
    if (value > best.value) {
      best = { level, value, index };
    }
  });
  return best.value > 0 ? best : { level: maxLevel() || 1, value: LEVELS[Math.max(1, maxLevel())].score, index: -1 };
}

function resultFeatureText() {
  const landmarkCount = countBuildingsAtLeast(MAX_LEVEL);
  const parts = [];
  if (landmarkCount > 0) {
    parts.push(`ランドマーク${landmarkCount}個`);
  }
  if (state.stallBonusTotal > 0) {
    parts.push(`屋台ボーナス+${formatNumber(state.stallBonusTotal)}`);
  }
  if (redevelopmentLv2Count() > 0) {
    parts.push(`再開発Lv2 ${redevelopmentLv2Count()}か所`);
  }
  return parts.length ? parts.join(" / ") : "これから伸びる街";
}

function cityPersonalityTitle() {
  const parkTotal = parkCount();
  const redeveloped = state.redevelopmentLevels.filter((level) => level > 0).length;
  if (redevelopmentLv2Count() >= 2 || redeveloped >= 5) {
    return "🏙 再開発都市";
  }
  if (state.stallBonusTotal >= 2500) {
    return "🎪 公園文化の街";
  }
  if (parkTotal >= 3) {
    return "🌳 緑豊かな街";
  }
  if (countBuildingsAtLeast(4) >= 2 || state.landmarkCompletions > 0) {
    return "🏗 発展都市";
  }
  return "🌱 これからの街";
}

function renderScoreBreakdown() {
  const breakdown = scoreBreakdownItems();
  dom.scoreBreakdown.innerHTML = breakdown
    .map((item) => `
      <div>
        <span>${escapeHtml(item.label)}</span>
        <strong class="${item.value < 0 ? "is-negative" : ""}">${formatSignedScore(item.value)}</strong>
      </div>
    `)
    .join("");
}

function scoreBreakdownItems() {
  const building = Math.round(state.scoreParts.building || 0);
  const stall = Math.round(state.scoreParts.stall || 0);
  const redevelopment = Math.round(state.scoreParts.redevelopment || 0);
  const other = Math.round(state.score - building - stall - redevelopment);
  return [
    { label: "建物評価", value: building },
    { label: "屋台ボーナス", value: stall },
    { label: "再開発ボーナス", value: redevelopment },
    { label: "その他", value: other },
  ];
}

function renderResultNextMoves(record, previousBest) {
  const moves = getResultNextMoves(record, previousBest);
  dom.resultNextMoves.innerHTML = moves
    .map(
      (move, index) => `
        <span class="${index === 0 ? "is-primary" : ""}">
          <small>${escapeHtml(move.label)}</small>
          <b>${escapeHtml(move.value)}</b>
        </span>
      `,
    )
    .join("");
}

function getResultNextMoves(record, previousBest) {
  const moves = [];

  if (record.maxLevel <= 1) {
    moves.push({ label: "次の挑戦", value: "小屋を3つつなげる" });
    moves.push({ label: "次の挑戦", value: "同じ建物を近くに置く" });
    return moves;
  }

  if (state.clearedMissions < UNLOCK_START_MISSION) {
    const remainingMissions = Math.max(1, UNLOCK_START_MISSION - state.clearedMissions);
    moves.push({
      label: "掲示板",
      value: remainingMissions === 1 ? "あと1回で区画が開く" : `あと${remainingMissions}回で区画が開く`,
    });
  } else if (state.unlockQueue.length > 0) {
    moves.push({ label: "掲示板", value: "お願い達成で区画を開く" });
  }

  if (trashCount() > 0) {
    moves.push({ label: "清掃班", value: "ゴミ屋敷を片づける" });
  }

  if (constructionCount() > 0) {
    moves.push({ label: "工務店", value: "工事中を建物に変える" });
  }

  if (record.maxChain < 2) {
    moves.push({ label: "つながり", value: "合体後の場所もそろえる" });
  }

  if (emptyCount() <= 6) {
    moves.push({ label: "空き区画", value: "通りの端を空けておく" });
  }

  if (record.maxLevel < MAX_LEVEL) {
    moves.push({ label: "次の挑戦", value: `${tileName(record.maxLevel + 1)}を目指す` });
  }

  if (record.score <= previousBest && previousBest > 0) {
    moves.push({ label: "次の挑戦", value: `ベストまであと${formatNumber(previousBest - record.score + 1)}` });
  } else {
    moves.push({ label: "次の挑戦", value: "100,000点突破" });
  }

  moves.push({ label: "次の挑戦", value: "屋台ボーナス20,000" });
  moves.push({ label: "次の街", value: "配置を変えて試す" });
  return moves.slice(0, 3);
}

function formatNumber(value) {
  return Math.round(value).toLocaleString("ja-JP");
}

function formatScoreDelta(value) {
  if (!value) {
    return "";
  }
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${formatNumber(Math.abs(value))}`;
}

function formatSignedScore(value) {
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${prefix}${formatNumber(Math.abs(value))}`;
}

function formatLevel(level) {
  return tileName(level);
}

function readBest() {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function writeBest(value) {
  try {
    localStorage.setItem(BEST_KEY, String(Math.round(value)));
  } catch {
    // 保存できない環境でもゲーム自体は続ける。
  }
}

function vibrate(pattern) {
  const hasUserActivation = navigator.userActivation?.isActive ?? true;
  if (hasUserActivation && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function playLandmarkSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const hasUserActivation = navigator.userActivation?.isActive ?? true;
  if (!AudioContext || !hasUserActivation) {
    return;
  }
  try {
    const audio = new AudioContext();
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audio.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.42);
    gain.connect(audio.destination);
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, audio.currentTime + index * 0.07);
      oscillator.connect(gain);
      oscillator.start(audio.currentTime + index * 0.07);
      oscillator.stop(audio.currentTime + 0.46);
    });
    window.setTimeout(() => audio.close(), 620);
  } catch {
    // 音が出せない環境では演出だけ続ける。
  }
}

function getJstDateKey() {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date()).replaceAll("/", "-");
}

function hashText(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRatio(text) {
  return hashText(text) / 4294967296;
}

function mulberry32(seed) {
  return function random() {
    let value = seed += 0x6d2b79f5;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
