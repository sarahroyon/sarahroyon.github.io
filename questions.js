(() => {
"use strict";

const { getSourceIds, getQuestions, getCategoryQuestions, drawQuestions, hasCorrection, isNeutralized, cleanAnswers, evaluateQuestion, summarize } = window.QcmCore;

const $ = id => document.getElementById(id);
const storagePrefix = "sarahroyon-qcm-v1:";
const randomSourceId = "aleatoire";
const randomSource = { type: "aleatoire", titre: "Quiz aléatoire" };
const randomBareme = { bonne_reponse: null, mauvaise_reponse: null, absence_de_reponse: null, selection_partielle: null };
const numberFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
const statusLabels = { correct: "Bonne réponse", incorrect: "Réponse incorrecte", skipped: "Sans réponse", pending: "Corrigé à venir", partial: "Réponse partielle", neutralized: "Question neutralisée" };
let base;
let session;
let observer;
const drawSaved = new Map();
const categoryCounts = new Map();
let selectedCategory;
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

function sourceYear(source) {
  return source.type === "sujet_zero"
    ? source.date_creation_pdf?.slice(0, 4) || ""
    : source.annee_concours || "";
}

function formatPoints(points) {
  return (points > 0 ? "+" : "") + numberFormat.format(points) + " pt";
}

function categoryFor(sourceId) {
  return sourceId.startsWith("categorie:") ? base.categories.find(category => sourceId === "categorie:" + category.id) : undefined;
}

function isGenerated(sourceId) {
  return sourceId === randomSourceId || Boolean(categoryFor(sourceId));
}

function drawPool(sourceId) {
  const category = categoryFor(sourceId);
  return category ? getCategoryQuestions(base, category.id) : base.questions.filter(question => question.type === "qcm");
}

function countInput(sourceId) {
  return $(categoryFor(sourceId) ? "category-count" : "random-count");
}

function readStored(sourceId) {
  try {
    return JSON.parse(localStorage.getItem(storagePrefix + sourceId));
  } catch {
    return null;
  }
}

function readSaved(sourceId, questions) {
  const saved = isGenerated(sourceId) ? drawSaved.get(sourceId) : readStored(sourceId);
  return { answers: cleanAnswers(questions, saved?.answers), reviewed: saved?.reviewed === true };
}

function getSavedDraw(sourceId) {
  const ids = drawSaved.get(sourceId)?.questionIds;
  if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length) return [];
  const questionsById = new Map(drawPool(sourceId).map(question => [question.id, question]));
  const questions = ids.map(id => questionsById.get(id));
  return questions.every(Boolean) ? questions : [];
}

function saveSession() {
  const saved = { answers: session.answers, reviewed: session.reviewed };
  if (isGenerated(session.sourceId)) {
    saved.questionIds = session.questions.map(question => question.id);
    drawSaved.set(session.sourceId, saved);
  }
  try {
    localStorage.setItem(storagePrefix + session.sourceId, JSON.stringify(saved));
    $("save-status").textContent = "Vos choix sont sauvegardés dans ce navigateur.";
  } catch {
    $("save-status").textContent = "La sauvegarde locale est indisponible. Gardez cette page ouverte pour conserver vos choix.";
  }
}

function updateStartButton() {
  const selected = $("source-form").querySelector("input:checked");
  if (!selected) return;
  const random = selected.value === randomSourceId;
  const category = categoryFor(selected.value);
  $("random-settings").hidden = !random;
  $("random-count").disabled = !random;
  $("category-settings").hidden = !category;
  $("category-count").disabled = !category;
  if (category) {
    const size = getCategoryQuestions(base, category.id).length;
    if (selectedCategory !== category.id) {
      $("category-count").value = categoryCounts.get(category.id) ?? (getSavedDraw(selected.value).length || Math.min(20, size));
      selectedCategory = category.id;
    }
    $("category-count").max = size;
    $("category-count-help").textContent = category.titre + " : de 1 à " + size + " questions, tirées au hasard sans répétition. Vous pourrez régénérer le quiz.";
  }
  if (random || category) {
    const questions = getSavedDraw(selected.value);
    const resumable = questions.length > 0 && questions.length === countInput(selected.value).valueAsNumber;
    $("source-form").querySelector("button[type=submit]").textContent = resumable ? "Reprendre le quiz →" : "Générer le quiz →";
  } else {
    const saved = readSaved(selected.value, getQuestions(base, selected.value));
    const started = saved.reviewed || Object.values(saved.answers).some(answers => answers.length);
    $("source-form").querySelector("button[type=submit]").textContent = started ? "Reprendre le QCM →" : "Commencer le QCM →";
  }
}

function loadLocalData(path, globalName) {
  if (window[globalName]) return Promise.resolve(window[globalName]);
  return new Promise((resolve, reject) => {
    // Classic scripts can load adjacent files when the HTML is opened directly.
    const script = document.createElement("script");
    script.src = path + ".js";
    script.onload = () => {
      script.remove();
      if (window[globalName]) resolve(window[globalName]);
      else reject(new Error("Annales locales indisponibles"));
    };
    script.onerror = () => {
      script.remove();
      reject(new Error("Annales locales introuvables"));
    };
    document.head.append(script);
  });
}

async function readQuestionBank(path, globalName) {
  if (location.protocol === "file:") return loadLocalData(path, globalName);
  const response = await fetch(path + ".json");
  if (!response.ok) throw new Error("Annales indisponibles");
  return response.json();
}

async function loadData() {
  $("load-error").hidden = true;
  $("loading").hidden = false;
  $("source-form").hidden = true;
  try {
    const [annales, themes] = await Promise.all([
      readQuestionBank("./data/annales/questions-europeennes-2026", "QcmAnnales"),
      readQuestionBank("./data/categories/questions-europeennes", "QcmCategories")
    ]);
    const data = { ...annales, sources: { ...annales.sources, ...themes.sources },
      questions: [...annales.questions, ...themes.questions], categories: themes.categories };
    if (!Array.isArray(data.questions) || !data.sources || !data.baremes) {
      throw new Error("Format des questions invalide");
    }
    const sourceIds = getSourceIds(data);
    if (!sourceIds.length || !sourceIds.every(id => data.baremes[data.sources[id].bareme])) {
      throw new Error("Sources des questions invalides");
    }
    base = data;
    if (!Array.isArray(base.categories) || base.categories.length !== 5 || new Set(base.questions.map(question => question.id)).size !== base.questions.length
        || !base.categories.every(category => {
          const questions = getCategoryQuestions(base, category.id);
          return questions.length === 75 && category.question_ids.length === 75 && questions.every(hasCorrection);
        })) throw new Error("Catégories invalides");
    drawSaved.clear();
    categoryCounts.clear();
    selectedCategory = undefined;
    for (const sourceId of [randomSourceId, ...base.categories.map(category => "categorie:" + category.id)]) {
      drawSaved.set(sourceId, readStored(sourceId));
    }
    const poolSize = base.questions.filter(question => question.type === "qcm").length;
    $("random-source").checked = false;
    $("random-count").max = poolSize;
    $("random-count").value = getSavedDraw(randomSourceId).length || Math.min(20, poolSize);
    $("random-source-details").textContent = poolSize + " questions disponibles · Nombre de questions au choix";
    $("random-count-help").textContent = "De 1 à " + poolSize + " questions. Vous pourrez régénérer le quiz pour obtenir un nouveau tirage.";
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
      const year = sourceYear(source);
      label.append(element("span", "source-code", personal ? source.code_concours || "Entraînement" : source.code_concours + (year ? " · " + year : "")), input,
        element("span", "source-title", sourceTitle(source)),
        element("span", "source-details", (personal ? source.auteur : sample ? "Sujet fictif officiel · Concours externe" : "Annale · Concours externe") + " · " + questions.length + " questions"));
      label.append(element("span", "source-status", available ? available + " corrigés disponibles sur " + questions.length
          + (neutralized ? " · " + neutralized + " questions neutralisées" : "") : "Corrigés à venir · entraînement libre"));
      $(personal ? "training-source-options" : "official-source-options").append(label);
    }
    $("official-sources").hidden = !$("official-source-options").children.length;
    $("training-sources").hidden = !$("training-source-options").children.length;
    $("category-source-options").replaceChildren();
    for (const [index, category] of base.categories.entries()) {
      const label = element("label", "source-option");
      const input = element("input");
      input.type = "radio";
      input.name = "source";
      input.value = "categorie:" + category.id;
      input.required = true;
      input.setAttribute("aria-controls", "category-settings");
      label.append(element("span", "source-code", "Catégorie " + (index + 1)), input,
        element("span", "source-title", category.titre), element("span", "source-details", category.description),
        element("span", "source-status", getCategoryQuestions(base, category.id).length + " questions corrigées · Nombre au choix"));
      $("category-source-options").append(label);
    }
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

function makeQuestion(question, number) {
  const source = base.sources[question.source.id];
  const card = element("article", "question-card");
  card.id = question.id;
  card.setAttribute("aria-labelledby", question.id + "-legend");
  const top = element("div", "question-topline");
  const clear = element("button", "clear-answer", "Effacer le choix");
  clear.type = "button";
  clear.setAttribute("aria-label", "Effacer la réponse à la question " + number);
  clear.addEventListener("click", () => {
    if (session.reviewed) return;
    session.answers[question.id] = [];
    card.querySelectorAll("input").forEach(input => { input.checked = false; });
    updateProgress();
    saveSession();
  });
  top.append(element("span", "question-number", "Question " + String(number).padStart(2, "0")), clear);
  card.append(top);
  if (isGenerated(session.sourceId)) {
    const year = sourceYear(source);
    card.append(element("p", "question-context small muted", sourceTitle(source) + (year ? " · " + year : "")
      + " · Question " + question.source.numero + " · "
      + (source.mode_reponse_qcm === "une_seule" ? "Une seule réponse possible." : "Plusieurs choix peuvent être cochés.")));
    const date = source.date_epreuve || source.date_creation_pdf;
    const context = source.type === "thematique" ? "Question originale d’entraînement."
      : date ? "Contexte du sujet : " + new Date(date + "T12:00:00").toLocaleDateString("fr-FR") + ". Répondez à cette date, sauf précision dans l’énoncé." : "";
    if (context) card.append(element("p", "question-context small muted", context));
  }
  const fieldset = element("fieldset", "question-fieldset");
  const legend = element("legend", "", question.enonce);
  legend.id = question.id + "-legend";
  legend.tabIndex = -1;
  const choices = element("div", "choices");
  for (const [letter, text] of Object.entries(question.choix)) {
    const label = element("label", "choice");
    const input = element("input");
    input.type = source.mode_reponse_qcm === "une_seule" ? "radio" : "checkbox";
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
  card.append(fieldset, feedback);
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

function startQuiz(sourceId, regenerate = false) {
  const category = categoryFor(sourceId);
  const random = isGenerated(sourceId);
  const source = category ? { type: "categorie", titre: category.titre } : random ? randomSource : base.sources[sourceId];
  const year = sourceYear(source);
  let questions;
  let saved;
  if (random) {
    if (!countInput(sourceId).reportValidity()) return;
    const count = countInput(sourceId).valueAsNumber;
    const previous = getSavedDraw(sourceId);
    const resume = !regenerate && previous.length === count;
    questions = resume ? previous : drawQuestions(base, count, category?.id);
    saved = resume ? readSaved(sourceId, questions) : { answers: cleanAnswers(questions, null), reviewed: false };
  } else {
    questions = getQuestions(base, sourceId);
    saved = readSaved(sourceId, questions);
  }
  session = { sourceId, source, questions, bareme: random ? randomBareme : base.baremes[source.bareme], ...saved };
  observer?.disconnect();
  cards.clear();
  indexLinks.clear();
  $("question-cards").replaceChildren();
  $("question-index").replaceChildren();
  setIndexExpanded(false);
  $("quiz-title").textContent = category ? category.titre : random ? "Quiz aléatoire" : "Questions européennes";
  $("regenerate").hidden = !random;
  $("regenerate-help").hidden = !random;
  $("quiz-eyebrow").textContent = random ? questions.length + (questions.length > 1 ? " questions tirées au hasard" : " question tirée au hasard")
    : source.type === "creation"
    ? sourceTitle(source) + " · " + source.code_concours + " · Entraînement personnel · " + source.auteur
    : source.type === "sujet_zero"
      ? sourceTitle(source) + " · " + source.code_concours + (year ? " " + year : "") + " · Sujet fictif · Externe"
      : sourceTitle(source) + " · " + source.code_concours + " " + year + " · Externe";
  $("answer-instructions").textContent = random
    ? "Répondez aux questions dans l’ordre de votre choix. Le mode de réponse est indiqué pour chaque question ; vous pourrez modifier vos choix avant de terminer."
    : source.mode_reponse_qcm === "une_seule"
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
        ? ""
        : random ? " Les questions proviennent de sujets aux barèmes différents : les réponses sont vérifiées sans note chiffrée."
          : " Le sujet ne précise pas de barème : les réponses sont vérifiées sans note chiffrée.")
    : "Les corrigés de ce sujet ne sont pas encore disponibles. Vous pouvez vous entraîner et conserver vos choix, sans note pour le moment.";
  $("annale-link").hidden = !source.url;
  if (source.url) $("annale-link").href = source.url;
  else $("annale-link").removeAttribute("href");
  $("progress").max = questions.length;
  for (const [index, question] of questions.entries()) {
    const number = random ? index + 1 : question.source.numero;
    $("question-cards").append(makeQuestion(question, number));
    const item = element("li");
    const link = element("a", "index-link");
    link.href = "#" + question.id;
    link.append(element("span", "", String(number)), element("span", "index-answer"));
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
  for (const [index, question] of session.questions.entries()) {
    const selected = session.answers[question.id];
    const link = indexLinks.get(question.id);
    const result = session.reviewed ? evaluateQuestion(question, selected, session.bareme) : null;
    link.classList.toggle("answered", selected.length > 0);
    link.classList.toggle("incorrect", result?.status === "incorrect");
    link.querySelector(".index-answer").textContent = selected.map(letter => letter.toUpperCase()).join("");
    const number = isGenerated(session.sourceId) ? index + 1 : question.source.numero;
    const label = "Question " + number + ", " + (selected.length ? "choix " + selected.join(", ").toUpperCase() : "sans réponse")
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
    : isGenerated(session.sourceId)
      ? "Vos réponses sont vérifiées avec les corrigés disponibles. Ce quiz mélange des sujets aux barèmes différents : le bilan est présenté sans note chiffrée."
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
$("random-count").addEventListener("input", updateStartButton);
$("category-count").addEventListener("input", () => {
  if (selectedCategory) categoryCounts.set(selectedCategory, $("category-count").value);
  updateStartButton();
});
$("regenerate").addEventListener("click", () => {
  if (session && isGenerated(session.sourceId)) startQuiz(session.sourceId, true);
});
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
