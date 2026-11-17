This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Seguridad: cabeceras HTTP y CSP

### Fuente única de cabeceras

Todas las cabeceras (seguridad y caché) se emiten desde `next.config.ts`, que delega en
`src/lib/security-headers.ts`. `vercel.json` **no declara `headers`**: así no hay dos fuentes que se
pisen, las cabeceras también existen con `next start`/E2E local y la política se puede probar en
Vitest (`tests/unit/csp.test.ts`). Vercel aplica de forma nativa las cabeceras de `next.config.ts`.

### CSP: enforcing con `'unsafe-inline'`, sin nonce (deuda documentada)

La política se construye en `src/lib/security-headers.ts` y se envía como
`Content-Security-Policy`. Incluye `default-src 'self'`, `object-src 'none'`, `frame-ancestors
'none'`, `base-uri 'self'`, `form-action 'self'` y `upgrade-insecure-requests` (solo en producción),
además de los terceros reales: Turnstile, OpenStreetMap, Sentry, GA4, R2/Armio/Cloudinary.

**No usamos nonce por request.** Un nonce obliga a renderizar todas las páginas de forma dinámica:
se pierde ISR y la caché de CDN de las fichas del portal (`revalidate: 300`/`3600`), y la guardia
`tests/unit/portal-pages-static.test.ts` exige que sigan siendo estáticas/ISR. Las páginas de
marketing también se prerenderizan, así que tampoco recibirían nonce. Por eso `script-src` mantiene
`'unsafe-inline'`:

```
script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com
```

Deuda y plan de migración:

1. La respuesta incluye además `Content-Security-Policy-Report-Only` con el mismo `script-src` pero
   **sin** `'unsafe-inline'`. No bloquea nada; sirve para medir en staging/DevTools qué scripts
   inline habría que cubrir antes de apretar la política. No tiene `report-uri` (no se envían datos
   a terceros).
2. Para pasar a nonce haría falta: `proxy.ts` generando nonce + `Content-Security-Policy` por
   request, convertir las páginas del portal a dinámicas (renunciando a ISR) o migrar a hash/SRI
   con `'strict-dynamic'`, y actualizar la guardia de páginas estáticas.
3. Los estilos siguen con `'unsafe-inline'` (`framer-motion` y atributos `style`).

Si algún día se pasa un `videoSrc` de YouTube/Vimeo a `DemoVideo`, hay que añadir
`https://www.youtube-nocookie.com`, `https://www.youtube.com` y `https://player.vimeo.com` a
`frame-src`; hoy no se usa ningún embed.

### HTTPS, HSTS y redirección

- Vercel sirve HTTPS con certificados automáticos y redirige `http://` a `https://` en todos los
  dominios propios: la plataforma aporta la redirección, no hace falta una regla extra.
- HSTS: `Strict-Transport-Security: max-age=63072000; includeSubDomains` (2 años).
- **`preload` se omite a propósito**: entrar en la lista exige auditar todos los subdominios y la
  salida puede tardar meses. `includeSubDomains` ya protege los subdominios que se visitan. Para
  activarlo: verificar que cada subdominio público sirve solo HTTPS, añadir `; preload` en
  `src/lib/security-headers.ts` y enviar el dominio en <https://hstspreload.org>.

### Resto de cabeceras

`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (coherente con `frame-ancestors 'none'`),
`Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy` con `camera`,
`microphone`, `geolocation`, `payment`, `usb`, `interest-cohort` y `browsing-topics` cerrados. La
geolocalización se mantiene cerrada porque el mapa es un iframe con bbox fijo y el sitio no usa la
API del navegador.

### Verificación

La prueba unitaria (`npm test`) solo valida que la política configurada exista y conserve las
directivas clave; **la verificación real es en staging** (y luego producción) con:

- <https://securityheaders.com> — nota de cabeceras y CSP.
- <https://developer.mozilla.org/observatory> (Mozilla Observatory) — análisis de la CSP.

Al comprobar, revisar la consola del navegador en `/` y en un portal (`{slug}.armio.co`): no debe
haber errores de violación de CSP, y Turnstile/el mapa deben seguir funcionando tras el
consentimiento/click correspondiente.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
