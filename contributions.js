(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const form = $("contribution-form");
  const letters = ["a", "b", "c", "d"];
  const config = window.ContributionsConfig || {};
  const banks = [window.QcmAnnales, window.QcmCategories];
  const bankReady = banks.every(bank => Array.isArray(bank?.questions) && bank.sources);
  const sources = Object.assign({}, ...banks.map(bank => bank?.sources));
  const questions = banks.flatMap(bank => bank?.questions || []).filter(question => question.type === "qcm");
  const byId = new Map(questions.map(question => [question.id, question]));
  let proposalSequence = 0;
  let dirty = false;
  const configuredEmail = typeof config.recipientEmail === "string" ? config.recipientEmail.trim() : "";
  const recipient = configuredEmail.length <= 254 && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(configuredEmail) ? configuredEmail : "";

  const kind = () => form.querySelector("input[name=request-kind]:checked").value;
  const proposals = () => [...$("proposed-questions").children];
  const field = (card, name) => card.querySelector('[data-field="' + name + '"]');
  const normalize = value => value.trim().replace(/\s+/g, " ").toLocaleLowerCase("fr");
  function showError(message) {
    $("form-error").textContent = message;
    $("form-error").hidden = false;
    $("form-error").focus();
  }
  function invalidateDraft() {
    dirty = true;
    $("email-draft").hidden = true;
    $("email-message").value = "";
    $("open-mail").removeAttribute("href");
    $("copy-status").textContent = "";
  }
  function updateCount() {
    const cards = proposals();
    cards.forEach((card, index) => {
      card.querySelector("legend").textContent = "Question " + (index + 1);
      const remove = card.querySelector(".remove-question");
      remove.disabled = cards.length <= 5;
      remove.setAttribute("aria-label", "Retirer la proposition " + (index + 1));
    });
    $("question-count").textContent = cards.length + " questions proposées · Minimum 5, maximum 20";
    $("add-question").disabled = cards.length >= 20;
  }
  function addQuestion(focus = false) {
    if (proposals().length >= 20) return;
    const card = $("question-template").content.firstElementChild.cloneNode(true);
    const prefix = "proposal-" + (++proposalSequence) + "-";
    card.querySelectorAll("[data-answer]").forEach(input => { input.name = prefix + "reponse"; });
    card.querySelectorAll("[data-field]").forEach(input => { input.id = prefix + input.dataset.field; });
    card.querySelectorAll("[data-for]").forEach(label => { label.htmlFor = prefix + label.dataset.for; });
    card.querySelector(".remove-question").addEventListener("click", () => {
      if (proposals().length <= 5) return;
      const next = card.nextElementSibling || card.previousElementSibling;
      card.remove();
      invalidateDraft();
      updateCount();
      field(next, "enonce").focus();
    });
    $("proposed-questions").append(card);
    updateCount();
    if (focus) { invalidateDraft(); field(card, "enonce").focus(); }
  }
  function questionLabel(question) {
    const source = sources[question.source.id];
    return (source?.titre_court || source?.titre || question.source.id)
      + (question.source.numero ? " · Q" + question.source.numero : "") + " — " + question.enonce;
  }
  function filterQuestions() {
    const select = $("existing-question");
    const previous = select.value;
    const query = normalize($("question-search").value);
    const matches = questions.filter(question => normalize(questionLabel(question) + " " + question.id).includes(query));
    select.replaceChildren(new Option("Choisir une question", ""));
    // Keep an explicitly selected question when filtering, so a search never silently changes the target.
    const selected = byId.get(previous);
    if (selected && !matches.includes(selected)) select.add(new Option("Sélection actuelle : " + questionLabel(selected), selected.id));
    for (const question of matches) select.add(new Option(questionLabel(question), question.id));
    select.value = previous;
    $("question-search-status").textContent = bankReady
      ? matches.length + " question(s) correspondant à la recherche."
      : "La banque n’a pas pu être chargée. Rechargez la page pour demander un retrait.";
    showSelectedQuestion();
  }
  function showSelectedQuestion() {
    const question = byId.get($("existing-question").value);
    const preview = $("selected-question");
    preview.replaceChildren();
    preview.hidden = !question;
    if (!question) return;
    const title = document.createElement("p");
    title.textContent = questionLabel(question);
    const id = document.createElement("p");
    id.className = "small muted";
    id.textContent = "Identifiant : " + question.id;
    const choices = document.createElement("ul");
    for (const [letter, text] of Object.entries(question.choix)) {
      const item = document.createElement("li");
      item.textContent = letter.toUpperCase() + ". " + text;
      choices.append(item);
    }
    preview.append(title, id, choices);
  }
  function updateKind() {
    const removal = kind() === "retrait";
    $("addition-fields").hidden = removal;
    $("addition-fields").disabled = removal;
    $("removal-fields").hidden = !removal;
    $("removal-fields").disabled = !removal;
    $("prepare-request").disabled = removal && !bankReady;
    $("form-error").hidden = true;
  }
  function preparePayload() {
    $("form-error").hidden = true;
    form.querySelectorAll("input, textarea, select").forEach(input => input.setCustomValidity(""));
    form.querySelectorAll("input[required], textarea[required]").forEach(input => {
      if (input.matches(":disabled") || ["checkbox", "radio"].includes(input.type)) return;
      if (input.value.trim().length < Math.max(1, input.minLength)) input.setCustomValidity("Complétez ce champ avec un texte suffisamment détaillé, sans compter les espaces au début et à la fin.");
    });
    const payload = { type: kind(), nom: $("contributor-name").value.trim(), confirmation: $("acknowledgement").checked };
    const email = $("contributor-email").value.trim();
    if (email) {
      payload.email = email;
      if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) $("contributor-email").setCustomValidity("Indiquez une adresse e-mail valide, par exemple nom@exemple.fr.");
    }
    if (payload.type === "ajout") {
      const seen = new Set();
      payload.questions = proposals().map(card => {
        const enonce = field(card, "enonce").value.trim();
        const reponses = [...card.querySelectorAll("[data-answer]:checked")].map(input => input.dataset.answer);
        if (reponses.length !== 1) card.querySelector("[data-answer]").setCustomValidity("Sélectionnez une seule bonne réponse pour cette question.");
        if (seen.has(normalize(enonce))) field(card, "enonce").setCustomValidity("Chaque question de votre envoi doit avoir un énoncé différent.");
        seen.add(normalize(enonce));
        const choix = Object.fromEntries(letters.map(letter => [letter, field(card, letter).value.trim()]));
        if (new Set(Object.values(choix).map(normalize)).size !== 4) field(card, "d").setCustomValidity("Les quatre choix doivent être distincts.");
        return { enonce, choix, reponses, explication: field(card, "explication").value.trim(), reference: field(card, "reference").value.trim() };
      });
      if (payload.questions.length < 5 || payload.questions.length > 20) { showError("Proposez entre 5 et 20 questions."); return null; }
    } else {
      const question = byId.get($("existing-question").value);
      if (!bankReady || !question) $("existing-question").setCustomValidity("Choisissez une question de la banque.");
      if (question) {
        payload.question = { id: question.id, enonce: question.enonce, choix: question.choix,
          source: { id: question.source.id, titre: sources[question.source.id]?.titre || question.source.id, numero: question.source.numero || null } };
      }
      payload.motif = $("removal-reason").value.trim();
    }
    if (!form.reportValidity()) return null;
    return payload;
  }

  function emailSubject(payload) {
    return payload.type === "ajout" ? "Questions européennes — Proposition de " + payload.questions.length + " questions"
      : "Questions européennes — Demande de retrait";
  }
  function emailMessage(payload) {
    const lines = ["Bonjour,", "", emailSubject(payload), "", "Nom ou pseudonyme : " + payload.nom];
    if (payload.email) lines.push("Adresse pour votre réponse : " + payload.email);
    lines.push("", "J’ai lu les conditions de contribution. Ma demande et le nom ou pseudonyme proposé doivent être examinés avant toute publication.", "");
    if (payload.type === "ajout") {
      for (const [index, question] of payload.questions.entries()) {
        lines.push("QUESTION " + (index + 1), question.enonce);
        for (const letter of letters) lines.push(letter.toUpperCase() + ". " + question.choix[letter]);
        lines.push("Bonne réponse : " + question.reponses[0].toUpperCase(), "Explication : " + question.explication,
          "Référence : " + question.reference, "");
      }
    } else {
      const question = payload.question;
      lines.push("QUESTION CONCERNÉE", "Identifiant : " + question.id, "Source : " + question.source.titre
        + (question.source.numero ? " — Question " + question.source.numero : ""), question.enonce);
      for (const [letter, text] of Object.entries(question.choix)) lines.push(letter.toUpperCase() + ". " + text);
      lines.push("", "MOTIF DE LA DEMANDE DE RETRAIT", payload.motif, "");
    }
    lines.push("Merci pour l’examen de ma demande.");
    return lines.join("\n");
  }
  function prepareEmail(event) {
    event.preventDefault();
    const payload = preparePayload();
    if (!payload) return;
    $("email-subject").textContent = emailSubject(payload);
    $("email-message").value = emailMessage(payload);
    $("recipient-address").textContent = recipient;
    $("recipient-row").hidden = !recipient;
    $("open-mail").hidden = !recipient;
    // Keep the full message out of the mailto URL: long contributions can be truncated by mail clients.
    if (recipient) $("open-mail").href = "mailto:" + encodeURIComponent(recipient).replace("%40", "@") + "?subject=" + encodeURIComponent(emailSubject(payload));
    $("copy-status").textContent = "";
    $("email-draft").hidden = false;
    $("draft-title").focus();
  }
  form.noValidate = true;
  form.addEventListener("submit", prepareEmail);
  form.addEventListener("input", event => { invalidateDraft(); event.target.setCustomValidity?.(""); });
  form.querySelectorAll("input[name=request-kind]").forEach(input => input.addEventListener("change", updateKind));
  $("add-question").addEventListener("click", () => addQuestion(true));
  $("question-search").addEventListener("input", filterQuestions);
  $("existing-question").addEventListener("change", showSelectedQuestion);
  $("copy-message").addEventListener("click", async () => {
    const message = $("email-message").value;
    try {
      await navigator.clipboard.writeText(message);
      if ($("email-message").value !== message) return;
      dirty = false;
      $("copy-status").textContent = "Message copié. Collez-le dans votre e-mail avant de l’envoyer.";
    } catch {
      if ($("email-message").value !== message) return;
      $("email-message").focus();
      $("email-message").select();
      $("copy-status").textContent = "Copiez le texte sélectionné avec Ctrl + C (ou Cmd + C), ou avec le menu Copier de votre appareil.";
    }
  });
  $("download-request").addEventListener("click", () => {
    const payload = preparePayload();
    if (!payload) return;
    const url = URL.createObjectURL(new Blob([emailMessage(payload) + "\n"], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "demande-quiz-" + payload.type + ".txt";
    link.click();
    dirty = false;
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  window.addEventListener("beforeunload", event => {
    if (dirty) { event.preventDefault(); event.returnValue = ""; }
  });
  for (let index = 0; index < 5; index++) addQuestion();
  filterQuestions();
  const params = new URLSearchParams(location.search);
  if (params.get("type") === "retrait" || params.has("question")) {
    form.querySelector('input[value="retrait"]').checked = true;
    const id = params.get("question");
    if (id && byId.has(id)) { $("existing-question").value = id; showSelectedQuestion(); }
  }
  updateKind();
  if (params.has("question") && !byId.has(params.get("question"))) showError("Cette question n’a pas été retrouvée. Sélectionnez la question concernée dans la banque.");
  if (!recipient) {
    $("service-status").textContent = "L’adresse e-mail de réception sera indiquée prochainement. Vous pouvez déjà préparer, copier ou télécharger votre demande.";
    $("service-status").hidden = false;
  } else {
    $("contact-address").textContent = recipient;
    $("contact-address").href = "mailto:" + encodeURIComponent(recipient).replace("%40", "@") + "?subject=" + encodeURIComponent("Questions européennes — Contribution");
    $("contact-details").hidden = false;
  }
  form.hidden = false;
})();
