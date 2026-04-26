# البدء

## التثبيت

الحزمة على npm: [**@hamdymohamedak/openfetch**](https://www.npmjs.com/package/@hamdymohamedak/openfetch). المستودع: [**openfetch-js/OpenFetch**](https://github.com/openfetch-js/OpenFetch) على GitHub.

```bash
npm install @hamdymohamedak/openfetch
```

الحزمة **ESM فقط** (`"type": "module"`). استورد من `"@hamdymohamedak/openfetch"`.

### مسارات فرعية (تقليل الحجم عند التجميع)

```ts
import openFetch from "@hamdymohamedak/openfetch";
import { retry, timeout } from "@hamdymohamedak/openfetch/plugins";
import { createFluentClient } from "@hamdymohamedak/openfetch/sugar";
```

راجع [الإضافات والواجهة السلسة](./plugins-fluent.md). **Node 18+** أو أي بيئة فيها `fetch` و`AbortController`.

### اختياري: HTTP/2 على Node ووكلاء مخصصون (`undici`)

المكتبة **لا** تشحن `undici` ولا تعلنها كـ dependency أو peer على npm. إذا احتجت `dispatcher` من Undici (مثلاً HTTP/2 عبر `allowH2: true` أو `Agent` مخصص)، ثبّتها بنفسك — `npm install undici` — ثم مرّر **`dispatcher`** أو فعّل **`allowH2: true`**. التفاصيل: [الإعدادات](./configuration.md#node-undici-dispatcher).

## المثيل الافتراضي

التصدير الافتراضي هو عميل أُنشئ بـ `createClient()` دون قيم افتراضية أولية:

```ts
import openFetch from "@hamdymohamedak/openfetch";

const res = await openFetch.get("https://api.example.com/v1/users");
// res من نوع OpenFetchResponse: { data, status, statusText, headers, config }
```

## عميل مسمّى بـ `createClient` / `create`

`createClient` و`create` اسمان لنفس الدالة. مرّر **القيم الافتراضية الأولية**؛ يمكنك لاحقاً تعديل `client.defaults`.

```ts
import { createClient } from "@hamdymohamedak/openfetch";

const api = createClient({
  baseURL: "https://api.example.com",
  headers: { Authorization: "Bearer <token>" },
  timeout: 10_000,
  unwrapResponse: true,
});

const users = await api.get("/v1/users");
// عند unwrapResponse: true، users هي الجسم المفسَّر فقط (T) وليس OpenFetchResponse
```

## مساعدات HTTP (نظرة سريعة)

كل دالة تُرجع `Promise<OpenFetchResponse<T>>` ما لم يكن `unwrapResponse` مفعّلاً، وعندها `Promise<T>`.

| الدالة | ملاحظات |
|--------|---------|
| `request(urlOrConfig, config?)` | سلسلة `url` أو `URL` أو كائن إعداد كامل |
| `get`، `head`، `options` | عنوان + إعداد اختياري |
| `post`، `put`، `patch` | عنوان، `data` اختياري، إعداد اختياري — الكائنات العادية تُسلسل JSON مع `content-type` إن لم تُضبط |
| `delete` | عنوان + إعداد اختياري |

**العنوان مطلوب:** إذا لم يكن للإعداد المدمج `url`، يرمي العميل: ``openfetch: `url` is required``.

لأمثلة تفصيلية لكل فعل، راجع [طرق HTTP](./http-methods.md).

## تسجيل الوسيط

```ts
import { createClient, createRetryMiddleware } from "@hamdymohamedak/openfetch";

const client = createClient({
  middlewares: [createRetryMiddleware()],
});
// أو لاحقاً:
client.use(createRetryMiddleware({ maxAttempts: 5 }));
```

راجع [المعترضات والوسيط](./interceptors-middleware.md) و[إعادة المحاولة والتخزين المؤقت](./retry-cache.md).

## التالي

- [طرق HTTP](./http-methods.md)  
- [الإضافات والواجهة السلسة](./plugins-fluent.md)  
- [React و Vue](./framework-guides.md)  
- [الإعدادات](./configuration.md)
