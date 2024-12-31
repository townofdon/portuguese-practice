import { requireById } from './utils';

const synth = window.speechSynthesis;

/** @type {HTMLSelectElement} */
// @ts-ignore
const selectVoice = requireById("select-voice")

/** @type {SpeechSynthesisVoice[]} */
let voices = [];

function loadVoices() {
  // note that in some browsers, loadVoices() must occur after user interaction...
  voices = synth.getVoices();
  if (!voices.length) {
    return;
  }
  for (const child of selectVoice.children) {
    child.remove();
  }
  let chosenVoiceIndex = 0;
  let backupVoiceIndex = 0;
  for (let i = 0; i < voices.length; i++) {
    const voice = voices[i];
    if (!voice) {
      continue;
    }
    if (!/^pt-/.test(voice.lang)) {
      continue;
    }
    const option = document.createElement("option");
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = String(i);
    selectVoice.appendChild(option);
    if (!chosenVoiceIndex && voice.lang === 'pt-BR' && voice.name.toLowerCase().includes('google')) {
      chosenVoiceIndex = i;
    }
    if (!backupVoiceIndex  && voice.lang === 'pt-BR') {
      backupVoiceIndex = i;
    }
  }
  selectVoice.value = String(chosenVoiceIndex || backupVoiceIndex);
}

// in Google Chrome the voices are not ready on page load
if ("onvoiceschanged" in synth) {
  synth.onvoiceschanged = loadVoices;
} else {
  loadVoices();
}

/**
 * @param {string} text
 * @param {(() => void) | undefined} onFinished
 * @returns {boolean}
 */
export const speak = (text, onFinished = undefined) => {
  if (synth.speaking) return false;
  if (!voices.length) loadVoices();
  const filtered = text.replace(/\*\*/g, '');
  const utterance = new SpeechSynthesisUtterance(filtered);
  const voice = voices[parseInt(selectVoice.value, 10)];
  if (!voice) {
    return false;
  }
  utterance.voice = voice;
  synth.speak(utterance);
  if (onFinished) {
    utterance.onend = onFinished;
  }
  return true;
}
