export type ConsentValue = "accepted" | "rejected";

// v2: la versión anterior solo registraba que se cerró el aviso, no una decisión sobre la analítica
const CONSENT_KEY = "armio_cookie_consent_v2";
const CONSENT_EVENT = "armio:consent";

export function getConsent(): ConsentValue | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(value: ConsentValue): void {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Navegación privada: la decisión vale solo para esta visita
  }
  window.dispatchEvent(new CustomEvent<ConsentValue>(CONSENT_EVENT, { detail: value }));
}

/** Suscribe a cambios de la decisión (misma pestaña y otras pestañas). */
export function subscribeConsent(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_KEY) callback();
  };
  window.addEventListener(CONSENT_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}
