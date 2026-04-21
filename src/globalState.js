const STORAGE_KEY = "myinscribed.processedInscriptions";

const readStoredInscriptions = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

let inscriptionArray = readStoredInscriptions();
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener(inscriptionArray));
};

export const getInscriptionArray = () => inscriptionArray;

export const subscribeToInscriptionArray = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setIinscriptionArray = (array) => {
  inscriptionArray = Array.isArray(array) ? array : [];

  if (typeof window !== "undefined") {
    try {
      if (inscriptionArray.length > 0) {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(inscriptionArray));
      } else {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
    }
  }

  notifyListeners();
};
