# Debugging & observability

openFetch gives you two complementary ways to see what happens around HTTP: a **built-in debug pipeline** on `createClient` (structured lifecycle events), and a **`debug()` middleware** for request/response/error snapshots. The package also ships **redaction utilities** and **typed errors** so diagnostics stay useful without leaking secrets.

## Built-in debug pipeline (`createClient`)

Enable structured logging on the client defaults (or per request). When `debug` is set, each call emits **`OpenFetchDebugEvent`** objects with at least:

- **`stage`** — Where you are in the lifecycle (see tables below).
- **`timestamp`** — `Date.now()` when the event was emitted.
- **Additional fields** — Depends on the stage (`url`, `status`, `durationMs`, `reason`, …).

### Enablement

```ts
import { createClient } from "@hamdymohamedak/openfetch";

const client = createClient({
  debug: true, // same as "verbose"
  logger: (log) => {
    // Optional. Omit to use console.debug with an [OpenFetch] prefix.
    console.debug(log.stage, log);
  },
});
```

| `debug` value | Behavior |
|---------------|----------|
| **`true`** or **`"verbose"`** | Full pipeline: merge/init, outgoing request, each fetch attempt, parse, schema, retries, final response, errors. |
| **`"basic"`** | Only **`request`**, final **`response`**, and **`error`** (good for production-style tracing with less noise). |
| **`false`** / omitted | No pipeline events. |

Per-request overrides merge like the rest of `OpenFetchConfig`: you can set `debug: "basic"` on the client and `debug: "verbose"` on a single `client.get(url, { debug: "verbose" })` when investigating one call.

### Typical development setup

```ts
const client = createClient({
  debug: import.meta.env.DEV ? "verbose" : false,
  logger: (e) => {
    if (import.meta.env.DEV) console.debug("[API]", e);
  },
});
```

On Node you can use `process.env.NODE_ENV === "development"` the same way.

### Custom sink (DevTools, APM, tests)

The **`logger`** function receives one structured object per event. You can forward to OpenTelemetry, a test spy, or a small in-memory ring buffer:

```ts
const events: import("@hamdymohamedak/openfetch").OpenFetchDebugEvent[] = [];

const client = createClient({
  debug: "verbose",
  logger: (log) => {
    events.push(log);
  },
});
```

The exported type **`OpenFetchDebugEvent`** is `{ stage: string; timestamp: number } & Record<string, unknown>` — treat unknown keys as optional metadata.

### Stages (verbose)

These stages are emitted when **`debug`** is **`true`** or **`"verbose"`** (not for **`"basic"`** except where noted):

| Stage | When | Useful fields (examples) |
|-------|------|---------------------------|
| **`config`** | After merge, before `init` | `method`, `url` (redacted path), `hasJsonSchema`, `retryMaxAttempts`, … |
| **`init`** | After all `init[]` callbacks | `hooksRun` |
| **`request`** | After request interceptors, before middleware | **`basic` too** — `method`, `url` (fully built + query redacted), optional **`headers`** (masked) |
| **`attempt_start`** | Start of each retry loop iteration | `attempt`, `maxAttempts` |
| **`fetch`** | Before `fetch()` for that attempt | `attempt`, `method`, `url`, `headers` (masked) |
| **`fetch_complete`** | After headers received | `attempt`, `status`, `statusText`, `durationMs`, `contentLength` (if server sent `Content-Length`) |
| **`parse`** | After body read / parse | `attempt`, `ok`, `responseType` or `skipped` + `reason` for `rawResponse` |
| **`schema`** | After Standard Schema validation (if `jsonSchema` set) | `attempt`, `ok`, `issueCount` on failure |
| **`hook_after_response`** | When `onAfterResponse` throws **`OpenFetchForceRetry`** | `hook`, `action` |
| **`retry`** | When scheduling another attempt after a failure | `failedAttempt`, `nextAttempt`, **`reason`**, `delayMs` |
| **`response`** | **End of successful client call** (**`basic` too**) | `status`, `statusText`, **`durationMs`** (wall time for the whole call, including retries) |
| **`error`** | Uncaught failure from the client run (**`basic` too**) | `name`, `message`, `code` for **`OpenFetchError`**, `stack` (truncated), `durationMs` |

**Retry reasons** (on the **`retry`** stage) include values such as **`forceRetry`**, **`timeout`**, **`http_503`**, **`network`**, **`parse`**, **`retryBudget`**, **`canceled`**, **`unknown`** — derived from the error about to trigger backoff.

### Privacy defaults

- **URLs** in debug events use the same **sensitive query redaction** as **`redactSensitiveUrlQuery`** (tokens, passwords, `code`, etc. → `[REDACTED]` by default).
- **Headers** on **`request`** and **`fetch`** are passed through **`maskHeaderValues`** (authorization, cookies, API keys, …).

Do not log raw tokens in your own **`logger`** implementation; treat events as **trusted dev output** only.

---

## `debug()` middleware (`@hamdymohamedak/openfetch/plugins`)

The **`debug(options?)`** export is a **middleware** that wraps **`next()`** and logs three phases: **`request`**, **`response`**, **`error`**. It does **not** know about merge, retry attempt indices, or schema validation — it is lighter and stack-local.

```ts
import { createClient } from "@hamdymohamedak/openfetch";
import { debug } from "@hamdymohamedak/openfetch/plugins";

const client = createClient({
  middlewares: [
    debug({
      includeRequestHeaders: true,
      maskStrategy: "partial",
      maskUrlQuery: true,
      log: (phase, payload) => console.debug("[openfetch]", phase, payload),
    }),
  ],
});
```

Options include **`maskHeaders`**, **`maskStrategy`**, **`sensitiveQueryParamNames`**, **`sensitiveQueryParamReplacement`**, and **`enabled`**. See [Plugins & fluent API](./plugins-fluent.md).

### When to use which

| Need | Use |
|------|-----|
| Full lifecycle, retries, parse/schema, one switch on the client | **`createClient({ debug, logger })`** |
| Quick middleware-only traces, or logs only around `fetch` | **`debug()` plugin** |
| Both | Possible; avoid duplicate noise by using **`"basic"`** on the client or disabling the plugin’s **`log`** when the pipeline is verbose. |

---

## Typed errors and safe shapes

For **user-facing** or **cross-service** errors, serialize with **`OpenFetchError.toShape()`** / **`toJSON()`** instead of logging the `Error` instance directly. By default, shapes **omit** sensitive fields and can **redact URLs** (see [Errors & security](./errors-security.md)).

Use **`isOpenFetchError`**, **`isHTTPError`**, **`isTimeoutError`**, and **`isSchemaValidationError`** to branch in **`logger`** or global handlers.

---

## Other debugging-related exports

| Export | Use in debugging |
|--------|------------------|
| **`maskHeaderValues`** | Build your own logs or UI with the same masking rules as the pipeline. |
| **`redactSensitiveUrlQuery`** | Redact query params in arbitrary URL strings. |
| **`DEFAULT_SENSITIVE_QUERY_PARAM_NAMES`** | Extend or document what the package treats as sensitive. |
| **`cloneResponse`** | Clone a native **`Response`** if you read the body in middleware and still want OpenFetch or the browser to consume it. |
| **`OpenFetchForceRetry`**, **`isOpenFetchForceRetry`** | Understand forced retries in **`retry.onAfterResponse`**. |

---

## Hooks and interceptors

For **custom** spans (e.g. “before business mapper”), combine the debug pipeline with:

- **`hooks({ onRequest, onResponse, onError, onBeforeRetry, onAfterResponse })`** — see [Plugins & fluent API](./plugins-fluent.md) and [Retry & cache](./retry-cache.md).
- **Request / response interceptors** — see [Interceptors & middleware](./interceptors-middleware.md).

The built-in pipeline shows **when** the stack runs; your hooks carry **domain** context.

---

## Fluent client

**`createFluentClient`** is built on **`createClient`**, so **`debug`** and **`logger`** on defaults apply to fluent chains as well.

---

## See also

- [Configuration](./configuration.md) — full `OpenFetchConfig` reference  
- [Features & request pipeline](./features-pipeline.md) — order of merge, interceptors, middleware, dispatch  
- [Errors & security](./errors-security.md) — `toShape`, redaction, safe logging  
- [Retry & cache](./retry-cache.md) — retry options and `OpenFetchForceRetry`  
- [Plugins & fluent API](./plugins-fluent.md) — `debug()`, `hooks()`, `retry()`  
