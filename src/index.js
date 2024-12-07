import conj from './resources/conjugation-ver-vir.yaml';
import weakPhrases from './resources/weak-phrases.yaml';

import { shuffleArray, assert } from './utils';
import { isCharPressed, SpecialKey } from './keyboardUtils';
import { EXERCISE, ORDER } from './constants';

import { optionsStore } from './stores/OptionsStore';

function requireById(id) {
  const elem = document.getElementById(id);
  if (!elem) throw new Error(`Could not find DOM element with id "${id}"!!`);
  return elem;
}

const cardQuestion = requireById('card-question');
const cardAnswer = requireById('card-answer');
const cardQuestionContent = cardQuestion.children[0]
const cardAnswerContent = cardAnswer.children[0]

assert(cardQuestionContent, 'cardQuestionContent does not exist');
assert(cardAnswerContent, 'cardAnswerContent does not exist');

const buttonPrev = requireById('button-prev');
const buttonNext = requireById('button-next');
const buttonReshuffle = requireById('button-reshuffle');
const progress = requireById('progress');
const formQuestionOrder = requireById('form-question-order');
const formSelectExercises = requireById('form-select-exercises');

const state = {
  revealed: false,
  problems: [], // array of tuples -> [question, answer][]
  index: 0,
  order: optionsStore.getOrder(),
  selectedExercises: optionsStore.getSelectedExercises(),
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
  const problems = []
  const addProblem = (problem) => {
    if (!problem.en || !problem.pr) {
      throw new Error(`Problem is invalid: ${JSON.stringify(problem)}`)
    }
    if (state.order === ORDER.EN_FIRST) {
      problems.push([problem.en, problem.pr]);
    } else if (state.order === ORDER.PR_FIRST) {
      problems.push([problem.pr, problem.en]);
    } else {
      const flip = randBool();
      if (flip) {
        problems.push([problem.en, problem.pr]);
      } else {
        problems.push([problem.pr, problem.en]);
      }
    }
  }

  if (state.selectedExercises[EXERCISE.VER_CONJATION]) {
    conj.ver.present.forEach(addProblem);
    conj.ver.preterite.forEach(addProblem);
    conj.ver.imperfect.forEach(addProblem);
    conj.ver.presentPerfect.forEach(addProblem);
    conj.ver.future.forEach(addProblem);
  }

  if (state.selectedExercises[EXERCISE.VIR_CONJUGATION]) {
    conj.vir.present.forEach(addProblem);
    conj.vir.preterite.forEach(addProblem);
    conj.vir.imperfect.forEach(addProblem);
    conj.vir.presentPerfect.forEach(addProblem);
    conj.vir.future.forEach(addProblem);
  }

  if (state.selectedExercises[EXERCISE.WEAK_PHRASES]) {
    weakPhrases.forEach(addProblem);
  }

  state.problems = shuffleArray(problems);

  renderContent();
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
  document.addEventListener('keydown', handleKeyPress);
  formQuestionOrder.addEventListener('change', handleQuestionOrderChange)
  formSelectExercises.addEventListener('change', handleSelectExerciseCheck)
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
  }
}

/**
 * @param {KeyboardEvent} ev
 */
function handleQuestionOrderChange(ev) {
  state.order = ev.target.value;
  optionsStore.setOrder(ev.target.value);
  shuffleQuestions();
}

/**
 * @param {KeyboardEvent} ev
 */
function handleSelectExerciseCheck(ev) {
  state.selectedExercises[ev.target.name] = ev.target.checked;
  optionsStore.setSelectedExercise(ev.target.name, ev.target.checked);
  shuffleQuestions();
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

  cardQuestionContent.innerHTML = currentProblem[0];
  cardAnswerContent.innerHTML = currentProblem[1];

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
      input.checked = state.order === input.value;
    }
  });

  formSelectExercises.querySelectorAll('input').forEach(input => {
    if (input.name.includes('checkbox-exercise')) {
      input.checked = state.selectedExercises[input.name];
    }
  });
}

main();
