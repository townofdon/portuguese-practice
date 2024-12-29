'use strict'

import conj from './resources/conjugation-ver-vir.yaml';
import weakPhrases from './resources/weak-phrases.yaml';

import { EXERCISE, ORDER } from './constants';
import { isCharPressed, SpecialKey } from './keyboardUtils';
import { Logger } from './Logger';
import { speak } from './speak';
import { optionsStore } from './stores/OptionsStore';
import { questionsStore } from './stores/QuestionsStore';
import { assert, removeArrayElement, requireById, requireFirstChild, sha256, shuffleArray } from './utils';

Logger.enable();
Logger.disableDebug();

const cardQuestion = requireById('card-question');
const cardAnswer = requireById('card-answer');
const cardQuestionContent = requireFirstChild(cardQuestion)
const cardAnswerContent = requireFirstChild(cardAnswer)

assert(cardQuestionContent, 'cardQuestionContent does not exist');
assert(cardAnswerContent, 'cardAnswerContent does not exist');

const buttonPrev = requireById('button-prev');
const buttonNext = requireById('button-next');
const buttonReshuffle = requireById('button-reshuffle');
const buttonSpeak = requireById('button-speak');
const buttonSnooze1h = requireById('button-snooze-1h');
const buttonSnooze7d = requireById('button-snooze-7d');
const buttonSnooze30d = requireById('button-snooze-30d');
const progress = requireById('progress');
const formQuestionOrder = requireById('form-question-order');
const formSelectExercises = requireById('form-select-exercises');
const formSelectMode = requireById('form-select-mode');

/**
 * @typedef {{pr: string, en: string}} TranslationPair
 */

/**
 * @typedef {[string, string, number]|[string, string, number, string]} Problem
 */

/** @type {{ revealed: boolean, problems: Problem[], index: number }} State */
const state = {
  revealed: false,
  problems: [], // array of tuples -> [question, answer, portuguese-index-for-text-to-speech][]
  index: 0,
};

function main() {
  renderOptions();
  shuffleQuestions();
  setupListeners();
}

function randBool() {
  return Math.random() >= 0.5
}

function shuffleQuestions() {
  state.revealed = false;
  state.problems = [];
  state.index = 0;
  /** @type {Problem[]} */
  const problems = []
  /** @param {TranslationPair} trans */
  const addProblem = (trans) => {
    if (!trans.en || !trans.pr) {
      throw new Error(`Problem is invalid: ${JSON.stringify(trans)}`)
    }
    const order = optionsStore.getOrder();
    if (order === ORDER.EN_FIRST) {
      problems.push([trans.en, trans.pr, 1]);
    } else if (order === ORDER.PR_FIRST) {
      problems.push([trans.pr, trans.en, 0]);
    } else {
      const flip = randBool();
      if (flip) {
        problems.push([trans.en, trans.pr, 1]);
      } else {
        problems.push([trans.pr, trans.en, 0]);
      }
    }
  }

  const selectedExercises = optionsStore.getSelectedExercises()

  if (selectedExercises[EXERCISE.VER_CONJATION]) {
    conj.ver.present.forEach(addProblem);
    conj.ver.preterite.forEach(addProblem);
    conj.ver.imperfect.forEach(addProblem);
    conj.ver.presentPerfect.forEach(addProblem);
    conj.ver.future.forEach(addProblem);
  }

  if (selectedExercises[EXERCISE.VIR_CONJUGATION]) {
    conj.vir.present.forEach(addProblem);
    conj.vir.preterite.forEach(addProblem);
    conj.vir.imperfect.forEach(addProblem);
    conj.vir.presentPerfect.forEach(addProblem);
    conj.vir.future.forEach(addProblem);
  }

  if (selectedExercises[EXERCISE.WEAK_PHRASES]) {
    weakPhrases.forEach(addProblem);
  }

  state.problems = shuffleArray(problems);

  prepareHashData(() => {
    renderContent();
  });
}

function playTranslationAudio() {
  const numProblems = state.problems.length

  if (numProblems === 0) {
    return;
  }

  const currentIndex = state.index % numProblems;
  const currentProblem = state.problems[currentIndex];
  if (!currentProblem) return
  /** @type {string} */
  // @ts-ignore
  const ptPhrase = currentProblem[currentProblem[2]]
  speak(ptPhrase)
}

function advance() {
  if (state.revealed) {
    state.index++;
    state.revealed = false;
  } else {
    state.revealed = true;
  }
  renderContent();
}

function rewind() {
  state.revealed = false;
  state.index--;
  if (state.index < 0) state.index = state.problems.length - 1;
  renderContent();
}

function setupListeners() {
  buttonNext.addEventListener('click', advance);
  buttonPrev.addEventListener('click', rewind);
  buttonReshuffle.addEventListener('click', shuffleQuestions);
  buttonSpeak.addEventListener('click', playTranslationAudio);
  buttonSnooze1h.addEventListener('click', handleClickSnooze);
  buttonSnooze7d.addEventListener('click', handleClickSnooze);
  buttonSnooze30d.addEventListener('click', handleClickSnooze);
  document.addEventListener('keydown', handleKeyPress);
  // @ts-ignore
  formQuestionOrder.addEventListener('change', handleQuestionOrderChange)
  // @ts-ignore
  formSelectExercises.addEventListener('change', handleSelectExerciseChange)
  // @ts-ignore
  formSelectMode.addEventListener('change', handleSelectModeChange)
}

/**
 * @param {KeyboardEvent} ev
 */
function handleKeyPress(ev) {
  if (!ev) return;

  if (isCharPressed(ev, SpecialKey.ArrowRight)) {
    advance();
  } else if (isCharPressed(ev, SpecialKey.ArrowLeft)) {
    rewind();
  } else if (isCharPressed(ev, SpecialKey.Space)) {
    ev.preventDefault();
    playTranslationAudio();
  }
}

/**
 * @param {Event & { target: HTMLInputElement }} ev
 */
function handleQuestionOrderChange(ev) {
  if (!ev.target) return
  // state.order = ev.target.value;
  optionsStore.setOrder(ev.target.value);
  shuffleQuestions();
}

/**
 * @param {Event & { target: HTMLInputElement }} ev
 */
function handleSelectExerciseChange(ev) {
  optionsStore.setSelectedExercise(ev.target.name, ev.target.checked);
  shuffleQuestions();
}

/**
 * @param {Event & { target: HTMLInputElement }} ev
 */
function handleSelectModeChange(ev) {
  // TODO: set mode
}

/**
 * @param {*} ev
 * @returns
 */
function handleClickSnooze(ev) {
  const seconds = parseInt(ev.currentTarget.dataset.seconds, 10) || 0;
  if (!seconds) return;
  const snoozeDurationMs = seconds * 1000;
  snoozeCurrentQuestion(snoozeDurationMs);
}

function renderContent() {
  const numProblems = state.problems.length

  if (numProblems === 0) {
    cardQuestionContent.innerHTML = "Please select an exercise to begin";
    cardAnswerContent.innerHTML = "Por favor selecione um exercício para começar";
    cardAnswer.classList.add('revealed');
    progress.innerHTML = "0 / 0";
    return;
  }

  const currentIndex = state.index % numProblems;
  const progressText = `${currentIndex + 1} / ${numProblems}`
  const currentProblem = state.problems[currentIndex];

  assert(currentProblem, `currentProblem out of bounds - tried index ${currentIndex} for array of length ${numProblems}`);
  if (!currentProblem) return

  cardQuestionContent.innerHTML = markifyText(currentProblem[0]);
  cardAnswerContent.innerHTML = markifyText(currentProblem[1]);

  if (state.revealed) {
    cardAnswer.classList.add('revealed');
  } else {
    cardAnswer.classList.remove('revealed');
  }

  progress.innerHTML = progressText;
}

function renderOptions() {
  formQuestionOrder.querySelectorAll('input').forEach(input => {
    if (input.name === 'question-order') {
      input.checked = optionsStore.getOrder() === input.value;
    }
  });

  formSelectExercises.querySelectorAll('input').forEach(input => {
    if (input.name.includes('checkbox-exercise')) {
      input.checked = optionsStore.getSelectedExercises()[input.name];
    }
  });
}

/**
 * @param {string} text
 * @returns string
 */
function markifyText(text) {
  const regMarkdownBoldStart = /(?<!\S)\*\*(?!\s)/g;
  const regMarkdownBoldEnd = /(?<!\s)\*\*(?!\S)/g;
  return text
    .replace(regMarkdownBoldStart, "<strong class=\"accent\">")
    .replace(regMarkdownBoldEnd, "</strong>")
}

/**
 * @param {number} snoozeDurationMs
 */
function snoozeCurrentQuestion(snoozeDurationMs) {
  const numProblems = state.problems.length
  if (numProblems === 0) {
    return;
  }
  const currentIndex = state.index % numProblems;
  const currentProblem = state.problems[currentIndex];
  if (!currentProblem) return;
  const hash = currentProblem[3] || "";
  if (questionsStore.snoozeQuestion(hash, snoozeDurationMs)) {
    state.problems = removeArrayElement(state.problems, currentIndex);
    state.revealed = false;
    renderContent();
  }
}

/** @type {null | (() => void)} */
let cleanupHashProcessor = null;

/**
 * Hash Portuguese phrase to allow for "snoozing" a flash card
 */
function prepareHashData(onProcessingComplete = () => {}) {
  if (cleanupHashProcessor) {
    cleanupHashProcessor();
  }

  let ignore = false;

  async function process() {
    const timeStart = performance.now();
    let i = 0;
    while (!ignore && i < state.problems.length) {
      const problem = state.problems[i];
      if (!problem) continue;
      const ptPhrase = String(problem[problem[2]]);
      const hash = await sha256(ptPhrase);
      // @ts-ignore
      state.problems[i][3] = hash;
      Logger.debug(`processing msg ${i} - ${hash} generated for "${ptPhrase}"`)
      i++;
    }
    if (!ignore) {
      const snoozedQuestions = questionsStore.getSnoozedQuestions();
      state.problems = state.problems.filter(problem => {
        const hash = problem[3] || "";
        const currentTime = Date.now();
        const timeSnoozeExpiresMs = snoozedQuestions[hash] || 0;
        return !!hash && timeSnoozeExpiresMs < currentTime
      })

      const timeEnd = performance.now();
      Logger.info(`processing complete! - took ${timeEnd - timeStart}ms`);
      onProcessingComplete();
    }
  }

  process();

  cleanupHashProcessor = () => {
    ignore = true;
    cleanupHashProcessor = null;
  }
}

main();
