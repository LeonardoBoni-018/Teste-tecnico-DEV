import '@testing-library/jest-dom';

// Node >= 22 expõe um global `localStorage` experimental que, sem a flag
// --localstorage-file, fica indefinido e sombreia o localStorage do jsdom,
// quebrando os testes (localStorage.clear() lança no beforeEach).
// Garantimos um Storage funcional em memória para o ambiente de testes.
if (!globalThis.localStorage || typeof globalThis.localStorage.clear !== 'function') {
  const store = new Map();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => { store.set(key, String(value)); },
      removeItem: (key) => { store.delete(key); },
      clear: () => { store.clear(); },
      key: (index) => Array.from(store.keys())[index] ?? null,
      get length() { return store.size; },
    },
  });
}
