
/**
 * @template T
 * @param {Array.<T>} array
 * @returns {Array.<T>}
 */
export function shuffleArray(array) {
  /** @type {Array.<T>} */
  const copy = array.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    if (!temp) continue;
    if (!copy[j]) continue;
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * @template T
 * @param {Array.<T>} arr
 * @returns {T}
 */
export function getRandomElement(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  const elem = arr[randomIndex];
  if (!elem) throw new Error('something went terribly wrong');
  return elem;
}

/**
 * @param {any|(() => boolean)} condition
 * @param {?string} optText
 */
export function assert(condition, optText) {
  const result = typeof condition === 'function' ? condition() : condition
  if (!result) {
    throw new Error(optText || 'Assertion Failed!');
  }
}

/**
 * @param {string} id
 * @returns {HTMLElement}
 */
export function requireById(id) {
  const elem = document.getElementById(id);
  if (!elem) throw new Error(`Could not find DOM element with id "${id}"!!`);
  return elem;
}

/**
 * @param {HTMLElement} node
 * @returns {Element}
 */
export function requireFirstChild(node) {
  const elem = node.children[0]
  if (!elem) throw new Error(`Could not get child from DOM element ${node}`)
  return elem;
}

/**
 * @template T
 * @param {Array.<T>} items
 * @param {number} index
 * @returns {Array.<T>}
 */
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

/**
 * @param {string} text
 * @returns string
 */
export function markifyText(text) {
  // https://regex101.com/r/epZo6M/1
  const regBold = /(?<!\S)\*\*(.+?)\*\*(?!\*)(?!\S)/g
  // https://regex101.com/r/nkYFpp/1
  const regEm = /(?<!\S)\_(.+?)\_(?!\S)/g
  const newline = /\s*\\n\s*/g;
  return text
    .replace(regBold, "<strong class=\"accent\">$1</strong>")
    .replace(regEm, "<em class=\"subtle\">$1</em>")
    .replace(newline, "<br/>")
}
