import { requireById } from './utils';

const synth = window.speechSynthesis;

/** @type {HTMLSelectElement} */
// @ts-ignore
const selectVoice = requireById("select-voice")

/** @type {SpeechSynthesisVoice[]} */
let voices = [];

function removeVoiceOptions() {
  for (const child of selectVoice.children) {
    child.remove();
  }
}

function loadVoices() {
  voices = synth.getVoices();
  removeVoiceOptions();
  let chosenVoiceIndex = 0;
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
  }
  selectVoice.value = String(chosenVoiceIndex);
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
 */
export const speak = (text, onFinished = undefined) => {
  if (synth.speaking) return;
  const filtered = text.replace(/\*\*/g, '');
  const utterance = new SpeechSynthesisUtterance(filtered);
  const voice = voices[parseInt(selectVoice.value, 10)];
  if (!voice) {
    return;
  }
  utterance.voice = voice;
  synth.speak(utterance);
  if (onFinished) {
    utterance.onend = onFinished;
  }
}
