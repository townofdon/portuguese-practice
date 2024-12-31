import { BaseStore } from "./BaseStore";
import { EXERCISE, MODE, ORDER } from "../constants";

class OptionsStore extends BaseStore {
  /** @override */
  get key() {
    return "pt-options"
  }

  _defaultValue = {
    order: ORDER.ANY,
    selectedExercises: {
      [EXERCISE.VER_CONJUGATION]: true,
      [EXERCISE.VIR_CONJUGATION]: true,
      [EXERCISE.VER_AND_VIR]: true,
      [EXERCISE.FAZER_CONJUGATION]: true,
      [EXERCISE.WEAK_PHRASES]: true,
      [EXERCISE.VOCAB]: true,
    },
    mode: MODE.READING,
  };

  _state = (() => {
    const stored = this.getStore()
    if (!stored) {
      return { ...this._defaultValue }
    }
    return {
      ...this._defaultValue,
      ...stored,
    }
  })();

  /**
   * @returns {ORDER}
   */
  getOrder = () => this._state.order;

  /**
   * @param {ORDER} val
   */
  setOrder = (val) => {
    this._state.order = val;
    this.setStore(this._state);
  }

  /**
   * @returns {Record<EXERCISE, boolean>}
   */
  getSelectedExercises = () => ({
    ...this._defaultValue.selectedExercises,
    ...this._state.selectedExercises,
  });

  /**
   * @param {string} exercise
   * @param {boolean} isSelected
   */
  setSelectedExercise = (exercise, isSelected) => {
    this._state.selectedExercises[exercise] = isSelected;
    this.setStore(this._state);
  }

  /**
   * @returns {MODE}
   */
  getMode = () => this._state.mode;

  /**
   * @param {MODE} mode
   */
  setMode = (mode) => {
    this._state.mode = mode;
    this.setStore(this._state);
  }

  reset = () => {
    this.clearStore();
    this._state = { ...this._defaultValue };
  }
}

export const optionsStore = new OptionsStore();
