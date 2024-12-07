import { BaseStore } from "./BaseStore";

class QuestionsStore extends BaseStore {
  get key() {
    return "pt-questions"
  }

  /**
   * Snoozed = key-value pairs of hashed portuguese phrase (sha256), and timeSnoozeExpiresMs
   * ```snoozed: Record<string, number>```
   */
  _defaultValue = {
    snoozed: {},
  };

  _state = this.getStore() || { ...this._defaultValue };

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

  reset = () => {
    this.clearStore();
    this._state = { ...this._defaultValue };
  }
}

export const questionsStore = new QuestionsStore();

