import { BaseStore } from "./BaseStore";

class QuestionsStore extends BaseStore {
  /** @override */
  get key() {
    return "pt-questions"
  }

  /**
   * * `snoozed` -> key-value pairs of hashed portuguese phrase (sha256), and timeSnoozeExpiresMs
   * * `flagged` -> key-value pairs of hashed portuguese phrase (sha256), and numTimesFlagged
   * @typedef {{ snoozed: Record<string, number>, flagged: Record<string, number> }} State
   */

  /**
   * ```snoozed: Record<string, number>```
   * @type {State} _defaultValue
   */
  _defaultValue = {
    snoozed: {},
    flagged: {},
  };

  /** @type {State} _state */
  _state = (() => {
    const stored = this.getStore()
    if (!stored) {
      return { ...this._defaultValue }
    }
    return {
      ...this._defaultValue,
      ...stored,
    }
  })()

  getSnoozedQuestions = () => ({ ...this._state.snoozed });

  /**
   * @param {string} hash
   * @param {number} snoozeDurationMs
   */
  snoozeQuestion = (hash, snoozeDurationMs) => {
    if (!hash) {
      return false;
    }
    const now = Date.now();
    const timeSnoozeExpiresMs = now + snoozeDurationMs;
    this._state.snoozed[hash] = timeSnoozeExpiresMs;
    this.setStore(this._state);
    return true;
  }

  unsnoozeAllQuestions = () => {
    this._state.snoozed = {};
    this.setStore(this._state);
  }

  /**
   * @param {string} hash
   */
  getFlagNum = (hash) => this._state.flagged[hash || ''] || 0;

  /**
   * @param {string} hash
   */
  flagQuestion = (hash) => {
    if (!hash) {
      return;
    }
    this._state.flagged[hash] = this._state.flagged[hash] || 0;
    this._state.flagged[hash]++;
    this.setStore(this._state);
  }

  /**
   * @param {string} hash
   */
  unflagQuestion = (hash) => {
    if (!hash) {
      return;
    }
    this._state.flagged[hash] = this._state.flagged[hash] || 0;
    this._state.flagged[hash] = Math.max(this._state.flagged[hash] - 1, 0);
    this.setStore(this._state);
  }

  reset = () => {
    this.clearStore();
    this._state = { ...this._defaultValue };
  }
}

export const questionsStore = new QuestionsStore();

