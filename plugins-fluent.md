# Plugins & fluent API

Use **tree-shakable** subpaths so bundlers include only what you need:

- `@hamdymohamedak/openfetch/plugins` — `retry`, `timeout`, `hooks`, `debug`, `strictFetch`
- `@hamdymohamedak/openfetch/sugar` — `createFluentClient` (fluent URL chains)

See [Getting started — Subpath imports](./getting-started.md#subpath-imports-tree-shaking) for import examples, [Configuration](./configuration.md) for request options, [Retry & cache](./retry-cache.md) for retry and cache middleware, [Interceptors & middleware](./interceptors-middleware.md) for stack order with `use()`, and **[Features & request pipeline](./features-pipeline.md)** for how plugins sit in the full stack.

## Plugins (`@hamdymohamedak/openfetch/plugins`)

| Export | Role |
|--------|------|
| **`retry(options?)`** | Wraps `createRetryMiddleware` with an `attempts` alias for `maxAttempts`. |
| **`timeout(ms)`** | Per-request timeout middleware (sets `timeout` on `ctx.request`). |
| **`hooks({ … })`** | Single middleware: **`onRequest`** / **`onResponse`** / **`onError`** around `next()`, plus **`onBeforeRetry`** and **`onAfterResponse`** merged into **`ctx.request.retry`** (same semantics as `OpenFetchRetryOptions`). |
| **`debug(options?)`** | Middleware: structured **request / response / error** phases (masking headers, redacting URLs). Distinct from **`createClient({ debug, logger })`** — see [Debugging](./debugging.md). |
| **`strictFetch()`** | Sets `redirect: "error"` when unset so redirects are not followed silently. |

### `hooks` and retry

When you combine **`hooks({ onBeforeRetry, onAfterResponse })`** with **`createRetryMiddleware`** / **`retry()`**:

- **`onBeforeRetry`** runs after a **failed** attempt, **before** backoff, when another attempt may still run.
- **`onAfterResponse`** runs after a **successful** `next()` produced **`ctx.response`** (i.e. after full **`dispatch`**, including **`transformResponse`**). Throw **`OpenFetchForceRetry`** (exported from the main package) from **`onAfterResponse`** to force another fetch attempt inside the retry loop.

Order reminder: register **retry** so it wraps the stack you want retried; **`hooks`** is usually **outside** retry if you want `onRequest` once per client call (see [Interceptors & middleware](./interceptors-middleware.md)).

## Fluent API (`@hamdymohamedak/openfetch/sugar`)

```ts
import { createFluentClient } from "@hamdymohamedak/openfetch/sugar";

const api = createFluentClient({ baseURL: "https://api.example" });

// Terminals start one HTTP request each (unless using .memo()).
const data = await api("/users").get().json();
const text = await api("/health").text();
```

- **`.json()`** — `unwrapResponse` + `responseType: "json"`.
- **`.json(schema)`** — same, plus **Standard Schema** validation (throws **`SchemaValidationError`** on failure), equivalent to passing **`jsonSchema`** on the config.
- **`.text()` / `.blob()` / `.arrayBuffer()` / `.stream()` / `.raw()` / `.send()`** — see source typings for `RequestChain`.
- **`.memo()`** — buffers **one** raw response for multiple terminals on the same chain (not a general HTTP cache).

The callable client also exposes **`use`**, **`interceptors`**, **`defaults`**, and the imperative **`get` / `post` / …** methods from `createClient`.
