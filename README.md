# ВкусоВоз — доставка еды

Тёплая гастрономическая витрина + корзина + оформление заказа. Демо-режим без реальной оплаты и доставки — все заказы и платежи эмулируются.

> **Демо-режим** — проект работает без бэкенда платежей/курьеров. Авторизация, корзина и промокоды (`VKUS10` — 10%, `HELLO500` — 500 ₽) — мок. Данные сидируются в Postgres, но UI также показывает `lib/mock-data.ts` при отсутствии БД.

## Стек

- Next.js 16 (App Router, `typedRoutes`, RSC + Client Components)
- React 19, TypeScript strict
- Tailwind CSS 4 (`@theme inline`, CSS-переменные), `clsx` + `tailwind-merge`
- Prisma 6 + PostgreSQL 16, `bcryptjs`
- Zustand (корзина, persist `localStorage`), TanStack Query 5 (`staleTime 30s`)
- React Hook Form + Zod, `lucide-react`, `date-fns`

## Архитектура слоёв

```
app/                 — маршруты (page/layout/error/not-found), globals.css
components/ui|layout|restaurant|dish|cart|checkout
lib/
  mock-data.ts       — мок-рестораны/блюда/коллекции
  store/cart.ts      — zustand-корзина (persist, 1 ресторан)
  validators/*       — zod-схемы (checkout, auth, dish …)
  utils.ts           — cn()
prisma/
  schema.prisma      — User/Restaurant/Dish/Order/Payment/Review/Promo…
  seed.ts            — 3 ресторана, категории, блюда, промокод VKUS10
middleware.ts / proxy.ts — редирект /account, /restaurant-panel, /admin
```

- UI — дизайн-токены (`--primary`, `--radius-card` …), `focus-visible`, `prefers-reduced-motion`, кастомный скроллбар, `overflow-x-hidden`.
- Состояние — серверные данные через Query, клиентское — Zustand.
- Валидация — Zod + RHF на клиенте, Prisma на сервере.
- Доступ — middleware по cookie `vkusovoz_session`.

## Локальный запуск

```bash
pnpm install
cp .env.example .env   # заполните DATABASE_URL / AUTH_SECRET
docker-compose up -d   # postgres:5432 (healthcheck), pgAdmin опционально --profile tools
pnpm db:generate
pnpm db:migrate        # prisma migrate dev
pnpm db:seed           # 3 ресторана + VKUS10
pnpm dev               # http://localhost:3000
```

Проверка:

```bash
pnpm lint
pnpm typecheck
pnpm format            # prettier + tailwind plugin
pnpm build && pnpm start
```

## Переменные окружения (.env.example)

| Переменная | Назначение |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Postgres (Prisma) |
| `POSTGRES_DB/USER/PASSWORD` | docker-compose |
| `NEXT_PUBLIC_APP_URL` | базовый URL |
| `NODE_ENV` | `development` / `production` |
| `AUTH_SECRET` | подпись сессии (≥32 симв.) |
| `SESSION_COOKIE_NAME`, `SESSION_MAX_AGE` | cookie сессии |
| `PAYMENT_PROVIDER` | `MOCK` по умолчанию |
| `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY` | (опц.) реальный провайдер |
| `REDIS_URL` | (опц.) rate-limit |
| `SMTP_HOST/PORT/USER/PASS`, `EMAIL_FROM` | (опц.) почта |
| `S3_BUCKET/REGION`, `CLOUDINARY_URL` | (опц.) загрузка изображений |

См. `.env.example` — скопируйте и заполните секреты, не коммитьте `.env`.

## Демо-роли (seed)

| Роль | Email | Пароль | Доступ |
|---|---|---|---|
| Админ | `admin@vkusovoz.local` | `Admin123!` | `/admin` |
| Владелец пекарни | `owner.bakery@vkusovoz.local` | `Owner123!` | `/restaurant-panel` |
| Владелец суши | `owner.tokio@vkusovoz.local` | `Owner123!` | `/restaurant-panel` |
| Владелец бургерной | `owner.burger@vkusovoz.local` | `Owner123!` | `/restaurant-panel` |
| Пользователь | `user@vkusovoz.local` | `User123!` | `/account`, корзина |

Промокод: `VKUS10` — 10% (мин. 1000 ₽, макс. скидка 500 ₽, 30 дней).

## Известные ограничения

- Оплата — `MOCK` (без эквайринга); YooKassa — заготовка.
- Доставка/курьеры — эмуляция статусов, без карт/трекинга.
- Загрузка изображений — внешние URL (`picsum.photos`, `images.unsplash.com`), без S3.
- Поиск/фильтры каталога — клиентские на моках; пагинация — позже.
- i18n — только `ru`, без переключения языка.

## Деплой

- `next build` — standalone; `DATABASE_URL` обязателен.
- Миграции: `prisma migrate deploy` на проде.
- `docker-compose.yml` — только Postgres; приложение деплоится отдельно (Vercel/Docker).
- `next.config.ts` — `typedRoutes: true`, `images.remotePatterns` для Unsplash/Picsum.

## Лицензия

Демо-проект, без лицензии.
