// DRuf – Antwort-Engine (offline). Vergleicht Stichwörter mit der Frage und
// liefert den besten Treffer aus der eigenen Wissensdatenbank.

const KB = require("./knowledge.js");

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
}

function keywordHit(keyword, text) {
  // Kurze Stichwörter (z. B. "hi", "tp") nur als ganze Wörter zählen
  if (keyword.length <= 3) {
    const pattern = new RegExp("(^|[^a-z0-9äöüß])" + escapeRegex(keyword) + "([^a-z0-9äöüß]|$)");
    return pattern.test(text);
  }
  return text.includes(keyword);
}

function scoreEntry(entry, text) {
  let score = 0;
  for (const keyword of entry.keywords) {
    if (keywordHit(keyword, text)) {
      // Längere, genauere Stichwörter zählen mehr
      score += keyword.length >= 6 ? 3 : keyword.length >= 4 ? 2 : 1;
    }
  }
  return score;
}

function topicsFor(mode) {
  return KB.filter((e) => e.mode === mode || e.mode === "alle")
    .slice(0, 8)
    .map((e) => e.keywords[0]);
}

function answer(mode, question) {
  const text = normalize(question);
  if (!text) {
    return { text: "Bitte schreib eine Frage oder ein Stichwort." };
  }

  let best = null;
  let bestScore = 0;
  for (const entry of KB) {
    if (entry.mode !== mode && entry.mode !== "alle") continue;
    const score = scoreEntry(entry, text);
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }

  if (best) {
    return { text: best.answer };
  }

  const beispiele = topicsFor(mode).join(", ");
  return {
    text:
      "Dazu habe ich in meiner Wissensdatenbank noch keine passende Antwort.\n\n" +
      "Versuch es mit einem dieser Stichwörter: " +
      beispiele +
      ".\n\nOder beschreib dein Problem genauer, dann suche ich nach einem passenden Thema.",
  };
}

module.exports = { answer, normalize };
