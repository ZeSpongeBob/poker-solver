const RANKS = "23456789TJQKA";
const SUITS = "cdhs";
const TRACKER_KEY = "poker_solver_tracker";

const equityForm = document.getElementById("equity-form");
const equityOutput = document.getElementById("equity-output");
const sizingForm = document.getElementById("sizing-form");
const sizingOutput = document.getElementById("sizing-output");
const trackerForm = document.getElementById("tracker-form");
const trackerTableBody = document.querySelector("#tracker-table tbody");
const trackerStats = document.getElementById("tracker-stats");
const clearTrackerBtn = document.getElementById("clear-tracker");

function parseCards(raw) {
  if (!raw.trim()) return [];
  const cards = raw
    .trim()
    .split(/\s+/)
    .map((c) => c.trim());

  for (const card of cards) {
    if (card.length !== 2) throw new Error(`Carte invalide: ${card}`);
    const rank = card[0].toUpperCase();
    const suit = card[1].toLowerCase();
    if (!RANKS.includes(rank) || !SUITS.includes(suit)) {
      throw new Error(`Carte invalide: ${card}`);
    }
  }

  const unique = new Set(cards.map((c) => c.toLowerCase()));
  if (unique.size !== cards.length) {
    throw new Error("Cartes dupliquées dans la même saisie.");
  }
  return cards.map((c) => c[0].toUpperCase() + c[1].toLowerCase());
}

function fullDeck() {
  const d = [];
  for (const r of RANKS) {
    for (const s of SUITS) {
      d.push(`${r}${s}`);
    }
  }
  return d;
}

function removeKnown(deck, known) {
  const knownSet = new Set(known.map((c) => c.toLowerCase()));
  return deck.filter((c) => !knownSet.has(c.toLowerCase()));
}

function sampleWithoutReplacement(deck, n) {
  const copy = deck.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function cardToValue(card) {
  return RANKS.indexOf(card[0]) + 2;
}

function evaluateFive(cards) {
  const values = cards.map(cardToValue).sort((a, b) => b - a);
  const suits = cards.map((c) => c[1]);
  const isFlush = suits.every((s) => s === suits[0]);

  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
  const groups = [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  let uniqueVals = [...new Set(values)].sort((a, b) => b - a);
  let isStraight = false;
  let straightHigh = uniqueVals[0];

  if (uniqueVals.length === 5) {
    if (uniqueVals[0] - uniqueVals[4] === 4) {
      isStraight = true;
    } else if (
      JSON.stringify(uniqueVals) === JSON.stringify([14, 5, 4, 3, 2])
    ) {
      isStraight = true;
      straightHigh = 5;
    }
  }

  if (isStraight && isFlush) return [8, straightHigh];
  if (groups[0][1] === 4) return [7, groups[0][0], groups[1][0]];
  if (groups[0][1] === 3 && groups[1][1] === 2) return [6, groups[0][0], groups[1][0]];
  if (isFlush) return [5, ...values];
  if (isStraight) return [4, straightHigh];
  if (groups[0][1] === 3) {
    const kickers = groups.filter((g) => g[1] === 1).map((g) => g[0]).sort((a, b) => b - a);
    return [3, groups[0][0], ...kickers];
  }
  if (groups[0][1] === 2 && groups[1][1] === 2) {
    const pairs = groups.filter((g) => g[1] === 2).map((g) => g[0]).sort((a, b) => b - a);
    const kicker = groups.find((g) => g[1] === 1)[0];
    return [2, ...pairs, kicker];
  }
  if (groups[0][1] === 2) {
    const pair = groups[0][0];
    const kickers = groups.filter((g) => g[1] === 1).map((g) => g[0]).sort((a, b) => b - a);
    return [1, pair, ...kickers];
  }
  return [0, ...values];
}

function compareRanks(a, b) {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = a[i] || 0;
    const bv = b[i] || 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

function combinations(arr, k) {
  const out = [];
  function rec(start, cur) {
    if (cur.length === k) {
      out.push(cur.slice());
      return;
    }
    for (let i = start; i < arr.length; i++) {
      cur.push(arr[i]);
      rec(i + 1, cur);
      cur.pop();
    }
  }
  rec(0, []);
  return out;
}

function bestOfSeven(cards) {
  const fiveCombos = combinations(cards, 5);
  let best = null;
  for (const combo of fiveCombos) {
    const rank = evaluateFive(combo);
    if (!best || compareRanks(rank, best) > 0) best = rank;
  }
  return best;
}

function detectStreet(boardLen) {
  if (boardLen === 0) return "Préflop";
  if (boardLen === 3) return "Flop";
  if (boardLen === 4) return "Turn";
  if (boardLen === 5) return "River";
  return "Invalide";
}

function runEquitySimulation(heroCards, boardCards, opponents, iterations) {
  let wins = 0;
  let ties = 0;
  let losses = 0;

  for (let i = 0; i < iterations; i++) {
    const deck = removeKnown(fullDeck(), [...heroCards, ...boardCards]);
    const missingBoard = 5 - boardCards.length;
    const needed = missingBoard + opponents * 2;
    const draw = sampleWithoutReplacement(deck, needed);

    const board = boardCards.slice();
    board.push(...draw.slice(0, missingBoard));

    const villainHands = [];
    for (let v = 0; v < opponents; v++) {
      villainHands.push(draw.slice(missingBoard + v * 2, missingBoard + v * 2 + 2));
    }

    const heroRank = bestOfSeven([...heroCards, ...board]);
    let result = 1;

    for (const vh of villainHands) {
      const vRank = bestOfSeven([...vh, ...board]);
      const cmp = compareRanks(heroRank, vRank);
      if (cmp < 0) {
        result = -1;
        break;
      }
      if (cmp === 0) result = 0;
    }

    if (result === 1) wins++;
    else if (result === 0) ties++;
    else losses++;
  }

  return {
    wins,
    ties,
    losses,
    winPct: ((wins / iterations) * 100).toFixed(2),
    tiePct: ((ties / iterations) * 100).toFixed(2),
    lossPct: ((losses / iterations) * 100).toFixed(2),
  };
}

function suggestSizing({ street, stackBb, potBb, position }) {
  const spr = stackBb / potBb;
  const ipFactor = position === "ip" ? 1 : 0.9;

  let basePct;
  if (street === "preflop") basePct = 2.5;
  else if (street === "flop") basePct = spr > 6 ? 0.33 : 0.5;
  else if (street === "turn") basePct = spr > 3 ? 0.66 : 0.75;
  else basePct = spr > 1.5 ? 0.75 : 1.0;

  const small = +(potBb * basePct * 0.8 * ipFactor).toFixed(1);
  const standard = +(potBb * basePct * ipFactor).toFixed(1);
  const large = +(potBb * basePct * 1.25 * ipFactor).toFixed(1);

  const shoveHint =
    spr <= 1.2
      ? "SPR bas: plan de tapis très fréquent sur cette street."
      : spr <= 2
      ? "SPR moyen-bas: gros sizings / 2-barrels agressifs recommandés."
      : "SPR confortable: privilégie une stratégie polarisée selon le board.";

  return { spr: spr.toFixed(2), small, standard, large, shoveHint };
}

equityForm.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const heroCards = parseCards(document.getElementById("hero-cards").value);
    const boardCards = parseCards(document.getElementById("board-cards").value);
    const opponents = Number(document.getElementById("opponents").value);
    const iterations = Number(document.getElementById("iterations").value);

    if (heroCards.length !== 2) throw new Error("Le héros doit avoir exactement 2 cartes.");
    if (![0, 3, 4, 5].includes(boardCards.length)) {
      throw new Error("Le board doit contenir 0, 3, 4 ou 5 cartes.");
    }

    const allCards = [...heroCards, ...boardCards].map((c) => c.toLowerCase());
    if (new Set(allCards).size !== allCards.length) {
      throw new Error("Cartes dupliquées entre main héros et board.");
    }

    const street = detectStreet(boardCards.length);
    const result = runEquitySimulation(heroCards, boardCards, opponents, iterations);

    equityOutput.classList.remove("muted");
    equityOutput.classList.add("ok");
    equityOutput.textContent =
      `${street} | ${iterations.toLocaleString("fr-FR")} itérations\n` +
      `Win: ${result.winPct}%\n` +
      `Tie: ${result.tiePct}%\n` +
      `Loss: ${result.lossPct}%`;
  } catch (err) {
    equityOutput.classList.remove("ok");
    equityOutput.classList.add("muted");
    equityOutput.textContent = `Erreur: ${err.message}`;
  }
});

sizingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const street = document.getElementById("street").value;
  const stackBb = Number(document.getElementById("stack-bb").value);
  const potBb = Number(document.getElementById("pot-bb").value);
  const position = document.getElementById("position").value;

  const rec = suggestSizing({ street, stackBb, potBb, position });
  sizingOutput.classList.remove("muted");
  sizingOutput.classList.add("ok");
  sizingOutput.textContent =
    `SPR: ${rec.spr}\n` +
    `Petit sizing: ${rec.small} bb\n` +
    `Sizing standard: ${rec.standard} bb\n` +
    `Gros sizing: ${rec.large} bb\n` +
    `${rec.shoveHint}`;
});

function getTracker() {
  return JSON.parse(localStorage.getItem(TRACKER_KEY) || "[]");
}

function saveTracker(rows) {
  localStorage.setItem(TRACKER_KEY, JSON.stringify(rows));
}

function renderTracker() {
  const rows = getTracker();
  trackerTableBody.innerHTML = "";

  for (const row of rows.slice().reverse()) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(row.createdAt).toLocaleString("fr-FR")}</td>
      <td>${row.hand}</td>
      <td>${row.street}</td>
      <td>${row.result}</td>
      <td>${row.bb.toFixed(1)}</td>
    `;
    trackerTableBody.appendChild(tr);
  }

  const total = rows.length;
  const wins = rows.filter((r) => r.result === "win").length;
  const losses = rows.filter((r) => r.result === "loss").length;
  const ties = rows.filter((r) => r.result === "tie").length;
  const netBb = rows.reduce((sum, r) => sum + r.bb, 0);
  const winrate = total ? ((wins / total) * 100).toFixed(1) : "0.0";

  trackerStats.classList.remove("muted");
  trackerStats.textContent =
    `Mains trackées: ${total} | Win: ${wins} | Loss: ${losses} | Tie: ${ties} | ` +
    `Winrate: ${winrate}% | Net: ${netBb.toFixed(1)} bb`;
}

trackerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const hand = document.getElementById("track-hand").value.trim();
  const street = document.getElementById("track-street").value;
  const result = document.getElementById("track-result").value;
  const bb = Number(document.getElementById("track-bb").value);

  const rows = getTracker();
  rows.push({ hand, street, result, bb, createdAt: new Date().toISOString() });
  saveTracker(rows);
  renderTracker();
  trackerForm.reset();
});

clearTrackerBtn.addEventListener("click", () => {
  localStorage.removeItem(TRACKER_KEY);
  renderTracker();
});

renderTracker();
