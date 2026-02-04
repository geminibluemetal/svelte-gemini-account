// src/lib/utils/eventBus.js

const shortcuts = new Map();
let initialized = false;

/**
 * Normalize shortcut string
 * Example: "Ctrl+Shift+K" → "ctrl+k+shift"
 */
function normalizeShortcut(shortcut) {
  return shortcut
    .toLowerCase()
    .replace(/\s+/g, '')
    .split('+')
    .sort()
    .join('+');
}

/**
 * Build shortcut string from keyboard event
 */
function getShortcutFromEvent(e) {
  const keys = [];

  if (e.ctrlKey) keys.push('ctrl');
  if (e.altKey) keys.push('alt');
  if (e.shiftKey) keys.push('shift');
  if (e.metaKey) keys.push('meta');

  const key = e.key.toLowerCase();

  // Ignore modifier-only presses
  if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
    keys.push(key);
  }

  return keys.sort().join('+');
}

/**
 * Detect whether user is typing into a text-accepting element
 */
function isTextInputFocused() {
  const el = document.activeElement;
  if (!el) return false;

  // contenteditable
  if (el.isContentEditable) return true;

  // textarea
  if (el.tagName === 'TEXTAREA') return true;

  // input types that accept typing
  if (el.tagName === 'INPUT') {
    const type = el.type;
    return ![
      'button',
      'submit',
      'checkbox',
      'radio',
      'range',
      'file',
      'color'
    ].includes(type);
  }

  return false;
}

/**
 * Global keydown handler
 */
function handleKeydown(e) {
  if (!e.key) return;

  const isModifierCombo = e.ctrlKey || e.metaKey || e.altKey;

  // 🚫 Block shortcuts while typing (allow modifier combos)
  if (isTextInputFocused() && !isModifierCombo) {
    return;
  }

  const shortcut = getShortcutFromEvent(e);
  const handlers = shortcuts.get(shortcut);

  if (!handlers || handlers.size === 0) return;

  e.preventDefault();

  handlers.forEach((handler) => {
    try {
      handler(e);
    } catch (err) {
      console.error('Keyboard shortcut error:', err);
    }
  });
}

/**
 * Initialize global listener
 */
function init() {
  if (initialized || typeof window === 'undefined') return;
  window.addEventListener('keydown', handleKeydown);
  initialized = true;
}

/**
 * Destroy all listeners
 */
function destroy() {
  if (!initialized) return;
  window.removeEventListener('keydown', handleKeydown);
  shortcuts.clear();
  initialized = false;
}

export const keyboardEventBus = {
  /**
   * Register shortcut
   * @param {string} shortcut e.g. "Ctrl+K", "1", "numpad1"
   * @param {Function} handler
   * @returns {Function} unsubscribe
   */
  on(shortcut, handler) {
    init();
    const key = normalizeShortcut(shortcut);

    if (!shortcuts.has(key)) {
      shortcuts.set(key, new Set());
    }

    shortcuts.get(key).add(handler);

    // unsubscribe helper
    return () => this.off(shortcut, handler);
  },

  /**
   * Register shortcut once
   */
  once(shortcut, handler) {
    const wrapper = (e) => {
      handler(e);
      this.off(shortcut, wrapper);
    };
    this.on(shortcut, wrapper);
  },

  /**
   * Remove shortcut handler
   */
  off(shortcut, handler) {
    const key = normalizeShortcut(shortcut);
    const handlers = shortcuts.get(key);

    if (!handlers) return;

    handlers.delete(handler);

    if (handlers.size === 0) {
      shortcuts.delete(key);
    }
  },

  /**
   * Cleanup (use on app destroy if needed)
   */
  destroy
};
