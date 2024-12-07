
export const Logger = {
  _enabled: false,
  _debug: false,

  enable() {
    Logger._enabled = true;
  },

  disable() {
    Logger._enabled = false;
  },

  enableDebug() {
    Logger._debug = true;
  },

  disableDebug() {
    Logger._debug = false;
  },

  debug(...args) {
    if (!Logger._enabled) {
      return;
    }
    if (!Logger._debug) {
      return;
    }
    console.log(...args);
  },

  info(...args) {
    if (!Logger._enabled) {
      return;
    }
    console.log(...args);
  },

  warn(...args) {
    if (!Logger._enabled) {
      return;
    }
    console.warn(...args);
  },

  error(...args) {
    // always show errors
    console.error(...args);
  },
}
