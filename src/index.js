import conj from './resources/conjugation-ver-vir.yaml';

import { shuffleArray, assert } from './utils';
import { isCharPressed, SpecialKey } from './keyboardUtils';

const cardQuestion = document.getElementById('card-question');
const cardAnswer = document.getElementById('card-answer');
const cardQuestionContent = cardQuestion.children[0]
const cardAnswerContent = cardAnswer.children[0]

assert(cardQuestionContent, 'cardQuestionContent does not exist');
assert(cardAnswerContent, 'cardAnswerContent does not exist');

const buttonPrev = document.getElementById('button-prev');
const buttonNext = document.getElementById('button-next');
const buttonReshuffle = document.getElementById('button-reshuffle');
const progress = document.getElementById('progress');

const state = {
  revealed: false,
  problems: [], // array of tuples -> [question, answer][]
  index: 0,
};

function main() {
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
    const flip = randBool();
    if (flip) {
      problems.push([problem.en, problem.pr]);
    } else {
      problems.push([problem.pr, problem.en]);
    }
  }
  conj.ver.present.forEach(addProblem);
  conj.ver.preterite.forEach(addProblem);
  conj.ver.imperfect.forEach(addProblem);
  conj.ver.presentPerfect.forEach(addProblem);
  conj.ver.future.forEach(addProblem);

  conj.vir.present.forEach(addProblem);
  conj.vir.preterite.forEach(addProblem);
  conj.vir.imperfect.forEach(addProblem);
  conj.vir.presentPerfect.forEach(addProblem);
  conj.vir.future.forEach(addProblem);

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

function renderContent() {
  const numProblems = state.problems.length
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

main();
