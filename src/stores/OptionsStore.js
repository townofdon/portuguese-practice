import { BaseStore } from "./BaseStore";
import { EXERCISE, ORDER } from "../constants";

class OptionsStore extends BaseStore {
  get key() {
    return "pt-options"
  }

  _defaultValue = {
    order: ORDER.ANY,
    selectedExercises: {
      [EXERCISE.VER_CONJATION]: true,
      [EXERCISE.VIR_CONJUGATION]: true,
      [EXERCISE.WEAK_PHRASES]: true,
    },
  };

  _state = this.getStore() || { ...this._defaultValue };

  /**
   * @returns string
   */
  getOrder = () => this._state.order;

  /**
   * @param {string} val
   */
  setOrder = (val) => {
    this._state.order = val;
    this.setStore(this._state);
  }

  /**
   * @returns object
   */
  getSelectedExercises = () => ({ ...this._state.selectedExercises });

  /**
   * @param {string} exercise
   * @param {boolean} isSelected
   */
  setSelectedExercise = (exercise, isSelected) => {
    this._state.selectedExercises[exercise] = isSelected;
    this.setStore(this._state);
  }

  reset = () => {
    this.clearStore();
    this._state = { ...this._defaultValue };
  }
}

export const optionsStore = new OptionsStore();
