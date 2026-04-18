# Configuration

Configuration is merged from **client defaults** and **per-call** options via `mergeConfig` (see merge rules below).

## `OpenFetchConfig` (request)

### URL and query

- **`url`** — Absolute or relative (with `baseURL`).
- **`baseURL`** — Prepended to non-absolute paths (see URL helpers in the package: `buildURL`, `combineURLs`, `isAbsoluteURL`).
- **`params`** — Plain object serialized to a query string (default serializer; override with **`paramsSerializer`**).
- **`paramsSerializer`** — `(params: Record<string, unknown>) => string`. When set, it **replaces** the built-in serialization for that request (merged config). Use for repeated keys, bracket notation, or custom encoding.

### Method and body

- **`method`** — HTTP method; helpers set this automatically.
- **`data`** — Logical payload: after **`transformRequest`** hooks, objects (except `FormData`, `URLSearchParams`, `Blob`, `ArrayBuffer`, typed arrays) are JSON-stringified; `content-type` defaults to `application/json` if missing.
- **`body`** — Raw `fetch` body when you do not use `data` the same way; dispatch uses `data` if defined, else `body`.

### Headers and auth

- **`headers`** — `Record<string, string>` (normalized to lowercase keys internally for the outgoing request).
- **`auth`** — `{ username, password }` → `Authorization: Basic …`.
- **`withCredentials: true`** — Sets `credentials: 'include'` unless **`credentials`** is set explicitly.

### Timeouts and cancellation

- **`timeout`** — Milliseconds; uses an internal `AbortController` merged with **`signal`** via `mergeAbortSignals`. When the **internal** timeout fires first (user signal not aborted), the error code is **`ERR_TIMEOUT`**. Pure user abort → **`ERR_CANCELED`**.
- **`signal`** — External `AbortSignal`; combined with timeout abort.

### Response handling

- **`responseType`** — `"json"` | `"text"` | `"arraybuffer"` | `"blob"` | `"stream"`.  
  If omitted, dispatch infers JSON from `Content-Type: application/json`, otherwise reads as text. When **`responseType`** is set and **`accept`** is missing, dispatch sets a **suggested `Accept`** header (e.g. `application/json` for `json`).
- **`rawResponse`** — When **`true`**, **`dispatch`** returns an **`OpenFetchResponse`** whose **`data`** is the native **`Response`** with an **unread body**. Body parsing and the **`transformResponse`** chain are **skipped**. **Request** interceptors still ran earlier; **response** interceptors still run and see `data` as that `Response`. Middleware that expects parsed JSON in **`ctx.response.data`** will not see transforms until you call **`response.json()`** / **`text()`** yourself. Pair with **`cloneResponse`** (package export) if you need two independent reads of the same `Response`.
- **`validateStatus`** — `(status: number) => boolean`. Default: 200–299 inclusive. If false, throws **`OpenFetchError`** with code `ERR_BAD_RESPONSE` and attaches the response.
- **`throwHttpErrors`** — Used **only when `validateStatus` is omitted**. Ky-style control: `false` means never throw on HTTP status (same as `validateStatus: () => true`). A function `(status) => boolean` means **throw** when it returns **`true`** for that status. If **`validateStatus`** is provided, **`throwHttpErrors` is ignored**.
- **`jsonSchema`** — Optional [Standard Schema](https://github.com/standard-schema/standard-schema) (e.g. Zod 3.24+) applied to **parsed JSON** after a **successful** `validateStatus`. On failure throws **`SchemaValidationError`** (not `OpenFetchError`). Runs **before** the **`transformResponse`** chain.
- **`init`** — Array of **synchronous** `(config) => void` callbacks on the **merged** config, after `mergeConfig` and **before** request interceptors. Use to attach headers, tweak options, etc.

### Request input

- Besides `string | URL` and a config object, **`client.request(nativeRequest, overrides?)`** accepts a **`Request`**. URL, method, headers, body, `signal`, and supported `RequestInit` fields are copied from the `Request`, then **shallow-overridden** by merged defaults + `overrides`.

### Transforms

- **`transformRequest`** — Array of `(data, headers) => unknown`. Run in order before building the fetch body.
- **`transformResponse`** — Array of `(data) => T`. Run on successful responses after parsing.

### Middleware, retry, cache hints

- **`middlewares`** — Array of middleware functions (concatenated with defaults).
- **`retry`** — Shallow-merged retry options for `createRetryMiddleware` (defaults + per request).
- **`memoryCache`** — Per-request overrides for cache middleware: `ttlMs`, `staleWhileRevalidateMs`, `skip`.

### Ergonomics

- **`unwrapResponse`** — When `true`, `get`/`post`/… return **`data` only** instead of full `OpenFetchResponse`. Useful for RSC and minimal call sites.

### Debugging (observability)

- **`debug`** — `true`, `"verbose"`, `"basic"`, or omit / `false` for off. When enabled, emits structured **`OpenFetchDebugEvent`** records for the HTTP lifecycle (merge, fetch per attempt, parse, schema, retries, final response, errors). **`"basic"`** limits events to **`request`**, **`response`**, and **`error`**.
- **`logger`** — `(event) => void` sink when **`debug`** is enabled; omit to log via **`console.debug`**. See **[Debugging & observability](./debugging.md)** for stages, privacy defaults, and how this differs from the **`debug()`** plugin.

### `RequestInit` passthrough

These `RequestInit` fields are typed on `OpenFetchConfig` and passed to `fetch`:

`cache`, `credentials`, `integrity`, `keepalive`, `mode`, `redirect`, `referrer`, `referrerPolicy`.

## `OpenFetchResponse`

```ts
type OpenFetchResponse<T = unknown> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: OpenFetchConfig;
};
```

## Other exports (main package)

Useful when building tooling, logs, or custom middleware:

| Export | Role |
|--------|------|
| `assertSafeHttpUrl(url)` | Optional guard for untrusted URLs (see [Errors & security](./errors-security.md)). |
| `maskHeaderValues(headers, options?)` | Redact sensitive header values (`partial` / `hash` strategies). |
| `cloneResponse(res)` | Clone a native `Response` so the body can be read more than once. |
| `generateIdempotencyKey`, `hasIdempotencyKeyHeader`, `ensureIdempotencyKeyHeader` | Helpers for POST retry idempotency (see [Retry & cache](./retry-cache.md)). |
| `InterceptorManager` | Low-level stack; normally you use `client.interceptors`. |
| `SchemaValidationError`, `isSchemaValidationError` | Standard Schema failures on `jsonSchema` / fluent `.json(schema)`. |
| `OpenFetchForceRetry`, `isOpenFetchForceRetry` | Throw from `retry.onAfterResponse` to force another attempt. |
| `isHTTPError`, `isTimeoutError` | Narrow `OpenFetchError` by `code` / semantics. |
| Standard Schema types | `StandardSchemaV1`, `StandardSchemaV1InferOutput`, … (types only). |
| Types | `OpenFetchConfig`, `OpenFetchResponse`, `Middleware`, `OpenFetchContext`, … |

Plugins and fluent client live under **`@hamdymohamedak/openfetch/plugins`** and **`/sugar`** — see [Plugins & fluent API](./plugins-fluent.md).

## Merge behavior (`mergeConfig`)

- Top-level keys: later config wins.
- **`headers`**: shallow merge; per-call headers override defaults.
- **`middlewares`**, **`transformRequest`**, **`transformResponse`**, **`init`**: **concatenated** (defaults first, then call-specific).
- **`retry`**, **`memoryCache`**: shallow merge of scalar fields; **`retry.onBeforeRetry`** and **`retry.onAfterResponse`** are **composed** (defaults run first, then per-call).
- Prototype-pollution keys (`__proto__`, `constructor`, `prototype`) are stripped from merged objects and nested `headers` / `retry` / `memoryCache`.

## Quick checklist (common options)

| Goal | Config / approach |
|------|-------------------|
| JSON API base URL | `baseURL` + relative `url`; `get`/`post` helpers |
| Query string | `params` or custom `paramsSerializer` |
| Bearer token | `headers: { authorization: "Bearer …" }` |
| Timeout | `timeout` (ms) or `timeout(ms)` plugin |
| Cancel | `signal` from `AbortController` |
| Only body value | `unwrapResponse: true` |
| Binary / file | `responseType: "blob"` or `"arraybuffer"` |
| Streaming | `responseType: "stream"` |
| Raw `fetch` `Response` | `rawResponse: true` or fluent `.raw()` |
| Retries | `createRetryMiddleware` or `retry()` plugin |
| GET caching | `createCacheMiddleware` + `MemoryCacheStore` |
| Structured lifecycle logs | `debug` + optional `logger` on defaults (see [Debugging](./debugging.md)) |

## Next

- [Debugging & observability](./debugging.md) — client debug pipeline, `debug()` plugin, safe logging  
- [Features & request pipeline](./features-pipeline.md) — full feature list and diagrams  
- [Plugins & fluent API](./plugins-fluent.md)  
- [Interceptors & middleware](./interceptors-middleware.md)
