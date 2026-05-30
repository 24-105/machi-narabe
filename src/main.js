const BOARD_COLUMNS = 7;
const BOARD_ROWS = 7;
const CELL_COUNT = BOARD_COLUMNS * BOARD_ROWS;
const START_MOVES = 75;
const GOAL_MOVE_BONUS = 6;
const GAME_SET_DELAY = 1150;
const BEST_KEY = "machi-narabe-best-v1";
const MERGE_SIZE = 3;
const TRASH = -1;
const CLEANUP = -2;
const CONSTRUCTION = -3;
const CRANE = -4;
const PARK = -5;
const STALL = -6;
const TRASH_PENALTY = 280;
const CLEANUP_BONUS = 180;
const CLEANUP_EMPTY_BONUS = 240;
const CLEANUP_MOVE_BONUS = 2;
const CONSTRUCTION_PENALTY = 160;
const CRANE_BONUS = 220;
const PARK_BONUS = 90;
const STALL_BASE_BONUS = 180;
const STALL_NEIGHBOR_BONUS = 130;
const LOT_BONUS = 60;

const LEVELS = [
  null,
  { mark: "小", name: "小屋", color: "#d86b5f", soft: "#fde8e4", score: 40 },
  { mark: "家", name: "住宅", color: "#d9962d", soft: "#fbefd1", score: 150 },
  { mark: "ア", name: "アパート", color: "#2e9a6f", soft: "#dff1e7", score: 520 },
  { mark: "マ", name: "マンション", color: "#2f78b7", soft: "#dfedf8", score: 1700 },
  { mark: "ビ", name: "ビル", color: "#7359b6", soft: "#ebe6f7", score: 5200 },
  { mark: "ホ", name: "ホテル", color: "#8a4fa3", soft: "#f0e5f5", score: 12000 },
  { mark: "塔", name: "タワー", color: "#b75275", soft: "#fae4ed", score: 26000 },
  { mark: "モ", name: "モール", color: "#b86f2d", soft: "#f8ead9", score: 56000 },
  { mark: "星", name: "ランドマーク", color: "#162329", soft: "#e4e8e6", score: 120000 },
];

const MAX_LEVEL = LEVELS.length - 1;
const SPECIALS = {
  [TRASH]: { mark: "汚", name: "ゴミ屋敷", color: "#6b7177", soft: "#eceeed", score: -TRASH_PENALTY },
  [CLEANUP]: { mark: "掃", name: "清掃車", color: "#2b86a3", soft: "#dff2f7", score: CLEANUP_BONUS },
  [CONSTRUCTION]: { mark: "工", name: "工事中", color: "#8b6a4a", soft: "#f1e5d9", score: -CONSTRUCTION_PENALTY },
  [CRANE]: { mark: "ク", name: "クレーン", color: "#c08a19", soft: "#fff0c9", score: CRANE_BONUS },
  [PARK]: { mark: "緑", name: "公園", color: "#3c9a62", soft: "#e0f1e5", score: PARK_BONUS },
  [STALL]: { mark: "屋", name: "屋台", color: "#cf6b43", soft: "#fae8dd", score: STALL_BASE_BONUS },
};

const GRADE_LINES = [
  { min: 90000, grade: "極", text: "かなり大きな街になりました。" },
  { min: 36000, grade: "優", text: "大きな建物をうまく残せています。" },
  { min: 12000, grade: "良", text: "3つそろえる形が見えてきました。" },
  { min: 3000, grade: "可", text: "置き場所の整理ができています。" },
  { min: 0, grade: "初", text: "まずは光る場所で3つそろえよう。" },
];

const EVENTS = [
  { id: "festival", name: "お祭り", label: "合体で手数+1", moves: 5 },
  { id: "boom", name: "建設日和", label: "合体のスコア1.5倍", moves: 5 },
  { id: "cleanup", name: "清掃デー", label: "清掃車が来やすい", moves: 6 },
  { id: "market", name: "商店街セール", label: "合体のスコア+25%", moves: 5 },
  { id: "moveIn", name: "引っ越し日", label: "小屋・住宅が出やすい", moves: 6 },
  { id: "lotBonus", name: "空き地の日", label: `置くだけで+${LOT_BONUS}`, moves: 5 },
  { id: "shortage", name: "資材不足", label: "合体のスコア0.8倍", moves: 4 },
];

const SPAWN_TABLES = [
  null,
  [[1, 100]],
  [[1, 72], [2, 28]],
  [[1, 58], [2, 30], [3, 12]],
  [[1, 50], [2, 30], [3, 15], [4, 5]],
  [[1, 46], [2, 29], [3, 17], [4, 7], [5, 1]],
  [[1, 41], [2, 28], [3, 18], [4, 9], [5, 3], [6, 1]],
  [[1, 38], [2, 27], [3, 19], [4, 10], [5, 4], [6, 2]],
  [[1, 36], [2, 26], [3, 19], [4, 11], [5, 5], [6, 2], [7, 1]],
];

const dom = {
  resetButton: document.querySelector("#resetButton"),
  overlayStartButton: document.querySelector("#overlayStartButton"),
  againButton: document.querySelector("#againButton"),
  resetOverlay: document.querySelector("#resetOverlay"),
  cancelResetButton: document.querySelector("#cancelResetButton"),
  confirmResetButton: document.querySelector("#confirmResetButton"),
  recommendButton: document.querySelector("#recommendButton"),
  recommendOverlay: document.querySelector("#recommendOverlay"),
  closeRecommendButton: document.querySelector("#closeRecommendButton"),
  startOverlay: document.querySelector("#startOverlay"),
  gameSetOverlay: document.querySelector("#gameSetOverlay"),
  resultOverlay: document.querySelector("#resultOverlay"),
  moves: document.querySelector("#timeValue"),
  movesBar: document.querySelector("#timeBar"),
  score: document.querySelector("#scoreValue"),
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
  board: document.querySelector("#board"),
  hand: document.querySelector("#hand"),
  grade: document.querySelector("#gradeValue"),
  gameSetScore: document.querySelector("#gameSetScoreValue"),
  finalScore: document.querySelector("#finalScoreValue"),
  resultMessage: document.querySelector("#resultMessage"),
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
  lastPlaced: -1,
  mergeCells: new Set(),
  upgradedCell: -1,
  effectMode: "",
  effectTimer: 0,
  resultTimer: 0,
};

dom.resetButton.addEventListener("click", requestReset);
dom.overlayStartButton.addEventListener("click", startGame);
dom.recommendButton.addEventListener("click", openRecommendOverlay);
dom.againButton.addEventListener("click", () => {
  resetGame();
  startGame();
});
dom.cancelResetButton.addEventListener("click", closeResetConfirm);
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

resetGame();

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
  state.grid = Array.from({ length: CELL_COUNT }, () => null);
  state.current = 1;
  state.next = 1;
  state.afterNext = 1;
  state.mergeCells = new Set();
  state.upgradedCell = -1;
  state.effectMode = "";
  state.lastPlaced = -1;
  window.clearTimeout(state.resultTimer);
  state.resultTimer = 0;

  prepareOpening();
  state.afterNext = drawLevel();
  dom.startOverlay.classList.add("show");
  dom.startOverlay.setAttribute("aria-hidden", "false");
  dom.resultOverlay.classList.remove("show");
  dom.resultOverlay.setAttribute("aria-hidden", "true");
  hideGameSet();
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

function openRecommendOverlay() {
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
  const cap = Math.min(MAX_LEVEL - 1, Math.max(1, maxLevel()));
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
  if (state.grid[index]) {
    setMessage("白い空き地だけに置けます。", tileName(state.current));
    return;
  }

  const placedLevel = state.current;
  state.grid[index] = placedLevel;
  state.current = state.next;
  state.turns += 1;
  state.movesLeft = Math.max(0, state.movesLeft - 1);
  state.lastPlaced = index;
  state.mergeCells = new Set([index]);
  state.upgradedCell = -1;
  state.effectMode = "place";

  if (placedLevel === TRASH) {
    state.lastChain = 0;
    state.score -= TRASH_PENALTY;
    setMessage(`スコア -${formatNumber(TRASH_PENALTY)}。端に寄せて、清掃車で片づけよう。`, "ゴミ屋敷");
    finishTurn(false, 16, false);
    return;
  }
  if (placedLevel === CONSTRUCTION) {
    state.lastChain = 0;
    state.score -= CONSTRUCTION_PENALTY;
    setMessage(`スコア -${formatNumber(CONSTRUCTION_PENALTY)}。あとでクレーンを使うと建物に戻せます。`, "工事中");
    finishTurn(false, 16, false);
    return;
  }
  if (placedLevel === PARK) {
    const bonus = PARK_BONUS + adjacentBuildingCount(index) * 35;
    state.lastChain = 0;
    state.score += bonus;
    setMessage(`スコア +${formatNumber(bonus)}。屋台が来たら、周りの建物でさらに伸びます。`, "公園");
    finishTurn(false, 10, false);
    return;
  }

  const result = resolveMerges(index);
  if (result.chain > 0) {
    state.effectMode = "merge";
    state.lastChain = result.chain;
    state.bestChain = Math.max(state.bestChain, result.chain);
    const multiplier = eventScoreMultiplier();
    const score = Math.round(result.score * multiplier);
    let extraMove = 0;
    if (state.activeEvent?.id === "festival") {
      extraMove = 1;
      state.movesLeft += extraMove;
    }
    state.score += score;
    const growthText = result.chain > 1 ? `コンボ${result.chain}` : "合体";
    const eventText = multiplier !== 1 ? ` ${state.activeEvent.label}` : "";
    setMessage(`${growthText}成功。スコア +${formatNumber(score)}${extraMove ? "、手数+1" : ""}${eventText}`, "ナイス");
  } else {
    state.lastChain = 0;
    const bonus = noMergeBonus();
    if (bonus > 0) {
      state.score += bonus;
      setMessage(`置くだけでスコア +${formatNumber(bonus)}。次の3つそろえを作ろう。`, "空き地の日");
    } else {
      setMessage("同じ建物の近くに置くと、次の合体につながります。", tileName(placedLevel));
    }
  }

  finishTurn(result.chain > 0, result.chain > 0 ? 24 : 10, true);
}

function cleanTrash(index) {
  if (!state.grid[index]) {
    improveEmptyLot(index);
    return;
  }
  if (state.grid[index] !== TRASH) {
    setMessage(trashCount() > 0 ? "ゴミ屋敷を消すか、空き地を整えられます。" : "空き地を選ぶと、スコアと手数が少し増えます。", "清掃車");
    return;
  }

  state.grid[index] = null;
  state.current = state.next;
  state.turns += 1;
  state.movesLeft = Math.max(0, state.movesLeft - 1);
  state.lastPlaced = index;
  state.mergeCells = new Set([index]);
  state.upgradedCell = -1;
  state.effectMode = "clean";
  state.lastChain = 0;
  state.score += CLEANUP_BONUS;
  setMessage(`ゴミ屋敷を片づけました。空いたマスをまた使えます。スコア +${formatNumber(CLEANUP_BONUS)}。`, "清掃車");
  finishTurn(false, 18, false);
}

function improveEmptyLot(index) {
  if (state.grid[index]) {
    setMessage("白い空き地を選ぶと、スコアと手数が少し増えます。", "清掃車");
    return;
  }

  state.current = state.next;
  state.turns += 1;
  state.movesLeft = Math.max(0, state.movesLeft - 1 + CLEANUP_MOVE_BONUS);
  state.lastPlaced = index;
  state.mergeCells = new Set([index]);
  state.upgradedCell = -1;
  state.effectMode = "tidy";
  state.lastChain = 0;
  state.score += CLEANUP_EMPTY_BONUS;
  setMessage(`空き地は空いたまま。スコア +${formatNumber(CLEANUP_EMPTY_BONUS)}、手数 +${CLEANUP_MOVE_BONUS - 1} が入ります。`, "清掃車");
  finishTurn(false, 18, false);
}

function useCrane(index) {
  if (state.grid[index] === CONSTRUCTION) {
    buildFromConstruction(index);
    return;
  }

  if (!isBuilding(state.grid[index]) || state.grid[index] >= MAX_LEVEL) {
    setMessage(constructionCount() > 0 ? "工事中か、1つ大きくしたい建物を選びます。" : "1つ大きくしたい建物を選びます。", "クレーン");
    return;
  }
  upgradeBuilding(index);
}

function buildFromConstruction(index) {
  const newLevel = constructionUpgradeLevel(index);
  state.grid[index] = newLevel;
  consumeSpecial(index);
  state.upgradedCell = index;
  state.score += CRANE_BONUS;
  const result = resolveMerges(index);
  if (result.chain > 0) {
    state.effectMode = "merge";
    state.lastChain = result.chain;
    state.bestChain = Math.max(state.bestChain, result.chain);
    state.score += result.score;
    setMessage(`${tileName(newLevel)}に直して、そのまま合体。スコア +${formatNumber(CRANE_BONUS + result.score)}。`, "クレーン");
  } else {
    state.effectMode = "upgrade";
    state.lastChain = 0;
    setMessage(`${tileName(newLevel)}に直しました。スコア +${formatNumber(CRANE_BONUS)}。`, "クレーン");
  }
  finishTurn(result.chain > 0, 22, true);
}

function upgradeBuilding(index) {
  const newLevel = Math.min(MAX_LEVEL, state.grid[index] + 1);
  state.grid[index] = newLevel;
  consumeSpecial(index);
  state.upgradedCell = index;
  state.score += CRANE_BONUS;
  const result = resolveMerges(index);
  if (result.chain > 0) {
    state.effectMode = "merge";
    state.lastChain = result.chain;
    state.bestChain = Math.max(state.bestChain, result.chain);
    state.score += result.score;
    setMessage(`建物を大きくして、そのまま合体。スコア +${formatNumber(CRANE_BONUS + result.score)}。`, "クレーン");
  } else {
    state.effectMode = "upgrade";
    state.lastChain = 0;
    setMessage(`${tileName(newLevel)}に大きくしました。スコア +${formatNumber(CRANE_BONUS)}。`, "クレーン");
  }
  finishTurn(result.chain > 0, 22, true);
}

function useStall(index) {
  if (parkCount() > 0) {
    if (state.grid[index] !== PARK) {
      setMessage("屋台を出したい公園を選びます。周りに建物が多いほど高スコアです。", "屋台");
      return;
    }
    openStallAtPark(index);
    return;
  }

  if (state.grid[index]) {
    setMessage("公園を作るため、白い空き地を選びます。", "屋台");
    return;
  }
  state.grid[index] = PARK;
  consumeSpecial(index);
  state.effectMode = "park";
  const bonus = PARK_BONUS + STALL_BASE_BONUS;
  state.score += bonus;
  state.lastChain = 0;
  setMessage(`空き地に公園を作って屋台を出しました。スコア +${formatNumber(bonus)}。`, "屋台");
  finishTurn(false, 16, false);
}

function openStallAtPark(index) {
  const bonus = STALL_BASE_BONUS + adjacentBuildingCount(index) * STALL_NEIGHBOR_BONUS;
  state.grid[index] = null;
  consumeSpecial(index);
  state.effectMode = "stall";
  state.score += bonus;
  state.lastChain = 0;
  setMessage(`屋台が大盛況。周りの建物ぶん伸びて、スコア +${formatNumber(bonus)}。`, "屋台");
  finishTurn(false, 20, false);
}

function consumeSpecial(index) {
  state.current = state.next;
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
  advanceCardQueue();
  vibrate(vibration);
  render(true);
  scheduleEffectClear();

  if (emptyCount() === 0 || state.movesLeft <= 0) {
    window.setTimeout(endGame, 360);
  }
}

function advanceCardQueue() {
  state.next = state.afterNext;
  state.afterNext = drawLevel();
}

function resolveMerges(startIndex) {
  let anchor = startIndex;
  let chain = 0;
  let gained = 0;
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
    const points = Math.round(LEVELS[nextLevel].score * (1 + (chain - 1) * 0.8 + extra * 0.35));

    for (const cell of group) {
      state.grid[cell] = null;
      touched.add(cell);
    }

    state.grid[anchor] = nextLevel;
    state.upgradedCell = anchor;
    touched.add(anchor);
    gained += points;
  }

  state.mergeCells = touched;
  return { chain, score: gained };
}

function checkGoalBonus() {
  if (state.targetLevel > MAX_LEVEL) {
    return;
  }
  if (maxLevel() < state.targetLevel) {
    return;
  }

  const bonus = LEVELS[state.targetLevel].score;
  state.score += bonus;
  state.movesLeft += GOAL_MOVE_BONUS;
  setMessage(`ミッション達成。手数+${GOAL_MOVE_BONUS}、ボーナス +${formatNumber(bonus)}。`, "ミッション");
  if (!state.activeEvent) {
    startEvent("festival");
  }
  state.targetLevel += 1;
}

function render(force = false) {
  const max = maxLevel();
  const target = LEVELS[Math.min(state.targetLevel, MAX_LEVEL)];

  dom.moves.textContent = state.movesLeft;
  dom.movesBar.style.transform = `scaleX(${Math.min(1, state.movesLeft / START_MOVES)})`;
  dom.score.textContent = formatNumber(state.score);
  dom.chain.textContent = state.lastChain;
  dom.best.textContent = formatNumber(Math.max(state.best, state.score));
  dom.empty.textContent = emptyCount();
  dom.targetMark.textContent = target.mark;
  dom.targetChip.style.setProperty("--target-color", target.color);
  dom.event.textContent = state.activeEvent
    ? `${state.activeEvent.name} あと${state.eventMovesLeft}手`
    : "イベントなし";

  if (state.targetLevel <= MAX_LEVEL) {
    dom.goal.textContent = `${tileName(state.targetLevel)}を作ろう`;
    dom.goalHint.textContent = `達成で手数+${GOAL_MOVE_BONUS}`;
  } else {
    dom.goal.textContent = "ランドマークを増やす";
    dom.goalHint.textContent = "大きい建物ほど高スコア";
  }
  renderEvolutionRail(max);

  renderBoard(force);
  renderPreview();
}

function renderBoard(force = false) {
  const hint = bestPlacementHint(state.current);
  const cells = [];
  const isMergeEffect = state.effectMode === "merge" && state.mergeCells.size >= MERGE_SIZE;
  dom.board.classList.toggle("bursting", isMergeEffect);

  for (let index = 0; index < CELL_COUNT; index += 1) {
    const level = state.grid[index];
    const preview = previewPlacement(index, state.current);
    const hintMode = index === hint.index ? hint.mode : "";
    const meta = level ? tileMeta(level) : tileMeta(state.current);
    const classes = ["tile"];
    const style = [`--tile-color: ${meta.color}`, `--tile-soft: ${meta.soft}`];

    if (level) {
      classes.push("filled", `level-${level}`);
      if (!isBuilding(level)) {
        classes.push("special", "special-tile");
        if (level === TRASH) {
          classes.push("trash-tile");
        }
      }
      if (["clean", "crane", "upgrade", "stall"].includes(hintMode)) {
        classes.push("hint-ready", "clean-ready");
      }
    } else {
      classes.push("empty");
      if (hintMode === "merge" && preview?.merge) {
        classes.push("hint-ready", "merge-ready");
      } else if (hintMode === "tidy") {
        classes.push("hint-ready", "clean-ready");
      } else if (hintMode === "park") {
        classes.push("hint-ready", "recommend-ready");
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
        aria-label="${level ? tileName(level) : "空き地"}"
      >
        ${renderTileInner(level, hintMode)}
      </button>
    `);
  }

  if (force || dom.board.childElementCount !== CELL_COUNT) {
    dom.board.innerHTML = cells.join("");
    return;
  }
  dom.board.innerHTML = cells.join("");
}

function renderTileInner(level, hintMode) {
  if (!level) {
    const badge = hintMode === "merge"
      ? "合体"
      : hintMode === "tidy"
        ? "整備"
        : hintMode === "park"
          ? "公園"
        : hintMode === "prep" || hintMode === "seed"
        ? "おすすめ"
        : "";
    const hidesGhost = state.current === CLEANUP || state.current === CRANE || (state.current === STALL && parkCount() > 0);
    const ghost = hidesGhost ? "" : `<span class="ghost-mark">${tileMeta(state.current).mark}</span>`;
    return `
      ${badge ? `<span class="merge-badge">${badge}</span>` : ""}
      <span class="empty-label">空き地</span>
      ${ghost}
    `;
  }

  const meta = tileMeta(level);
  const badgeText = {
    clean: "清掃",
    crane: "直す",
    upgrade: "増築",
    stall: "屋台",
  }[hintMode] || "";
  const badge = badgeText ? `<span class="merge-badge">${badgeText}</span>` : "";
  return `
    ${badge}
    <span class="tile-art" aria-hidden="true"><b>${meta.mark}</b></span>
    <span class="tile-label">${meta.name}</span>
  `;
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
      ${renderNextToken(state.next, "次")}
      ${renderNextToken(state.afterNext, "次の次")}
    </div>
  `;
}

function renderNextToken(level, label) {
  const meta = tileMeta(level);
  const cardClass = level < 0 ? " special-card" : "";
  return `
    <span
      class="next-token${cardClass}"
      style="--tile-color: ${meta.color}; --tile-soft: ${meta.soft}"
      aria-label="${label}: ${tileName(level)}"
      title="${label}: ${tileName(level)}"
    >
      <em>${label}</em>
      <i>${meta.mark}</i>
    </span>
  `;
}

function currentCardLabel() {
  if ([CLEANUP, CRANE, STALL].includes(state.current)) {
    return "アイテム";
  }
  if ([TRASH, CONSTRUCTION, PARK].includes(state.current)) {
    return "特殊";
  }
  return "建物";
}

function renderEvolutionRail(max) {
  dom.evolution.innerHTML = LEVELS.slice(1).map((meta, offset) => {
    const level = offset + 1;
    const classes = ["evolution-step"];
    if (level <= max) {
      classes.push("done");
    }
    if (level === state.current) {
      classes.push("current");
    }
    if (level === state.targetLevel) {
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
  if (level === CLEANUP) {
    if (state.grid[index] === TRASH) {
      return { merge: false, groupSize: 1, clean: true };
    }
    return state.grid[index] ? null : { merge: false, groupSize: 0, tidy: true };
  }
  if (level === CRANE) {
    if (state.grid[index] === CONSTRUCTION) {
      return { merge: false, groupSize: 1, crane: true };
    }
    return isBuilding(state.grid[index]) && state.grid[index] < MAX_LEVEL
      ? { merge: false, groupSize: 1, upgrade: true }
      : null;
  }
  if (level === STALL) {
    if (parkCount() > 0) {
      return state.grid[index] === PARK ? { merge: false, groupSize: 1, stall: true } : null;
    }
    return state.grid[index] ? null : { merge: false, groupSize: 0, park: true };
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
  const emptyNeighbors = neighbors(index).filter((cell) => !state.grid[cell]).length;
  const occupiedNeighbors = neighbors(index).length - emptyNeighbors;
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
  if (mode === "bad") {
    return 2600 + distance * 62 + edge * 120 - occupiedNeighbors * 35 + jitter;
  }
  if (mode === "merge") {
    const nextLevel = Math.min(MAX_LEVEL, level + 1);
    const goalBonus = nextLevel >= state.targetLevel ? 460 : 0;
    return 4300 + nextLevel * 180 + preview.groupSize * 90 + goalBonus - distance * 12 + jitter;
  }
  if (mode === "prep") {
    return 2750 + emptyNeighbors * 90 - distance * 18 + level * 48 + jitter;
  }
  return 1400 + emptyNeighbors * 96 - distance * 22 + level * 36 + jitter;
}

function recommendationSpread(mode) {
  if (["clean", "tidy", "crane", "upgrade", "stall", "merge"].includes(mode)) {
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

function adjacentBuildingCount(index) {
  return neighbors(index).filter((cell) => isBuilding(state.grid[cell])).length;
}

function constructionUpgradeLevel(index) {
  const bestNeighbor = neighbors(index).reduce((best, cell) => {
    const level = state.grid[cell];
    return isBuilding(level) ? Math.max(best, level) : best;
  }, 0);
  return Math.min(MAX_LEVEL, Math.max(1, bestNeighbor + 1));
}

function indexFor(row, col) {
  return row * BOARD_COLUMNS + col;
}

function emptyCount() {
  return state.grid.filter((tile) => !tile).length;
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

function parkCount() {
  return state.grid.filter((tile) => tile === PARK).length;
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

function updatePlacementMessage() {
  if (state.current === CLEANUP) {
    if (trashCount() > 0) {
      setHint("清掃車", `ゴミ屋敷なら消して +${formatNumber(CLEANUP_BONUS)}。空き地なら整えて +${formatNumber(CLEANUP_EMPTY_BONUS)}、手数+${CLEANUP_MOVE_BONUS - 1}。`);
      return;
    }
    setHint("清掃車", `空き地をタップすると整備。スコア +${formatNumber(CLEANUP_EMPTY_BONUS)}、手数+${CLEANUP_MOVE_BONUS - 1}。マスは空いたままです。`);
    return;
  }
  if (state.current === CRANE) {
    if (constructionCount() > 0) {
      setHint("クレーン", "工事中を直せます。建物に使うと1つ大きくなるので、合体の形を作れます。");
      return;
    }
    setHint("クレーン", "好きな建物を1つ大きくできます。3つそろう場所に使うと高スコアを狙えます。");
    return;
  }
  if (state.current === STALL) {
    if (parkCount() > 0) {
      setHint("屋台", "公園に出すとスコアになります。周りに建物が多い公園ほど高スコア。");
      return;
    }
    setHint("屋台", "公園がない時は、空き地に公園を作れます。次の屋台で稼ぐ準備になります。");
    return;
  }
  if (state.current === TRASH) {
    setHint("ゴミ屋敷", `置くとスコア -${formatNumber(TRASH_PENALTY)}。端に寄せて、清掃車で片づけよう。`);
    return;
  }
  if (state.current === CONSTRUCTION) {
    setHint("工事中", `置くとスコア -${formatNumber(CONSTRUCTION_PENALTY)}。あとでクレーンを使うと建物に戻せます。`);
    return;
  }
  if (state.current === PARK) {
    setHint("公園", "建物の近くに置くほど、屋台が来た時にスコアが伸びます。");
    return;
  }
  const hint = bestPlacementHint(state.current);
  if (hint.mode === "merge") {
    setHint(`${tileName(state.current)}を置く`, `光る空き地で3つそろうと${tileName(Math.min(state.current + 1, MAX_LEVEL))}に合体。迷ったら光る場所でOK。`);
    return;
  }
  if (hint.mode === "prep") {
    setHint(`${tileName(state.current)}を置く`, "同じ建物の隣に置いて、次のカードで3つそろう形を作ろう。");
    return;
  }
  setHint(`${tileName(state.current)}を置く`, "白い空き地に置けます。同じ建物の近くに置くと、あとで合体しやすいです。");
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

function scheduleEffectClear() {
  window.clearTimeout(state.effectTimer);
  state.effectTimer = window.setTimeout(() => clearMergeEffects(), 720);
}

function clearMergeEffects(shouldRender = true) {
  window.clearTimeout(state.effectTimer);
  state.effectTimer = 0;
  state.lastPlaced = -1;
  state.mergeCells = new Set();
  state.upgradedCell = -1;
  state.effectMode = "";
  if (shouldRender) {
    if (state.running && !state.ended) {
      updatePlacementMessage();
    }
    render(true);
  }
}

function endGame() {
  if (state.ended) {
    return;
  }
  state.running = false;
  state.ended = true;
  if (state.score > state.best) {
    state.best = state.score;
    writeBest(state.score);
  }
  const grade = GRADE_LINES.find((line) => state.score >= line.min) || GRADE_LINES.at(-1);

  dom.grade.textContent = grade.grade;
  dom.finalScore.textContent = formatNumber(state.score);
  dom.resultMessage.textContent = grade.text;
  dom.finalLevel.textContent = formatLevel(maxLevel());
  dom.finalChain.textContent = state.bestChain;
  dom.finalTurns.textContent = state.turns;
  showGameSet();
  clearMergeEffects(false);
  render(true);
  state.resultTimer = window.setTimeout(showResultOverlay, GAME_SET_DELAY);
}

function showGameSet() {
  dom.gameSetScore.textContent = formatNumber(state.score);
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
  dom.resultOverlay.classList.add("show");
  dom.resultOverlay.setAttribute("aria-hidden", "false");
}

function formatNumber(value) {
  return Math.round(value).toLocaleString("ja-JP");
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
