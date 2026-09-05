window.QcmCore = (() => {
"use strict";

function getSourceIds(base) {
  return Object.keys(base.sources).filter(sourceId => getQuestions(base, sourceId).length > 0);
}

function getQuestions(base, sourceId) {
  return base.questions
    .filter(question => question.type === "qcm" && question.source.id === sourceId)
    .sort((a, b) => a.source.numero - b.source.numero);
}

function hasCorrection(question) {
  const correction = question.correction;
  return Array.isArray(correction?.reponses) && correction.reponses.length > 0
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

function evaluateQuestion(question, selected, bareme) {
  if (!hasCorrection(question)) return { status: "pending", points: null };
  if (selected.length === 0) return { status: "skipped", points: bareme.absence_de_reponse };
  const correct = question.correction.reponses;
  const containsWrongAnswer = selected.some(letter => !correct.includes(letter));
  if (!containsWrongAnswer && selected.length === correct.length) {
    return { status: "correct", points: bareme.bonne_reponse };
  }
  if (!containsWrongAnswer) {
    // The annales do not specify how to score a strictly partial correct selection.
    return { status: "partial", points: Number.isFinite(bareme.selection_partielle) ? bareme.selection_partielle : null };
  }
  return { status: "incorrect", points: bareme.mauvaise_reponse };
}

function summarize(questions, answers, bareme) {
  const results = questions.map(question => evaluateQuestion(question, answers[question.id] || [], bareme));
  const graded = results.filter(result => result.points !== null);
  return {
    results,
    score: Math.round(graded.reduce((sum, result) => sum + result.points, 0) * 100) / 100,
    maximum: Math.round(graded.length * bareme.bonne_reponse * 100) / 100,
    graded: graded.length,
    correct: results.filter(result => result.status === "correct").length,
    incorrect: results.filter(result => result.status === "incorrect").length,
    skipped: results.filter(result => result.status === "skipped").length,
    partial: results.filter(result => result.status === "partial").length,
    pending: results.filter(result => result.status === "pending").length
  };
}

return { getSourceIds, getQuestions, hasCorrection, cleanAnswers, evaluateQuestion, summarize };
})();
