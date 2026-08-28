# ВкусоВоз — Design System MASTER

> Warm gastronomic delivery. Тёплый, домашний, надёжный.  
> Stack: Next.js 16 + Tailwind CSS 4 (`@theme inline`, no `tailwind.config`).  
> Locale: `ru`, fonts via `next/font/google` с `display: swap`, subsets `latin + cyrillic`.

---

## 1. Colors — Semantic Tokens

Все цвета — через CSS-переменные в `:root` + проброс в `@theme inline` как `--color-*` для Tailwind.

### Spec 10.3 (основа)

| Token | Hex | Использование |
|-------|-----|---------------|
| `--background` / `--color-background` | `#FAF7F2` | Фон приложения, warm canvas |
| `--surface` / `--color-surface` | `#FFFFFF` | Карточки, модалки, header |
| `--foreground` / `--color-foreground` | `#1D1B18` | Основной текст `text-primary` |
| `--muted` / `--color-muted` | `#EDE4D9` | muted bg, hover `bg-muted`, card subtle |
| `--muted-foreground` / `--color-muted-foreground` | `#6B6259` | `text-secondary`, подписи, placeholder — контраст 7:1 на `#FAF7F2` |
| `--border` / `--color-border` | `#EDE4D9` | Границы, разделители, card stroke |
| `--primary` / `--color-primary` | `#C74D2D` | CTA, активные цены, primary button |
| `--primary-hover` / `--color-primary-hover` | `#A93F24` | Hover/active для primary |
| `--secondary` / `--color-secondary` | `#2F5D50` | Вторичный, хедер категории, trust block |
| `--accent` / `--color-accent` | `#C07A3B` | warm ochre — replaces cold blue, analogous 14°→31° harmony (Nature Distilled #61, Recipe & Cooking #97), links, icons, focus ring, borders |
| `--success` / `--color-success` | `#2E8B57` | Успех, подтверждение заказа |
| `--warning` / `--color-warning` | `#D99A2B` | Предупреждение, ожидание |
| `--danger` / `--color-danger` | `#C0392B` | Ошибка, удаление из корзины |

### Research merge

| Token | Hex | Роль |
|-------|-----|------|
| `--warm` / `--color-warm` | `#FFF7ED` | Warm palette дополнение — подсветка секций, бейдж «печём», alt-background для промо-блоков. Не заменяет `#FAF7F2`, используется как `bg-warm` для акцентов. |
| `--accent` | `#C07A3B` | warm ochre — replaces cold blue, analogous 14°→31° harmony. Только для focus-visible, иконок, borders, hover bg-muted alt. Не для CTA — CTA остаётся `#C74D2D`. Контраст 3:1 — только large/UI, не для body text. |

**Правила:**
- CTA всегда `primary`, never `accent`.
- `accent` ≤10% площади экрана.
- Текст на `background`/`warm` только `foreground`/`muted` — контраст ≥ 7:1.
- `border` всегда `#EDE4D9` в light, `#332E29` в dark.

### Dark mode (minimal)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #1A1816;
    --surface: #252220;
    --foreground: #FAF7F2;
    --muted: #A99E92;
    --border: #332E29;
    --warm: #1E1B18;
  }
}
```
Сохраняет тёплую гамму, не инвертирует палитру. Primary/secondary/accent без изменений.

---

## 2. Typography

| Роль | Шрифт | Переменная | Веса | Применение |
|------|-------|------------|------|------------|
| Heading | **Inter** | `--font-heading` | 500, 600, 700 | `h1–h6`, цена, название блюда |
| Body | **Manrope** | `--font-body` | 400, 500, 600 | body, описания, UI-текст |

```ts
import { Inter, Manrope } from "next/font/google"
const inter = Inter({ subsets: ["latin","cyrillic"], weight: ["500","600","700"], display: "swap", variable: "--font-heading" })
const manrope = Manrope({ subsets: ["latin","cyrillic"], weight: ["400","500","600"], display: "swap", variable: "--font-body" })
```

- `html { font-size: 16px; line-height: 1.5; Antialiased }`
- `body { font-family: var(--font-body); background: var(--background); color: var(--foreground) }`
- Headings: `font-family: var(--font-heading); text-wrap: balance`
- Tailwind: `font-heading`, `font-body` через `@theme inline`.

**Шкала:**
`xs 12 / sm 14 / base 16 / lg 18 / xl 20 / 2xl 24 / 3xl 30 / 4xl 36` — line-height 1.5 для body, 1.2–1.25 для headings, letter-spacing `-0.01em` для крупных заголовков.

---

## 3. Spacing

Базовый шаг **4px**. Tailwind spacing по умолчанию (4 = 16px). Рекомендуемые отступы:

- Компонент: `p-4` (16), `p-6` (24), `gap-3` (12), `gap-4` (16)
- Секция: `py-12` (48) mobile, `py-16` (64) desktop, `gap-8` (32) между блоками
- Карточка: `p-5` (20) / `p-6` (24)
- Контент max-width: `max-w-7xl` + `px-4 sm:px-6 lg:px-8`

---

## 4. Radius

```css
--radius-card: 20px;   /* --radius-card  → rounded-card */
--radius-button: 12px; /* --radius-button → rounded-button */
--radius-input: 12px;  /* --radius-input  → rounded-input */
--radius-pill: 9999px; /* --radius-pill   → rounded-pill */
```
- Card: `20px`
- Button / Input / Badge: `12px`
- Pill (фильтры, теги, количество): `9999px`
- Не использовать `rounded-sm`/`rounded-xl` произвольно — только токены.

---

## 5. Motion

- Длительность: **150–200ms** для micro-interactions (`transition duration-150 to duration-200`)
- Easing: `ease-out` (вход), `ease-in` (выход), `ease-in-out` для перемещения
- Hover: `transition-colors` / `transition-opacity` / `transition-transform`
- По умолчанию: `scroll-behavior: smooth` на `html`
- **Reduced motion:** 
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```

---

## 6. Shadows — Soft

Тёплые, рассеянные, без холодного синего оттенка.

```css
--shadow-soft: 0 4px 24px rgba(29, 27, 24, 0.06);
--shadow-card: 0 8px 32px rgba(29, 27, 24, 0.08);
--shadow-float: 0 12px 40px rgba(29, 27, 24, 0.12);
```
Применение: карточки `shadow-soft`, поднятые `shadow-card`, модалки `shadow-float`. Border + shadow вместе для глубины.

---

## 7. Utilities — Globals

- **Antialiased:** `html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale }` + `antialiased` на `<html>`/`<body>`
- **Scrollbar:** тонкий `8px`, `track: background`, `thumb: border` → `muted` на hover, `rounded-pill`, `scrollbar-width: thin` fallback
- **Focus-visible:** `*:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }` — единственный ring, всегда `accent`
- **Selection:** `::selection { background: var(--primary); color: var(--surface) }`

---

## 8. Anti-patterns

| ❌ Не делать | ✅ Вместо |
|--------------|-----------|
| AI-generated фото еды | Реальные фото блюд, снятые при мягком свете, на `surface`/`warm` фоне |
| Шум, grain, брутальные текстуры | Чистый `background #FAF7F2`, мягкие тени, много воздуха |
| Холодный серый фон `#F5F5F5` | Тёплый `#FAF7F2` / `#FFF7ED` |
| Ярко-синий CTA | CTA только `primary #C74D2D` → hover `#A93F24` |
| Более 2 шрифтов | Только Inter (heading) + Manrope (body) |
| `tailwind.config.js` / `tailwind.config.ts` | Только `@theme inline` в `globals.css` |
| `rounded-full` без токена на кнопках | `rounded-button` (12px) / `rounded-pill` (9999px) только для тегов |
| Длительные анимации >300ms | 150–200ms, respect `prefers-reduced-motion` |
| Outline без accent | `focus-visible` всегда `accent #C07A3B` |

---

## 9. Tailwind 4 Usage

```css
@import "tailwindcss";
@theme inline { /* все --color-*, --radius-*, --font-* */ }
```

Классы: `bg-background`, `bg-surface`, `bg-warm`, `text-foreground`, `text-muted`, `bg-primary hover:bg-primary-hover`, `bg-secondary`, `text-accent`, `border-border`, `rounded-card`, `rounded-button`, `font-heading`, `font-body`.

Проверка: `npm run build` должен пройти без `tailwind.config` файла.
