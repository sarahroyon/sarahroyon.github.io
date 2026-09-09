window.QcmCore = (() => {
"use strict";

const quizBareme = Object.freeze({ bonne_reponse: 1, mauvaise_reponse: 0, absence_de_reponse: 0, selection_partielle: 0 });

function getSourceIds(base) {
  return Object.keys(base.sources).filter(sourceId => base.sources[sourceId].type !== "thematique" && getQuestions(base, sourceId).length > 0);
}

function getQuestions(base, sourceId) {
  return base.questions
    .filter(question => question.type === "qcm" && question.source.id === sourceId)
    .sort((a, b) => a.source.numero - b.source.numero);
}

function getCategoryQuestions(base, categoryId) {
  const category = base.categories?.find(item => item.id === categoryId);
  if (!category) return [];
  const ids = new Set(category.question_ids);
  return base.questions.filter(question => question.type === "qcm" && ids.has(question.id));
}

function drawQuestions(base, count, categoryId) {
  const questions = categoryId === undefined
    ? base.questions.filter(question => question.type === "qcm")
    : getCategoryQuestions(base, categoryId);
  if (!Number.isInteger(count) || count < 1 || count > questions.length) {
    throw new RangeError("Nombre de questions invalide");
  }
  // Partial Fisher–Yates: every remaining question has the same chance at each draw.
  for (let index = 0; index < count; index++) {
    const picked = index + Math.floor(Math.random() * (questions.length - index));
    [questions[index], questions[picked]] = [questions[picked], questions[index]];
  }
  return questions.slice(0, count);
}

function isNeutralized(question) {
  return question.type === "qcm" && question.correction?.neutralisee === true;
}

function hasCorrection(question) {
  const correction = question.correction;
  return !isNeutralized(question) && Array.isArray(correction?.reponses) && correction.reponses.length > 0
    && correction.reponses.every(letter => Object.hasOwn(question.choix, letter))
    && new Set(correction.reponses).size === correction.reponses.length;
}

function cleanAnswers(questions, answers) {
  const clean = {};
  for (const question of questions) {
    const selected = answers && Object.hasOwn(answers, question.id) ? answers[question.id] : [];
    clean[question.id] = Array.isArray(selected)
      ? [...new Set(selected.filter(letter => Object.hasOwn(question.choix, letter)))].sort()
      : [];
  }
  return clean;
}

function evaluateQuestion(question, selected) {
  const bareme = quizBareme;
  if (isNeutralized(question)) return { status: "neutralized", points: null };
  if (!hasCorrection(question)) return { status: "pending", points: null };
  if (selected.length === 0) return { status: "skipped", points: bareme.absence_de_reponse };
  const correct = question.correction.reponses;
  const containsWrongAnswer = selected.some(letter => !correct.includes(letter));
  if (!containsWrongAnswer && selected.length === correct.length) {
    return { status: "correct", points: bareme.bonne_reponse };
  }
  if (!containsWrongAnswer) {
    return { status: "partial", points: bareme.selection_partielle };
  }
  return { status: "incorrect", points: bareme.mauvaise_reponse };
}

function summarize(questions, answers) {
  const results = questions.map(question => evaluateQuestion(question, answers[question.id] || []));
  const graded = results.filter(result => result.points !== null);
  return {
    results,
    score: Math.round(graded.reduce((sum, result) => sum + result.points, 0) * 100) / 100,
    maximum: graded.length * quizBareme.bonne_reponse,
    graded: graded.length,
    correct: results.filter(result => result.status === "correct").length,
    incorrect: results.filter(result => result.status === "incorrect").length,
    skipped: results.filter(result => result.status === "skipped").length,
    partial: results.filter(result => result.status === "partial").length,
    pending: results.filter(result => result.status === "pending").length,
    neutralized: results.filter(result => result.status === "neutralized").length
  };
}

return { quizBareme, getSourceIds, getQuestions, getCategoryQuestions, drawQuestions, hasCorrection, isNeutralized, cleanAnswers, evaluateQuestion, summarize };
})();
