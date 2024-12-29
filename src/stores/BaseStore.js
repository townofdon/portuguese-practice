
export class BaseStore {
  get key() { return ""; } // abstract

  clearStore = () => {
    this._validate();
    localStorage.removeItem(this.key);
  }

  getStore = () => {
    this._validate();
    try {
      const itemRaw = localStorage.getItem(this.key);
      if (!itemRaw) return null;
      return JSON.parse(itemRaw)
    } catch (err) {
      console.warn(err);
      return null;
    }
  }

  /**
   * @param {Object} value
   */
  setStore = (value) => {
    this._validate();
    try {
      localStorage.setItem(this.key, JSON.stringify(value))
    } catch (err) {
      console.warn(err);
    }
  }

  _validate = () => {
    if (!this.key) throw new Error('local storage key is required');
  }
}