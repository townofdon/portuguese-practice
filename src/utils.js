
export function shuffleArray(array) {
  const copy = array.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

export function assert(condition, optText) {
  const result = typeof condition === 'function' ? condition() : condition
  if (!result) {
    throw new Error(optText || 'Assertion Failed!');
  }
}
