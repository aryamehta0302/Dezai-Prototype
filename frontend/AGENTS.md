<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Summary

### Route handlers: `params` is a Promise (v15+)
In Next.js 15+, `params` in route handler context is a `Promise`. You must `await` it before use. This applies to all dynamic routes including catch-all (`[...slug]`).

### Route handlers: use `export async function`, not `export const`
Export handler functions with `export async function GET(request) {}` rather than `export const { GET } = handlers` (re-export from destructuring). The `export const` pattern for catch-all dynamic routes may cause Next.js to serve HTML instead of JSON for route handler responses.

### Auth.js v5 beta.31 handlers take 1 arg only
`handlers.GET`/`POST` accept only `(req: NextRequest)`. Do NOT pass `{ params }` as a second argument even though Next.js 16 provides it in the route handler signature. The wrapper function should be:
```ts
export async function GET(request: Request) {
  return handlers.GET(request);
}
```

### AUTH_URL should end with `/api/auth`
Despite Auth.js docs suggesting AUTH_URL is the app URL, `parseUrl()` in `next-auth/lib/client.js` uses `http://localhost:3000/api/auth` as the default URL and extracts `basePath` from the pathname. If AUTH_URL pathname is `/`, fallback is `/api/auth`. Setting `AUTH_URL=http://127.0.0.1:3000/api/auth` explicitly is the standard convention.

### Dev server warnings are normal
During `next dev` with Turbopack, you may see periodic console errors (like `ClientFetchError`) during module compilation. These occur when a route handler module is still being compiled by Turbopack and Next.js serves the error HTML page instead. These resolve once compilation completes and do NOT occur in production builds.
