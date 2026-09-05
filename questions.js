(() => {
"use strict";

const { getSourceIds, getQuestions, hasCorrection, isNeutralized, cleanAnswers, evaluateQuestion, summarize } = window.QcmCore;

const $ = id => document.getElementById(id);
const storagePrefix = "sarahroyon-qcm-v1:";
const numberFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const statusLabels = { correct: "Bonne réponse", incorrect: "Réponse incorrecte", skipped: "Sans réponse", pending: "Corrigé à venir", partial: "Réponse partielle", neutralized: "Question neutralisée" };
let base;
let session;
let observer;
const cards = new Map();
const indexLinks = new Map();

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function sourceTitle(source) {
  return source.titre || (source.cadre === "Orient" ? "Cadre d’Orient" : "Cadre général");
}

function formatPoints(points) {
  return (points > 0 ? "+" : "") + numberFormat.format(points) + " pt";
}

function readSaved(sourceId, questions) {
  try {
    const saved = JSON.parse(localStorage.getItem(storagePrefix + sourceId));
    return { answers: cleanAnswers(questions, saved?.answers), reviewed: saved?.reviewed === true };
  } catch {
    return { answers: cleanAnswers(questions, null), reviewed: false };
  }
}

function saveSession() {
  try {
    localStorage.setItem(storagePrefix + session.sourceId, JSON.stringify({ answers: session.answers, reviewed: session.reviewed }));
    $("save-status").textContent = "Vos choix sont sauvegardés dans ce navigateur.";
  } catch {
    $("save-status").textContent = "La sauvegarde locale est indisponible. Gardez cette page ouverte pour conserver vos choix.";
  }
}

function updateStartButton() {
  const selected = $("source-form").querySelector("input:checked");
  if (!selected) return;
  const saved = readSaved(selected.value, getQuestions(base, selected.value));
  const started = saved.reviewed || Object.values(saved.answers).some(answers => answers.length);
  $("source-form").querySelector("button[type=submit]").textContent = started ? "Reprendre le QCM →" : "Commencer le QCM →";
}

function loadLocalData() {
  if (window.QcmAnnales) return Promise.resolve(window.QcmAnnales);
  return new Promise((resolve, reject) => {
    // Classic scripts can load adjacent files when the HTML is opened directly.
    const script = document.createElement("script");
    script.src = "./data/annales/questions-europeennes-2026.js";
    script.onload = () => {
      script.remove();
      if (window.QcmAnnales) resolve(window.QcmAnnales);
      else reject(new Error("Annales locales indisponibles"));
    };
    script.onerror = () => {
      script.remove();
      reject(new Error("Annales locales introuvables"));
    };
    document.head.append(script);
  });
}

async function readQuestionBank() {
  if (location.protocol === "file:") return loadLocalData();
  const response = await fetch("./data/annales/questions-europeennes-2026.json");
  if (!response.ok) throw new Error("Annales indisponibles");
  return response.json();
}

async function loadData() {
  $("load-error").hidden = true;
  $("loading").hidden = false;
  $("source-form").hidden = true;
  try {
    const data = await readQuestionBank();
    if (!Array.isArray(data.questions) || !data.sources || !data.baremes) {
      throw new Error("Format des questions invalide");
    }
    const sourceIds = getSourceIds(data);
    if (!sourceIds.length || !sourceIds.every(id => data.baremes[data.sources[id].bareme])) {
      throw new Error("Sources des questions invalides");
    }
    base = data;
    $("official-source-options").replaceChildren();
    $("training-source-options").replaceChildren();
    for (const [index, sourceId] of sourceIds.entries()) {
      const source = base.sources[sourceId];
      const questions = getQuestions(base, sourceId);
      const corrected = questions.filter(hasCorrection).length;
      const neutralized = questions.filter(isNeutralized).length;
      const available = corrected + neutralized;
      const label = element("label", "source-option");
      const input = element("input");
      input.type = "radio";
      input.name = "source";
      input.value = sourceId;
      input.checked = index === 0;
      input.required = true;
      const personal = source.type === "creation";
      const sample = source.type === "sujet_zero";
      label.append(element("span", "source-code", personal ? source.code_concours || "Entraînement" : source.code_concours + " · " + (sample ? "Sujet V0" : source.annee_concours)), input,
        element("span", "source-title", sourceTitle(source)),
        element("span", "source-details", (personal ? source.auteur : sample ? "Sujet fictif officiel · Concours externe" : "Annale · Concours externe") + " · " + questions.length + " questions"),
        element("span", "source-status", available ? available + " corrigés disponibles sur " + questions.length
          + (neutralized ? " · " + neutralized + " questions neutralisées" : "") : "Corrigés à venir · entraînement libre"));
      $(personal ? "training-source-options" : "official-source-options").append(label);
    }
    $("official-sources").hidden = !$("official-source-options").children.length;
    $("training-sources").hidden = !$("training-source-options").children.length;
    $("source-form").hidden = false;
    updateStartButton();
  } catch {
    $("load-error-message").textContent = location.protocol === "file:"
      ? "Les sujets locaux n’ont pas pu être chargés. Ouvrez la page depuis le dossier complet du site, avec son sous-dossier data, puis réessayez."
      : "Les sujets n’ont pas pu être chargés. Vérifiez votre connexion, puis réessayez.";
    $("load-error").hidden = false;
  } finally {
    $("loading").hidden = true;
  }
}

function makeQuestion(question) {
  const card = element("article", "question-card");
  card.id = question.id;
  card.setAttribute("aria-labelledby", question.id + "-legend");
  const top = element("div", "question-topline");
  const clear = element("button", "clear-answer", "Effacer le choix");
  clear.type = "button";
  clear.setAttribute("aria-label", "Effacer la réponse à la question " + question.source.numero);
  clear.addEventListener("click", () => {
    if (session.reviewed) return;
    session.answers[question.id] = [];
    card.querySelectorAll("input").forEach(input => { input.checked = false; });
    updateProgress();
    saveSession();
  });
  top.append(element("span", "question-number", "Question " + String(question.source.numero).padStart(2, "0")), clear);
  const fieldset = element("fieldset", "question-fieldset");
  const legend = element("legend", "", question.enonce);
  legend.id = question.id + "-legend";
  legend.tabIndex = -1;
  const choices = element("div", "choices");
  for (const [letter, text] of Object.entries(question.choix)) {
    const label = element("label", "choice");
    const input = element("input");
    input.type = session.source.mode_reponse_qcm === "une_seule" ? "radio" : "checkbox";
    input.name = question.id;
    input.value = letter;
    input.checked = session.answers[question.id].includes(letter);
    input.addEventListener("change", () => {
      session.answers[question.id] = Array.from(choices.querySelectorAll("input:checked"), choice => choice.value);
      updateProgress();
      saveSession();
    });
    label.append(input, element("span", "choice-letter", letter.toUpperCase() + "."), element("span", "choice-text", text));
    choices.append(label);
  }
  fieldset.append(legend, choices);
  const feedback = element("div", "feedback");
  feedback.hidden = true;
  card.append(top, fieldset, feedback);
  cards.set(question.id, card);
  return card;
}

function setCurrentQuestion(id) {
  for (const [questionId, link] of indexLinks) {
    if (questionId === id) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}

function setIndexExpanded(expanded) {
  $("sidebar").classList.toggle("is-collapsed", !expanded);
  $("toggle-index").setAttribute("aria-expanded", String(expanded));
  $("toggle-index").textContent = expanded ? "Replier l’index ↑" : "Afficher l’index ↓";
}

function observeQuestions() {
  observer?.disconnect();
  if (!("IntersectionObserver" in window)) return;
  const visible = new Set();
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    const first = [...visible].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
    if (first) setCurrentQuestion(first.id);
  }, { rootMargin: "-20px 0px -45% 0px", threshold: 0 });
  for (const card of cards.values()) observer.observe(card);
}

function startQuiz(sourceId) {
  const source = base.sources[sourceId];
  const questions = getQuestions(base, sourceId);
  session = { sourceId, source, questions, bareme: base.baremes[source.bareme], ...readSaved(sourceId, questions) };
  observer?.disconnect();
  cards.clear();
  indexLinks.clear();
  $("question-cards").replaceChildren();
  $("question-index").replaceChildren();
  setIndexExpanded(false);
  $("quiz-eyebrow").textContent = source.type === "creation"
    ? sourceTitle(source) + " · Entraînement personnel · " + source.auteur
    : source.type === "sujet_zero"
      ? sourceTitle(source) + " · " + source.code_concours + " · Sujet fictif · Externe"
      : sourceTitle(source) + " · " + source.code_concours + " " + source.annee_concours + " · Externe";
  $("answer-instructions").textContent = source.mode_reponse_qcm === "une_seule"
    ? "Une seule réponse est possible par question. Choisissez votre réponse ; vous pourrez la modifier avant de terminer."
    : source.mode_reponse_qcm === "une_ou_plusieurs"
      ? "Une ou plusieurs réponses sont possibles. Cochez vos choix ; vous pourrez les modifier avant de terminer."
      : "Cochez vos choix. Le sujet ne précise pas le nombre de réponses possibles ; plusieurs cases peuvent être sélectionnées.";
  const corrected = questions.filter(hasCorrection).length;
  const neutralized = questions.filter(isNeutralized).length;
  const available = corrected + neutralized;
  $("correction-availability").textContent = available
    ? available + " questions sur " + questions.length + " disposent d’un corrigé."
      + (neutralized ? " " + neutralized + " questions ambiguës ou sans proposition exacte sont neutralisées ; leur corrigé explique pourquoi." : "")
      + (Number.isFinite(session.bareme.bonne_reponse)
        ? " Le score portera uniquement sur les questions disposant d’une réponse vérifiable et d’un barème."
        : " Le sujet ne précise pas de barème : les réponses sont vérifiées sans note chiffrée.")
    : "Les corrigés de ce sujet ne sont pas encore disponibles. Vous pouvez vous entraîner et conserver vos choix, sans note pour le moment.";
  $("annale-link").href = source.url;
  $("progress").max = questions.length;
  for (const question of questions) {
    $("question-cards").append(makeQuestion(question));
    const item = element("li");
    const link = element("a", "index-link");
    link.href = "#" + question.id;
    link.append(element("span", "", String(question.source.numero)), element("span", "index-answer"));
    link.addEventListener("click", event => {
      event.preventDefault();
      if (window.matchMedia("(max-width: 780px)").matches) setIndexExpanded(false);
      const card = cards.get(question.id);
      card.querySelector("legend").focus({ preventScroll: true });
      card.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      setCurrentQuestion(question.id);
    });
    indexLinks.set(question.id, link);
    item.append(link);
    $("question-index").append(item);
  }
  $("setup").hidden = true;
  $("quiz").hidden = false;
  renderReview();
  observeQuestions();
  saveSession();
  $("quiz-title").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
}

function updateProgress() {
  const answered = session.questions.filter(question => session.answers[question.id].length > 0).length;
  const total = session.questions.length;
  $("progress").value = answered;
  $("progress-fraction").textContent = answered + " / " + total;
  $("progress-text").textContent = answered + (answered > 1 ? " questions renseignées" : " question renseignée");
  const remaining = total - answered;
  $("end-message").textContent = session.reviewed ? "Vous pouvez reprendre vos réponses depuis le bouton « Modifier mes réponses »."
    : remaining ? remaining + (remaining > 1 ? " questions encore sans réponse." : " question encore sans réponse.") : "Toutes les questions sont renseignées. À vous de terminer !";
  for (const question of session.questions) {
    const selected = session.answers[question.id];
    const link = indexLinks.get(question.id);
    const result = session.reviewed ? evaluateQuestion(question, selected, session.bareme) : null;
    link.classList.toggle("answered", selected.length > 0);
    link.classList.toggle("incorrect", result?.status === "incorrect");
    link.querySelector(".index-answer").textContent = selected.map(letter => letter.toUpperCase()).join("");
    const label = "Question " + question.source.numero + ", " + (selected.length ? "choix " + selected.join(", ").toUpperCase() : "sans réponse")
      + (result ? ", " + statusLabels[result.status].toLowerCase() : "");
    link.setAttribute("aria-label", label);
    link.title = label;
    const clear = cards.get(question.id).querySelector(".clear-answer");
    clear.disabled = session.reviewed || selected.length === 0;
    clear.hidden = session.reviewed;
  }
}

function renderFeedback(question, result) {
  const card = cards.get(question.id);
  const feedback = card.querySelector(".feedback");
  feedback.replaceChildren();
  feedback.className = "feedback " + result.status;
  feedback.append(element("p", "feedback-heading", statusLabels[result.status] + (result.points !== null ? " · " + formatPoints(result.points) : " · Non notée")));
  if (result.status === "pending") {
    feedback.append(element("p", "muted", "Le corrigé de cette question sera ajouté prochainement. Elle n’entre pas dans le calcul des points."));
    return;
  }
  const correction = question.correction;
  if (result.status === "neutralized") {
    feedback.append(element("p", "", "Cette question est exclue du bilan des bonnes et mauvaises réponses et du calcul des points, quel que soit votre choix."));
  } else {
    feedback.append(element("p", "", (correction.reponses.length > 1 ? "Réponses attendues : " : "Réponse attendue : ") + correction.reponses.map(letter => letter.toUpperCase()).join(", ") + "."));
  }
  if (result.status === "partial" && result.points === null) {
    feedback.append(element("p", "", "Votre sélection est incomplète. Le sujet ne précise pas le barème de ce cas : cette question est exclue du score."));
  }
  if (correction.explication) feedback.append(element("p", "", correction.explication));
  if (correction.sources?.length) {
    const references = element("ul");
    for (const source of correction.sources) {
      if (!/^https?:\/\//i.test(source.url)) continue;
      const item = element("li");
      const link = element("a", "", source.titre);
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      item.append(link);
      references.append(item);
    }
    feedback.append(references);
  }
}

function renderResults() {
  const summary = summarize(session.questions, session.answers, session.bareme);
  $("results-title").textContent = summary.graded
    ? numberFormat.format(summary.score) + " / " + numberFormat.format(summary.maximum) + " points"
    : "Entraînement terminé";
  $("results-description").textContent = summary.graded
    ? "Ce bilan porte sur " + summary.graded + " questions notées sur " + session.questions.length + "."
      + (summary.pending ? " Les " + summary.pending + " questions sans corrigé sont exclues du score." : "")
      + (summary.partial ? " Les sélections partielles sont signalées dans les corrections." : "")
    : "Vos choix sont conservés. Aucune note ne peut être calculée pour cette séance avec les corrigés et le barème disponibles.";
  if (summary.neutralized) {
    $("results-description").textContent += " " + summary.neutralized + " questions sont neutralisées et expliquées dans le corrigé ; elles ne comptent ni comme bonnes ni comme mauvaises réponses.";
  }
  const stats = $("result-stats");
  stats.replaceChildren();
  stats.hidden = session.questions.length === summary.pending;
  const counts = [["Bonnes réponses", summary.correct], ["Réponses incorrectes", summary.incorrect], ["Sans réponse", summary.skipped]];
  if (summary.partial) counts.push(["Réponses partielles", summary.partial]);
  if (summary.neutralized) counts.push(["Questions neutralisées", summary.neutralized]);
  for (const [label, value] of counts) {
    const group = element("div");
    group.append(element("dt", "", label), element("dd", "", String(value)));
    stats.append(group);
  }
  $("score-explanation").hidden = !summary.graded;
  $("score-explanation").textContent = "Barème par question : " + formatPoints(session.bareme.bonne_reponse) + " pour une réponse exacte, "
    + formatPoints(session.bareme.mauvaise_reponse) + " pour une réponse incorrecte et " + formatPoints(session.bareme.absence_de_reponse) + " sans réponse.";
}

function renderReview() {
  $("results").hidden = !session.reviewed;
  $("finish").hidden = session.reviewed;
  $("finish-bottom").hidden = session.reviewed;
  $("edit").hidden = !session.reviewed;
  for (const question of session.questions) {
    const card = cards.get(question.id);
    const result = session.reviewed ? evaluateQuestion(question, session.answers[question.id], session.bareme) : null;
    card.querySelectorAll("input").forEach(input => {
      input.disabled = session.reviewed;
      input.closest("label").classList.toggle("correct-choice", session.reviewed && hasCorrection(question) && question.correction.reponses.includes(input.value));
      input.closest("label").classList.toggle("wrong-choice", session.reviewed && hasCorrection(question) && input.checked && !question.correction.reponses.includes(input.value));
    });
    const feedback = card.querySelector(".feedback");
    feedback.hidden = !session.reviewed;
    if (session.reviewed) renderFeedback(question, result);
    else feedback.replaceChildren();
  }
  if (session.reviewed) renderResults();
  updateProgress();
}

$("source-form").addEventListener("change", updateStartButton);
$("toggle-index").addEventListener("click", () => {
  setIndexExpanded($("toggle-index").getAttribute("aria-expanded") !== "true");
});
$("source-form").addEventListener("submit", event => {
  event.preventDefault();
  const selected = $("source-form").querySelector("input:checked");
  if (base && selected) startQuiz(selected.value);
});
$("quiz-form").addEventListener("submit", event => {
  event.preventDefault();
  if (!session || session.reviewed) return;
  session.reviewed = true;
  renderReview();
  saveSession();
  $("results-title").focus({ preventScroll: true });
  $("results").scrollIntoView({ block: "start" });
});
$("edit").addEventListener("click", () => {
  session.reviewed = false;
  renderReview();
  saveSession();
  $("quiz-title").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
});
$("change-source").addEventListener("click", () => {
  saveSession();
  observer?.disconnect();
  $("quiz").hidden = true;
  $("setup").hidden = false;
  updateStartButton();
  $("setup-title").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
});
$("retry").addEventListener("click", loadData);
loadData();
})();
