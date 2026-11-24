// DRuf – Antwort-Engine (offline). Vergleicht Stichwörter mit der Frage und
// liefert den besten Treffer aus der eigenen Wissensdatenbank.
// Merkt sich das letzte Thema pro Bereich, damit Folgesätze funktionieren.

const VORLAGEN = Object.assign({}, require("./vorlagen.js"), require("./vorlagen-extra.js"));
const KB = require("./knowledge.js").concat(require("./extra.js")).map((e) =>
  VORLAGEN[e.id] ? { ...e, vorlage: VORLAGEN[e.id] } : e
);

const lastTopic = {}; // mode -> zuletzt gewählter Eintrag

// Wörter, die auf "ich will eine fertige Vorlage / Antwort" hindeuten
const WANT_TEXT = [
  "schreib", "schreibe", "schreiben", "erstell", "erstelle", "erstellen",
  "mach", "mache", "machen", "vorlage", "text", "ja", "bitte", "die", "das", "den",
  "weiter", "ausführlich", "genauer", "dazu",
];

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

function keywordWeight(keyword) {
  // Längere, genauere Stichwörter zählen mehr
  if (keyword.length >= 10) return 5;
  if (keyword.length >= 6) return 3;
  if (keyword.length >= 4) return 2;
  return 1;
}

// Allgemeine Sammel-Einträge zählen schwächer, damit spezifische Treffer gewinnen
const WEAK = new Set(["bewerbung-allgemein"]);

function scoreEntry(entry, text) {
  let score = 0;
  for (const keyword of entry.keywords) {
    if (keywordHit(keyword, text)) score += keywordWeight(keyword);
  }
  return WEAK.has(entry.id) ? score * 0.5 : score;
}

function wantsText(text) {
  const words = text.split(/[^a-zäöüß]+/).filter(Boolean);
  return words.some((w) => WANT_TEXT.includes(w));
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

  // Folgesatz ohne neues Thema: letztes Thema weiterführen
  if (!best && lastTopic[mode] && wantsText(text)) {
    const prev = lastTopic[mode];
    if (prev.vorlage && wantsText(text)) return { text: prev.vorlage };
    return { text: prev.answer };
  }

  if (best) {
    lastTopic[mode] = best;
    if (best.vorlage && wantsText(text)) return { text: best.vorlage };
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
