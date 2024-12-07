import { requireById } from './utils';

const synth = window.speechSynthesis;

const selectVoice = requireById("select-voice")

let voices;

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
    if (!/^pt-/.test(voices[i].lang)) {
      continue;
    }
    const option = document.createElement("option");
    option.textContent = `${voices[i].name} (${voices[i].lang})`;
    option.value = i;
    selectVoice.appendChild(option);
    if (voices[i].lang === 'pt-BR' && voices[i].name.toLowerCase().includes('google')) {
      chosenVoiceIndex = i;
    }
  }
  selectVoice.value = chosenVoiceIndex;
}

// in Google Chrome the voices are not ready on page load
if ("onvoiceschanged" in synth) {
  synth.onvoiceschanged = loadVoices;
} else {
  loadVoices();
}

export const speak = (text) => {
  const filtered = text.replace(/\*\*/g, '');
  const utterance = new SpeechSynthesisUtterance(filtered);
  utterance.voice = voices[selectVoice.value];
  synth.speak(utterance);
}
