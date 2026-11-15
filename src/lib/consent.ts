export type ConsentValue = "accepted" | "rejected";

// v2: la versión anterior solo registraba que se cerró el aviso, no una decisión sobre la analítica
export const CONSENT_KEY = "armio_cookie_consent_v2";
/**
 * Clave independiente para el aviso informativo del portal: el portal vive en otro origen
 * (`{slug}.armio.co`), así que su `localStorage` nunca es el de armio.co y la decisión de
 * analítica de marketing no puede (ni debe) reutilizarse allí.
 */
export const PORTAL_NOTICE_KEY = "armio_portal_storage_notice_v1";

const CONSENT_EVENT = "armio:consent";

export function getConsentFor(key: string): ConsentValue | null {
  try {
    const value = localStorage.getItem(key);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

export function setConsentFor(key: string, value: ConsentValue): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Navegación privada: la decisión vale solo para esta visita
  }
  window.dispatchEvent(new CustomEvent<ConsentValue>(CONSENT_EVENT, { detail: value }));
}

export function getConsent(): ConsentValue | null {
  return getConsentFor(CONSENT_KEY);
}

export function setConsent(value: ConsentValue): void {
  setConsentFor(CONSENT_KEY, value);
}

/**
 * Suscribe a cambios de la decisión (misma pestaña y otras pestañas). Notifica ante cualquiera
 * de las claves de consentimiento: cada consumidor vuelve a leer la suya en su `getSnapshot`.
 */
export function subscribeConsent(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_KEY || event.key === PORTAL_NOTICE_KEY) callback();
  };
  window.addEventListener(CONSENT_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}
