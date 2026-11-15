# Plan de implementación — Cookies y privacidad (prioridad alta)

Repositorio: `armio-landing` (Next.js 16, App Router, React 19)
Rama base: `main`
Alcance: puntos **3**, **4**, **5** (altos) + documentación de la decisión del punto **1**.
Fuera de alcance: puntos 1, 6 y 9 (ya correctos, no se tocan).

---

## 1. Resumen ejecutivo

### Hallazgos de la verificación real de código

| #   | Afirmación del diagnóstico                                               | Verificado en código                          | Matiz importante                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3   | El aviso de cookies solo vive en el Footer de marketing                  | ✅ `src/components/layout/Footer.tsx:165-205` | **Peor de lo descrito**: `Footer` solo se importa desde `src/app/(marketing)/page.tsx` (verificado con `grep -rn "layout/Footer" src`). No está en `(marketing)/layout.tsx`, por lo que **`/cookies` no muestra ni footer ni aviso de cookies**. El problema es _intra-marketing_, no solo marketing-vs-portal.                                                                                                                                                                                                                          |
| 3   | Hay que montar el banner también en el portal                            | ⚠️ Discutible                                 | El portal **no carga GA4 ni ninguna cookie de analítica**: `AnalyticsGate` solo se monta en `(marketing)/layout.tsx:117`. `VisitBeacon` no usa cookies; usa `sessionStorage` únicamente para la clave técnica `armio:equipo` (opt-out del equipo). Un banner de consentimiento de analítica en el portal sería **texto falso** y además el consentimiento vive en `localStorage` (`armio_cookie_consent_v2`), que **no se comparte entre orígenes** (`armio.co` vs `{slug}.armio.co`, ver `src/portal/lib/urls.ts`). Ver Tarea 3.3 y §6. |
| 4   | El portal /privacidad dice que no hay analítica, pero la landing usa GA4 | ⚠️ Parcial                                    | El texto (`privacidad/page.tsx:79-81`) dice _«Este sitio no usa cookies publicitarias ni herramientas de analítica de terceros»_ y «este sitio» **es el portal**, donde eso es cierto. La desalineación **real y demostrable** es otra: línea 96 afirma _«No usamos cookies **ni almacenamiento en tu navegador** para seguirte»_ mientras `VisitBeacon.tsx:31,39` **sí escribe en `sessionStorage`**. Ese es el punto que hay que corregir, más una nota explícita de que armio.co (marketing) sí usa GA4 consentida.                   |
| 5   | La política de cookies no está enlazada desde el portal                  | ✅ Confirmado                                 | `PortalFooter.tsx` solo enlaza `/propiedades` y `/privacidad`. En la landing **sí** está enlazada (`Footer.tsx:93-100`), pero con URL hardcodeada (`Footer.tsx:9`), no en `src/lib/legal.ts`.                                                                                                                                                                                                                                                                                                                                            |
| 1   | GA solo en marketing; no tocar                                           | ✅ Confirmado                                 | `AnalyticsGate` se importa exclusivamente en `(marketing)/layout.tsx`. El portal tiene su propio `<html>` en `(portal)/p/[tenant]/layout.tsx`, sin analítica de terceros. **Sin cambios de código.**                                                                                                                                                                                                                                                                                                                                     |

### Riesgo de regresión ya identificado

`tests/unit/privacy-page.test.tsx:48-49` asserta sobre el texto exacto de la sección de datos:

```ts
expect(html).not.toContain("no usa herramientas de analítica");
expect(html).toContain("ni herramientas de analítica de");
```

Cualquier reescritura del párrafo de la línea 79 **rompe ese test**. La Tarea 4.1 y la 4.2 son inseparables.

### Bloqueador de base verificado: la suite de componentes está roja hoy

`npm test` en `main` (commit `573dda6`), **sin ningún cambio de este plan**:

```
Test Files  3 failed | 19 passed (22)
     Tests  59 failed | 377 passed (436)
```

Las tres suites rojas son exactamente las de componentes con jsdom — `visit-beacon.test.tsx`, `interest-form.test.tsx`, `interest-form-turnstile.test.tsx` — todas con `TypeError: React.act is not a function`.

Causa raíz verificada: con la configuración actual, Vitest 4 resuelve `react` por su condición **production** (`node_modules/react/cjs/react.production.js`), que no exporta `act`; `@testing-library/react` 16 cae entonces al `ReactDOMTestUtils.act` ya eliminado en `react-dom` 19. Comprobado con `node -e "console.log(Object.keys(require('react')).filter(k=>/act/i.test(k)))"` → `['Activity','useActionState']`, sin `act`.

**Esto bloquea el test nuevo de la Tarea 3.2** (es un componente de cliente con jsdom: fallaría por el entorno, no por el código). Hay que arreglarlo primero.

#### Tarea 0 — Desbloquear los tests de componentes (**prerrequisito**)

| Campo       | Valor                               |
| ----------- | ----------------------------------- |
| Complejidad | **Baja**                            |
| Archivos    | `vitest.config.ts`                  |
| Depende de  | — (va primero, en su propio commit) |

Cambio exacto, dentro del bloque `test: { … }`:

```ts
  test: {
    env: { NODE_ENV: "development" },   // React debe resolverse en su build de desarrollo: expone React.act (RTL 16 + React 19)
    environment: "node",
    …
```

**Verificado en este repo**: con ese `env`, `npx vitest run tests/unit/interest-form.test.tsx tests/unit/visit-beacon.test.tsx` pasa **35/35** (antes 0/35). El mismo resultado se obtiene con `NODE_ENV=development npm test`, lo que confirma la causa. El cambio se probó y se revirtió; `vitest.config.ts` sigue intacto en `main`.

**Criterios de éxito**: `npm test` → 22/22 suites y 436/436 tests en verde antes de empezar las tareas 3.x–5.x.

> Nota para todas las verificaciones de abajo: hasta que la Tarea 0 esté aplicada, «`npm test` en verde» significa 19/22 suites; no confundir ese rojo heredado con una regresión propia.

### Restricción arquitectónica crítica

`tests/unit/portal-pages-static.test.ts` es una guardia estática: **ningún `page.tsx`/`layout.tsx` bajo `src/app/(portal)/p/[tenant]` puede usar `cookies()`, `headers()`, `connection()` ni `next/headers`**. El portal debe seguir siendo estático/ISR. Todo lo que se monte allí debe ser un Client Component sin APIs dinámicas de servidor.

---

## 2. Tareas detalladas

### PUNTO 3 — Aviso de cookies global

#### Tarea 3.1 — Extraer `CookieConsentBanner` como componente compartido

| Campo       | Valor                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| Complejidad | **Baja**                                                                                                    |
| Archivos    | **Nuevo**: `src/components/ui/CookieConsentBanner.tsx`<br>**Modificar**: `src/components/layout/Footer.tsx` |
| Depende de  | —                                                                                                           |

**Cambios exactos**

1. Crear `src/components/ui/CookieConsentBanner.tsx` moviendo tal cual el bloque `Footer.tsx:165-205`, con la misma lógica de consentimiento (`useSyncExternalStore(subscribeConsent, getConsent, () => "accepted")`) y el mismo markup/clases Tailwind:

```tsx
"use client";

import { useSyncExternalStore } from "react";
import { Cookie } from "lucide-react";
import { getConsent, setConsent, subscribeConsent } from "@/lib/consent";
import { cookiesUrl, privacyUrl } from "@/lib/legal";

/**
 * Aviso de cookies de armio.co (marketing). Es el único control real de consentimiento:
 * hasta que se acepta, `AnalyticsGate` no carga Google Analytics.
 * El snapshot de SSR es "accepted" a propósito: evita renderizar el aviso en el servidor
 * (y el salto de hidratación) cuando aún no se sabe la decisión guardada en localStorage.
 */
export default function CookieConsentBanner() {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => "accepted" as const);
  if (consent !== null) return null;
  return (/* markup idéntico al actual Footer.tsx:167-204 */);
}
```

2. En el texto del aviso, añadir el enlace a la política de cookies junto al de privacidad (ya resuelve parte del punto 5 en marketing):
   `… Solo se activan si las aceptas. <a href={cookiesUrl}>Política de cookies</a>.` (el enlace a `privacyUrl` sigue condicionado a que exista `NEXT_PUBLIC_APP_URL`; `cookiesUrl` es estático y se muestra siempre).

3. En `Footer.tsx`: eliminar líneas 165-205, el `<>…</>` envolvente, el import de `Cookie`, el import de `useSyncExternalStore`, el import de `getConsent/setConsent/subscribeConsent` y las variables `consent`/`showCookieConsent`.
4. Evaluar quitar `"use client"` de `Footer.tsx`: tras la extracción solo quedan `onClick={() => trackCTAClick("footer")}` y `new Date()`, así que **sigue necesitando `"use client"`**. No cambiar la directiva.

**Verificación**

```bash
cd armio-landing
npx tsc --noEmit
npm run lint
npm test
```

```bash
# El banner ya no vive en el Footer y el Footer no importa consent
grep -n "setConsent\|Cookie\b" src/components/layout/Footer.tsx   # sin resultados
grep -c "subscribeConsent" src/components/ui/CookieConsentBanner.tsx  # 1
```

**Criterios de éxito**

- `tsc`, `lint` y `vitest` en verde.
- `Footer.tsx` no referencia `@/lib/consent`.
- El markup del banner (clases, `role="region"`, `aria-label="Aviso de cookies"`, textos de botones) es byte-idéntico al anterior salvo el enlace añadido.

---

#### Tarea 3.2 — Montar el banner en el layout de marketing (hacerlo global de verdad)

| Campo       | Valor                            |
| ----------- | -------------------------------- |
| Complejidad | **Baja**                         |
| Archivos    | `src/app/(marketing)/layout.tsx` |
| Depende de  | 3.1                              |

**Cambios exactos**

En `(marketing)/layout.tsx`, importar el componente y montarlo en el `<body>`, inmediatamente antes de `<AnalyticsGate …/>` (línea 117), para que el control de consentimiento y su consumidor queden juntos:

```tsx
import CookieConsentBanner from "@/components/ui/CookieConsentBanner";
…
        <CookieConsentBanner />
        <AnalyticsGate gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
```

Esto cubre `/` **y** `/cookies` (que hoy no tiene aviso), y cualquier página de marketing futura.

**Verificación**

```bash
npm run build          # el layout de marketing debe seguir siendo estático
npm run dev            # en otra terminal:
# 1) localStorage.removeItem("armio_cookie_consent_v2") en DevTools
# 2) abrir http://localhost:3000/        -> aviso visible
# 3) abrir http://localhost:3000/cookies -> aviso visible (REGRESIÓN CORREGIDA)
# 4) Aceptar -> el aviso desaparece y aparece el script de GA (Network: gtag/js)
# 5) Recargar /cookies -> el aviso no vuelve
# 6) Rechazar en pestaña nueva -> ninguna petición a googletagmanager
```

Test nuevo sugerido (`tests/unit/cookie-consent-banner.test.tsx`, `// @vitest-environment jsdom`, patrón de `tests/unit/visit-beacon.test.tsx`):

```ts
it("no renderiza nada si ya hay decisión guardada", …)      // localStorage = "accepted" -> container vacío
it("renderiza aviso y botones sin decisión", …)              // getByRole("region", {name:"Aviso de cookies"})
it("Aceptar guarda 'accepted' y oculta el aviso", …)         // localStorage + container vacío
it("Rechazar guarda 'rejected' y oculta el aviso", …)
it("enlaza la política de cookies", …)                       // href contiene /cookies
```

Guardia estática sugerida (en el mismo archivo o en `tests/unit/pages.test.ts`): leer `src/app/(marketing)/layout.tsx` y asertar que contiene `<CookieConsentBanner />`, para que nadie vuelva a dejar el aviso dentro de un componente de página.

**Criterios de éxito**

- El aviso aparece en **todas** las rutas de `(marketing)`, incluida `/cookies`.
- Sin decisión guardada no hay ninguna petición a `googletagmanager.com`.
- No hay error de hidratación en consola (el snapshot de servidor sigue siendo `"accepted"`).
- Nuevos tests en verde.

---

#### Tarea 3.3 — Decisión sobre el aviso en el portal (**requiere aprobación antes de implementar**)

| Campo       | Valor                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Complejidad | **Media** (A) / **Alta** (B)                                                                                                 |
| Archivos    | Opción A: ninguno de código. Opción B: `src/components/ui/CookieConsentBanner.tsx`, `src/app/(portal)/p/[tenant]/layout.tsx` |
| Depende de  | 3.1                                                                                                                          |

El diagnóstico original pide montar el mismo banner en el portal. La verificación de código muestra que **el portal no tiene ninguna tecnología que requiera consentimiento**:

- `AnalyticsGate` (GA4) no se importa en el árbol del portal.
- `VisitBeacon` no escribe cookies; solo `sessionStorage["armio:equipo"]`, de finalidad estrictamente técnica (excluir visitas del equipo), sin identificar a nadie.
- `TurnstileField` es de terceros pero es seguridad del formulario, ya declarada en `/privacidad` del portal, y se activa por interacción con el formulario.
- El consentimiento se persiste en `localStorage`, que **no cruza orígenes**: `armio.co` y `{slug}.armio.co` tienen almacenamientos separados, así que un banner en el portal nunca heredaría la decisión de la landing.

**Opción A (recomendada) — no montar banner de consentimiento en el portal.**
Cerrar el punto 3 con 3.1 + 3.2 (banner realmente global en marketing) y cubrir la transparencia del portal con las Tareas 4.1 y 5.1 (texto correcto + enlace a la política de cookies). Entregable: la sección §7 de este documento como registro de decisión. Coste: 0 de código, 0 riesgo de romper la estaticidad del portal.

**Opción B — si negocio/legal exige banner también en el portal.**
No reutilizar el texto de GA. Parametrizar el componente y montar una variante **informativa** (sin botones de aceptar/rechazar, solo «Entendido» + enlace), con su propia clave de almacenamiento:

1. `CookieConsentBanner.tsx`: añadir props `variant?: "consent" | "notice"`, `storageKey?: string`, `children`/`message`, y extraer las funciones de `consent.ts` para que acepten clave (hoy `CONSENT_KEY` es constante de módulo → requiere refactor de `src/lib/consent.ts`).
2. `(portal)/p/[tenant]/layout.tsx`: montar `<CookieConsentBanner variant="notice" … />` dentro del `<body>`, después de `<PortalFooter />`.
3. Estilos: el portal usa `portal.css` y paleta `stone/--portal-primary`; el banner actual está en paleta oscura `#0D1117/#00C47A` → hay que tematizarlo o se verá roto.
4. Verificar que `tests/unit/portal-pages-static.test.ts` sigue en verde (el componente es cliente, no usa APIs dinámicas → debe pasar, pero hay que confirmarlo).
5. Añadir cobertura e2e en `tests/e2e/portal.spec.ts` (el banner `position: fixed` puede tapar CTAs móviles y romper selectores existentes).

**Criterios de éxito (Opción A)**: decisión documentada en §7 con la evidencia de código (rutas y líneas), y ninguna afirmación de consentimiento sin tecnología que la respalde.
**Criterios de éxito (Opción B)**: banner visible en el portal con copy verificable (sin mencionar GA4), paleta del portal, `portal-pages-static` y e2e en verde, y texto coherente con `/privacidad` del portal.

---

### PUNTO 4 — Desalineación del aviso de privacidad del portal

#### Tarea 4.1 — Corregir el texto de `/privacidad` del portal

| Campo       | Valor                                                       |
| ----------- | ----------------------------------------------------------- |
| Complejidad | **Media** (texto legal; requiere revisión de negocio/legal) |
| Archivos    | `src/app/(portal)/p/[tenant]/privacidad/page.tsx`           |
| Depende de  | — (pero **4.2 debe ir en el mismo commit**)                 |

**Cambio 1 — sección «Datos que recolectamos» (líneas 76-82).**
Reemplazar la frase genérica por una que distinga portal y armio.co, y enlace la política de cookies:

> Cuando completas el formulario de interés recolectamos tu nombre, teléfono, correo electrónico (opcional) y el mensaje que decidas escribir, junto con la propiedad por la que preguntas. Este portal **no usa cookies publicitarias ni herramientas de analítica de terceros** (no hay Google Analytics ni píxeles de redes sociales en estas páginas): solo cuenta visitas de forma anónima, como se explica en «Estadísticas de visitas». El sitio corporativo de Armio ([armio.co](https://armio.co)) **sí** usa Google Analytics 4, que únicamente se activa si lo aceptas allí; puedes consultar el detalle en la [Política de cookies de Armio](https://armio.co/cookies).

> ⚠️ Conservar literalmente la subcadena **`ni herramientas de analítica de`** y **no** introducir la subcadena `no usa herramientas de analítica`, por las aserciones de `privacy-page.test.tsx:48-49`.

**Cambio 2 — sección «Estadísticas de visitas», líneas 95-105 (la desalineación realmente demostrable).**
Hoy dice _«No usamos cookies ni almacenamiento en tu navegador para seguirte»_, pero `VisitBeacon.tsx:31,39` escribe `sessionStorage["armio:equipo"]`. Sustituir por:

> No usamos cookies para seguirte, no creamos perfiles y no guardamos tu dirección IP, el tipo de navegador ni la dirección de la página de la que vienes. El único dato que puede quedar en tu navegador es una marca técnica de sesión (`armio:equipo`) que se crea **solo** si alguien del equipo de la inmobiliaria abre el sitio con un enlace interno, para que sus propias visitas no se cuenten; se borra al cerrar la pestaña y no identifica a nadie. Estas cifras se conservan hasta por 13 meses. […resto del párrafo actual sobre IP en memoria, clave diaria y user-agent, sin cambios…]

**Cambio 3 — retención explícita.** Verificar que «se conservan hasta por 13 meses» siga presente (lo asserta `privacy-page.test.tsx:39`). Si se mueve de párrafo, mantener la cadena exacta.

**Verificación**

```bash
npm test -- privacy-page            # debe pasar (con 4.2 aplicada)
npx tsc --noEmit && npm run lint
grep -n "armio:equipo\|armio.co/cookies" "src/app/(portal)/p/[tenant]/privacidad/page.tsx"
# Revisión manual: http://inmobiliaria-demo.localhost:3000/privacidad
```

Contraste texto↔código (hacer en la PR, es la verificación que faltó la primera vez):

```bash
grep -rn "sessionStorage\|localStorage\|document.cookie" src/portal        # solo armio:equipo
grep -rn "AnalyticsGate\|GoogleAnalytics" src/app/\(portal\)               # vacío  -> confirma punto 1
```

**Criterios de éxito**

- Ninguna afirmación del aviso contradice el código: toda frase absoluta («no usamos X») se corresponde con un `grep` vacío.
- El aviso menciona GA4 de armio.co y enlaza la política de cookies.
- `npm test`, `tsc`, `lint` en verde.

---

#### Tarea 4.2 — Actualizar `tests/unit/privacy-page.test.tsx`

| Campo       | Valor                              |
| ----------- | ---------------------------------- |
| Complejidad | **Baja**                           |
| Archivos    | `tests/unit/privacy-page.test.tsx` |
| Depende de  | Mismo commit que 4.1               |

**Cambios exactos**

- Reemplazar la aserción frágil `expect(html).toContain("ni herramientas de analítica de")` por una semántica: comprobar que aparece `"no hay Google Analytics"` y `"armio.co/cookies"`.
- Eliminar `expect(html).not.toContain("no usa herramientas de analítica")` si deja de tener sentido tras el cambio de copy, o reescribirla como guardia de la nueva frase prohibida.
- **Añadir** aserciones nuevas, que son el valor real del punto 4:
  - `expect(html).toContain("armio:equipo")` — la marca de sesión está declarada.
  - `expect(html).not.toContain("ni almacenamiento en tu navegador")` — la frase falsa no puede volver.
  - `expect(html).toContain("https://armio.co/cookies")` — punto 5 cubierto en el aviso.
  - `expect(html).toContain("se conservan hasta por 13 meses")` (mantener).

**Verificación**

```bash
npm test -- privacy-page
git stash && npm test -- privacy-page   # debe FALLAR sin los cambios de 4.1 -> el test prueba algo
git stash pop
```

**Criterios de éxito**: el test falla sin 4.1 y pasa con 4.1 (prueba efectiva, no tautológica).

---

### PUNTO 5 — Enlace a la política de cookies desde el portal y la landing

#### Tarea 5.1 — Centralizar `cookiesUrl` en `src/lib/legal.ts`

| Campo       | Valor                                                  |
| ----------- | ------------------------------------------------------ |
| Complejidad | **Baja**                                               |
| Archivos    | `src/lib/legal.ts`, `src/components/layout/Footer.tsx` |
| Depende de  | — (coordinar con 3.1, que también lo importa)          |

**Cambios exactos**

1. `src/lib/legal.ts`: añadir
   ```ts
   /** Política de cookies de armio.co: ruta estática del sitio de marketing, siempre disponible. */
   export const MARKETING_ORIGIN = "https://armio.co";
   export const cookiesUrl = `${MARKETING_ORIGIN}/cookies`;
   ```
   (No derivarla de `APP_URL`: `/cookies` vive en el sitio de marketing, no en la app; `APP_URL` puede estar sin definir y el enlace debe mostrarse igual.)
2. `Footer.tsx`: borrar la línea 9 (`const cookiesUrl = "https://armio.co/cookies";`) e importar `cookiesUrl` desde `@/lib/legal`.

**Verificación**

```bash
grep -rn '"https://armio.co/cookies"' src    # solo en src/lib/legal.ts
npx tsc --noEmit && npm test
```

**Criterios de éxito**: una sola definición de la URL en el repo; el enlace del footer de marketing sigue funcionando.

---

#### Tarea 5.2 — Enlace «Política de cookies» en el footer del portal

| Campo       | Valor                                    |
| ----------- | ---------------------------------------- |
| Complejidad | **Baja**                                 |
| Archivos    | `src/portal/components/PortalFooter.tsx` |
| Depende de  | 5.1                                      |

**Cambios exactos**

El bloque «Enlaces» (`PortalFooter.tsx`, lista con `/propiedades` y `/privacidad`) está **dentro de `{profile && …}`**, así que no se renderiza cuando el perfil falla (p. ej. `not-found`). Dos ubicaciones, se recomiendan **ambas**:

1. En la lista «Enlaces», tras «Aviso de privacidad», añadir un `<li>` con enlace externo (no `next/link`, porque sale a otro origen):
   ```tsx
   <li>
     <a href={cookiesUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
       Política de cookies
     </a>
   </li>
   ```
   con `import { cookiesUrl } from "@/lib/legal";`.
2. En la barra inferior (siempre renderizada, junto a «Hecho con Armio»), añadir el mismo enlace para que exista también sin perfil.

> Importante: `tests/unit/no-internal-urls.test.ts` renderiza `PortalFooter` y asserta `expect(html).not.toMatch(/\/p\//)`. La URL `https://armio.co/cookies` **no** contiene `/p/`, así que pasa; verificarlo de todos modos.

**Verificación**

```bash
npm test -- no-internal-urls
npm run dev
# http://inmobiliaria-demo.localhost:3000  -> footer con "Política de cookies" -> https://armio.co/cookies
# ruta inexistente (not-found)             -> el enlace sigue visible en la barra inferior
```

Test sugerido (ampliar `tests/unit/no-internal-urls.test.ts` o nuevo `tests/unit/portal-footer.test.tsx`):

```ts
it("el pie del portal enlaza la política de cookies de Armio", () => {
  const html = renderToStaticMarkup(createElement(PortalFooter, { profile: makeProfile() }));
  expect(html).toContain('href="https://armio.co/cookies"');
});
it("el enlace existe también sin perfil", () => {
  const html = renderToStaticMarkup(createElement(PortalFooter, { profile: null }));
  expect(html).toContain("https://armio.co/cookies");
});
```

**Criterios de éxito**

- `Política de cookies` visible en el footer del portal con y sin perfil.
- `rel="noopener noreferrer"` en todos los enlaces con `target="_blank"`.
- `no-internal-urls` y los tests nuevos en verde.

---

#### Tarea 5.3 — Enlace recíproco: `/cookies` → aviso de privacidad del portal

| Campo       | Valor                                  |
| ----------- | -------------------------------------- |
| Complejidad | **Baja**                               |
| Archivos    | `src/app/(marketing)/cookies/page.tsx` |
| Depende de  | —                                      |

La sección «¿El portal inmobiliario de cada inmobiliaria?» (`cookies/page.tsx`) afirma hoy _«La cuenta se hace internamente y sin cookies ni almacenamiento de seguimiento en tu navegador»_. Es defendible (`armio:equipo` es técnico y no de seguimiento), pero para que marketing y portal digan exactamente lo mismo:

1. Ajustar el bullet a _«…sin cookies; la única marca que puede quedar en el navegador es técnica, de sesión y para excluir las visitas del propio equipo de la inmobiliaria»_.
2. Añadir una frase con enlace: _«Cada portal publica su propio aviso de privacidad en `{inmobiliaria}.armio.co/privacidad`.»_

**Verificación**: `npm run dev` → `/cookies`; comparar frase a frase con `(portal)/…/privacidad/page.tsx`.
**Criterio de éxito**: ninguna contradicción entre `/cookies` (landing) y `/privacidad` (portal).

---

### PUNTO 1 — GA solo en marketing (sin cambios de código)

#### Tarea 1.1 — Registrar la decisión + guardia automática

| Campo       | Valor                                                                          |
| ----------- | ------------------------------------------------------------------------------ |
| Complejidad | **Baja**                                                                       |
| Archivos    | Este documento (§7) y, opcionalmente, `tests/unit/portal-pages-static.test.ts` |
| Depende de  | —                                                                              |

Guardia recomendada (barata y evita la regresión de que GA se filtre al portal):

```ts
it("el portal no monta analítica de terceros", () => {
  const sources = walk(path.resolve(__dirname, "../../src/portal"))
    .concat(files)
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  expect(sources).not.toMatch(/GoogleAnalytics|AnalyticsGate|gtag|googletagmanager/);
});
```

**Criterio de éxito**: el test pasa hoy y fallaría si alguien importa GA en el portal.

---

## 3. Dependencias y orden de ejecución

```
0 (vitest: NODE_ENV=development)  ──> prerrequisito de cualquier test de componente (3.2)

5.1 (cookiesUrl en legal.ts)
  ├─> 3.1 (extraer CookieConsentBanner, usa cookiesUrl)
  │     └─> 3.2 (montar en (marketing)/layout.tsx)  ──> 3.3 [decisión; Opción B si aplica]
  └─> 5.2 (enlace en PortalFooter)

4.1 (texto /privacidad portal) ⇄ 4.2 (test)   [mismo commit, inseparables]
5.3 (coherencia /cookies landing)             [independiente]
1.1 (decisión + guardia)                      [independiente]
```

Orden sugerido de commits/PRs:

| #   | Commit                                                            | Tareas                   | Riesgo                     |
| --- | ----------------------------------------------------------------- | ------------------------ | -------------------------- |
| 0   | `fix(test): React.act en los tests de componentes`                | 0                        | Nulo (solo config de test) |
| 1   | `refactor(legal): centraliza cookiesUrl`                          | 5.1                      | Nulo                       |
| 2   | `feat(cookies): aviso de cookies global en marketing`             | 3.1 + 3.2 (+ test nuevo) | Bajo                       |
| 3   | `fix(portal): alinea el aviso de privacidad con el código`        | 4.1 + 4.2                | Medio (texto legal)        |
| 4   | `feat(portal): enlaza la política de cookies`                     | 5.2 + 5.3                | Bajo                       |
| 5   | `test(portal): guardia de analítica de terceros`                  | 1.1                      | Nulo                       |
| 6   | (condicional) `feat(portal): aviso informativo de almacenamiento` | 3.3 Opción B             | Alto                       |

Bloqueos externos: 4.1 y 5.3 son texto legal → requieren OK de negocio/legal antes de mergear. 3.3 requiere decisión explícita antes de escribir código.

---

## 4. Verificaciones globales (ejecutar antes de cada PR)

```bash
cd /Users/stibenvelez/Documents/GitHub/Armio/armio-landing
npx tsc --noEmit                 # tipos
npm run lint                     # eslint (flat config)
npm run format:check             # prettier + prettier-plugin-tailwindcss
npm test                         # vitest: 22 suites unitarias
npm run build                    # el portal debe seguir estático/ISR
npm run test:e2e                 # playwright (portal) tras cambios de layout/footer
```

Checks manuales imprescindibles (ninguno es cubierto por los tests):

1. `localStorage.removeItem("armio_cookie_consent_v2")` → `/` y `/cookies` muestran el aviso; Aceptar carga `gtag/js`; Rechazar no hace **ninguna** petición a `googletagmanager.com` (verificar en Network con filtro `google`).
2. Portal (`http://inmobiliaria-demo.localhost:3000`): `Application → Cookies` vacío; `sessionStorage` vacío salvo tras entrar con `#equipo-armio`.
3. Footer del portal: el enlace a `https://armio.co/cookies` abre en pestaña nueva.
4. Sin errores de hidratación en consola en ninguna de las dos apps.

---

## 5. Criterios de éxito del plan completo

- [ ] El aviso de cookies se muestra en **todas** las rutas de `(marketing)`, incluida `/cookies` (hoy no lo hace).
- [ ] GA4 sigue cargándose **solo** tras aceptar, y **solo** en marketing (guardia automatizada).
- [ ] Toda afirmación absoluta de los textos legales está respaldada por un `grep` en el código: cookies, `localStorage`, `sessionStorage`, analítica de terceros.
- [ ] `/privacidad` del portal declara la marca técnica `armio:equipo` y aclara el uso de GA4 en armio.co.
- [ ] «Política de cookies» es alcanzable desde el footer del portal (con y sin perfil) y desde el footer y el aviso de marketing.
- [ ] `https://armio.co/cookies` está definida una sola vez en el repo (`src/lib/legal.ts`).
- [ ] `npm test` pasa **22/22 suites y 436/436 tests** (hoy: 19/22 y 377/436 por la Tarea 0).
- [ ] `tsc`, `lint`, `format:check`, `vitest` y `build` en verde; páginas del portal siguen estáticas.
- [ ] `privacy-page.test.tsx` falla si se revierte 4.1 (el test prueba el comportamiento, no el texto antiguo).
- [ ] La decisión del punto 3 para el portal queda escrita con su evidencia de código (§7).

---

## 6. Riesgos conocidos

| Riesgo                                                                                         | Prob.                                  | Impacto                                                                                 | Mitigación                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Las 3 suites de componentes (jsdom) ya están rojas en `main` por `React.act is not a function` | **Cierta**                             | El test nuevo del banner no puede pasar; se confunde rojo heredado con regresión propia | Tarea 0 primero (`env: { NODE_ENV: "development" }` en `vitest.config.ts`, verificado: 35/35).                                                                     |
| Reescribir el texto de `/privacidad` rompe `privacy-page.test.tsx:48-49`                       | **Alta**                               | Build roja                                                                              | 4.1 y 4.2 en el mismo commit; conservar `"se conservan hasta por 13 meses"` y la subcadena `ni herramientas de analítica de` o migrar la aserción deliberadamente. |
| Montar un banner de consentimiento en el portal afirma algo falso (allí no hay GA ni cookies)  | **Alta** si se implementa literalmente | Riesgo legal/reputacional inverso al que se quiere evitar                               | Opción A de 3.3; si se exige banner, variante informativa con copy verificable, nunca el texto de GA4.                                                             |
| El consentimiento en `localStorage` no cruza de `armio.co` a `{slug}.armio.co`                 | Cierta                                 | Un banner en el portal volvería a preguntar y daría sensación de incoherencia           | Documentarlo; si se necesita consentimiento compartido haría falta cookie en dominio `.armio.co` (cambio mayor, fuera de alcance).                                 |
| Un componente nuevo en `(portal)/…/layout.tsx` vuelve dinámicas las páginas del portal         | Media (solo Opción B)                  | Pierde ISR, sube coste y latencia                                                       | `tests/unit/portal-pages-static.test.ts` es la guardia; el componente debe ser cliente y sin `next/headers`.                                                       |
| Error de hidratación al mover el banner al layout                                              | Baja                                   | Warning en consola / parpadeo                                                           | Conservar el snapshot de servidor `"accepted"` de `useSyncExternalStore`.                                                                                          |
| Banner `position: fixed` tapa CTAs y rompe selectores de Playwright                            | Media (Opción B)                       | e2e roja                                                                                | Ejecutar `npm run test:e2e` y, si hace falta, cerrar el aviso en el `beforeEach`.                                                                                  |
| Paleta oscura del banner sobre el portal claro                                                 | Alta (Opción B)                        | Defecto visual                                                                          | Tematizar con variables del portal antes de montar.                                                                                                                |
| `privacyUrl` es `undefined` si falta `NEXT_PUBLIC_APP_URL` → el aviso pierde su enlace         | Media                                  | Transparencia reducida                                                                  | `cookiesUrl` es estático y siempre se muestra: cubre el hueco.                                                                                                     |
| El texto legal cambia sin revisión de negocio                                                  | Media                                  | Riesgo de cumplimiento                                                                  | 4.1/5.3 requieren aprobación explícita en la PR.                                                                                                                   |

---

## 7. Registro de decisiones

**D-1 (punto 1) — GA4 permanece exclusivamente en marketing.**
Evidencia: `AnalyticsGate` solo se importa en `src/app/(marketing)/layout.tsx:117`; el portal tiene su propio `<html>` en `src/app/(portal)/p/[tenant]/layout.tsx` sin analítica de terceros; `grep -rn "GoogleAnalytics|gtag" src/app/(portal) src/portal` → vacío. El único conteo del portal es `VisitBeacon` → `POST /api/portal/visits`, agregado y anónimo. **Sin cambios de código**; se añade una guardia de test (Tarea 1.1).

**D-2 (punto 3) — El aviso se hace global en marketing y el portal recibe una variante _informativa_ (Opción B acotada).**
Decisión de negocio tomada durante la implementación: se exige aviso visible también en el portal. Para no afirmar nada falso (allí no hay GA4 ni cookies de terceros) se montó `<CookieConsentBanner variant="notice" />` en `(portal)/p/[tenant]/layout.tsx`:

- Sin botones Aceptar/Rechazar (no hay nada que activar): solo «Entendido» + enlace a `https://armio.co/cookies`.
- Copy verificable: declara que no hay cookies publicitarias ni de terceros y que la única marca del navegador es técnica y de sesión (`armio:equipo`). El test `cookie-consent-banner.test.tsx` asserta que esta variante **no** menciona Google Analytics.
- Clave de almacenamiento propia (`armio_portal_storage_notice_v1`): `localStorage` no cruza orígenes, así que la decisión de armio.co no se reutiliza (ni se pretende reutilizar) en `{slug}.armio.co`.
- Paleta del portal (`stone` + `--portal-primary`), no la paleta oscura de marketing.
- Es un Client Component sin APIs dinámicas: `portal-pages-static.test.ts` sigue en verde y `next build` reporta los mismos modos de ruta que antes del cambio.
- Pendiente: `npm run test:e2e` (Playwright) no se ejecutó; el aviso es `position: fixed` y podría tapar CTAs móviles en los selectores existentes.

**D-2b (histórico) — La Opción A (no montar nada en el portal) queda descartada**, pero su razonamiento sigue vigente para el _contenido_ del aviso: el consentimiento solo tiene sentido donde hay tecnología que consentir.

**D-3 (punto 4) — La desalineación corregida es la del almacenamiento, no solo la de la analítica.**
`VisitBeacon.tsx:31,39` usa `sessionStorage["armio:equipo"]`, lo que contradice la frase «No usamos cookies ni almacenamiento en tu navegador para seguirte» (`privacidad/page.tsx:96`). Se declara explícitamente y se añade la aclaración sobre GA4 en armio.co.
