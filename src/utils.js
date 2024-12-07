
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

export function requireById(id) {
  const elem = document.getElementById(id);
  if (!elem) throw new Error(`Could not find DOM element with id "${id}"!!`);
  return elem;
}

export function removeArrayElement(items, index = -1) {
  if (index < 0) return items;
  if (index >= items.length) return items;
  return items.slice(0, index).concat(items.slice(index + 1))
}

export async function sha256(message = '') {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}
