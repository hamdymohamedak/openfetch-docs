# Errors & security

## `OpenFetchError`

Subclass of `Error` with optional:

- **`code`** — Machine-readable string  
- **`config`** — Merged request config (may contain secrets)  
- **`response`** — Present for failed `validateStatus` (`ERR_BAD_RESPONSE`)  
- **`request`** — `{ url }` when available  

### Codes (common)

| Code | Meaning |
|------|---------|
| `ERR_BAD_RESPONSE` | HTTP status failed `validateStatus` |
| `ERR_NETWORK` | Network / unexpected throw from `fetch` |
| `ERR_PARSE` | Response body could not be parsed |
| `ERR_CANCELED` | Aborted (typically external `signal` or user abort) |
| `ERR_TIMEOUT` | Per-request **`timeout`** elapsed (internal timer aborted `fetch` before user signal) |
| `ERR_RETRY_TIMEOUT` | Total retry budget (`retry.timeoutTotalMs`) exceeded (monotonic clock) |
| `ERR_UNDICI_REQUIRED` | `allowH2: true` was set but dynamic `import("undici")` failed — install [`undici`](https://www.npmjs.com/package/undici) yourself (not shipped with openFetch) |

## `isOpenFetchError`

Type guard: `err is OpenFetchError`.

## `isHTTPError` / `isTimeoutError`

- **`isHTTPError(err)`** — `OpenFetchError` with **`code === "ERR_BAD_RESPONSE"`** and a **`response`** attached.
- **`isTimeoutError(err)`** — `OpenFetchError` with **`ERR_TIMEOUT`** (per-attempt fetch timeout) or **`ERR_RETRY_TIMEOUT`** (whole retry sequence budget).

## `SchemaValidationError` / `isSchemaValidationError`

Thrown when **`jsonSchema`** or fluent **`.json(schema)`** validation fails. **Not** an `OpenFetchError` (the HTTP round-trip succeeded; the schema rejected the body). Use **`isSchemaValidationError`** for narrowing.

## Logging — `toShape()` / `toJSON()`

`toShape()` returns a plain object: `message`, `status`, `url`, `method`, optional `data` / `headers`, `code`.

- **`config.auth` is omitted** from the shape, but the **live error instance** may still hold full `config` — do not send it raw to clients.
- For shared or client-facing logs, prefer:

```ts
error.toShape({
  includeResponseData: false,
  includeResponseHeaders: false,
});
```

Default `toShape()` / `toJSON()` **includes** response data and headers (backward compatible).

## `assertSafeHttpUrl(url)`

Optional **server-side** guard when the URL may be influenced by **untrusted** input.

- Allows only **`http:`** / **`https:`**.
- Rejects **localhost** and **literal** private / loopback / link-local **IPv4** and common **IPv6** cases.
- Does **not** stop **DNS rebinding** (hostname resolving to internal IPs). Combine with hostname allowlists, egress controls, or proxies as needed.

Throws `Error` with messages prefixed `openfetch: assertSafeHttpUrl:`.

## Header redaction for custom logs

When you build your own log lines (outside the **`debug`** plugin), use **`maskHeaderValues`** from the main package with **`MaskHeaderStrategy`** **`partial`** or **`hash`** — same strategies as **`debug({ maskStrategy, … })`**. See [Configuration](./configuration.md) for the export table.

## `cloneResponse`

If you hold a native **`Response`** (for example from **`rawResponse`** or **`.raw()`**) and need to read the body twice, use **`cloneResponse(res)`** from the package (or **`res.clone()`** on the `Response`).

## Memory cache and auth

See [Retry & cache](./retry-cache.md): use **`varyHeaderNames`** or a custom key for per-user GETs.

## Further reading

- Package **`SECURITY.md`** and **`npm run test:security`** (security test harness in the repo).
