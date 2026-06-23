# Planificación de Concursos 2026

Lista de 114 concursos de marinera con una decisión por concurso (**sí / no / quizás**).
Las decisiones se guardan en el **servidor** (no solo en el navegador), así que se
sincronizan entre todos los dispositivos y personas que abran el link.

## Cómo funciona

- `index.html` — la lista. Estática, se sirve tal cual.
- `api/decisions.js` — función serverless que lee/escribe las decisiones.
- **Upstash Redis** — guarda las decisiones como un único *hash* (`concursos2026`),
  un campo por concurso. Guardar campo por campo evita que dos personas que editan
  a la vez se pisen las marcas.

La página pinta primero la copia local (carga instantánea, funciona offline) y luego
reconcilia con el servidor. Si se corta internet, los cambios quedan en una cola y se
reintentan solos al volver la conexión.

## Deploy en Vercel (una sola vez)

1. **Subí el repo** a GitHub (o importalo directo en Vercel).
2. En el dashboard de Vercel: **Storage → Create Database → Upstash Redis** (free tier).
   Asocialo al proyecto. Vercel inyecta solo las variables de entorno
   (`KV_REST_API_URL`, `KV_REST_API_TOKEN`).
3. **Deploy.** No hace falta configurar framework: Vercel detecta el `index.html`
   estático y la función en `/api`.

> El endpoint valida que solo se guarden ids reales (`d0…d113`) y valores `y/n/m`,
> así nadie puede meter basura. Aun así, **cualquiera con el link puede editar**:
> es un set compartido sin login, tal como se definió. Si más adelante querés que solo
> vos puedas cambiarlo, se agrega un PIN simple.

## Desarrollo local (opcional)

```bash
npm install
npm i -g vercel
vercel dev
```

Necesitás las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN` en un archivo `.env`
(las da Upstash en su consola). `vercel dev` levanta el estático y la función juntos.
