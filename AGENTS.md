# GameTracker

## Идея

GameTracker — это **Letterboxd для видеоигр**: личный игровой дневник, где пользователь фиксирует свой опыт с играми, а не просто каталогизирует библиотеку.

Главная ценность — **журнал прохождения**: что играл, что прошёл, что бросил, что в планах; с оценкой, датой и заметками. Вокруг этого строится социальный слой: публичные профили и активность друзей, чтобы видеть, во что играют другие.

Проект публичный, развёрнут на VPS с собственным доменом и служит **full-stack портфолио**.

## Доменная модель

| Сущность | Назначение |
|----------|------------|
| `User` | Пользователь: email/пароль, OAuth (Google, Discord), аватар, username |
| `Game` | Игра из RAWG, кешируется локально по `rawgId` |
| `UserGame` | Запись в журнале: статус, оценка 1–10, дата прохождения, заметки |
| `Review` | Текстовый отзыв к игре (модель есть, UI в разработке) |
| `Friendship` | Связь между пользователями (модель есть, UI в разработке) |

Статусы журнала (`GameStatus`): `Playing`, `Completed`, `Dropped`, `PlanToPlay`.

Игра из RAWG — **источник метаданных** (обложка, жанры, платформы). Пользовательская оценка и заметки живут в `UserGame`, не в `Game`.

## Стек

- **Next.js 16** (App Router) + **TypeScript** (strict)
- **React 19**, **Tailwind CSS 4**, **shadcn/ui** (Radix UI)
- **PostgreSQL** + **Prisma 7** (client: `src/generated/prisma`)
- **NextAuth.js 4** — Credentials + OAuth (Google, Discord)
- **RAWG API** — поиск и страницы игр
- **Zod** — валидация в `src/lib/*-validation.ts`
- **Docker Compose** — локальная разработка; **GitHub Actions** — CI

## Структура кода

```text
src/
  app/              # страницы и route handlers (App Router)
  app/api/          # search, journal, auth
  components/       # UI и доменные компоненты
  components/ui/    # shadcn/ui примитивы
  lib/              # prisma, games (RAWG), validation
  generated/prisma/ # сгенерированный Prisma Client
prisma/schema.prisma
```

## Соглашения

- **Язык UI** — русский. Код, типы, enum-значения в БД — английский.
- **Визуальный стиль** — ретро-терминал: JetBrains Mono, CRT-эффекты, акцентные рамки. Новый UI должен вписываться в эту эстетику.
- **Server Components** по умолчанию; `"use client"` только при необходимости интерактива.
- **Валидация** — Zod-схемы в `lib/`, не inline в route handlers.
- **Авторизация** — `getServerSession(authOptions)`; `/api/journal/*` только для авторизованных.
- **Игры** — сначала ищем/кешируем через RAWG (`lib/games.ts`), затем связываем с `UserGame`.
- После изменения `schema.prisma` — `npm run prisma:generate` и `db:push` или миграция.

## API

- `GET /api/search?q=` — поиск игр в RAWG
- `POST /api/journal` — добавить игру в журнал
- `PUT /api/journal/:id` — обновить запись
- `DELETE /api/journal/:id` — удалить запись
- `GET/POST /api/auth/*` — NextAuth

## Roadmap (ещё не реализовано)

Не добавляй эти фичи без явного запроса, но учитывай при проектировании:

- Импорт библиотеки Steam и Steam OAuth
- Загрузка аватаров через внешний storage (сейчас `data:` URL, лимит 700 KB)
- Полноценные отзывы и лайки в UI
- Управление друзьями в интерфейсе
- Unit, integration и E2E тесты
- Production-деплой на VPS (Nginx, Let's Encrypt)

## Команды

```bash
npm run dev              # dev-сервер
npm run build            # production-сборка
npm run lint             # ESLint
npm run prisma:generate  # генерация Prisma Client
npm run db:push          # синхронизация схемы с БД
npm run docker:dev       # Docker Compose (app + PostgreSQL)
```

## Ponytail

For coding work, prefer the simplest solution that works: first reuse project code, then the standard library, native platform features, and installed dependencies. Avoid speculative abstractions, new dependencies, and boilerplate. Fix bugs at the shared root cause after checking callers. Keep the diff small, but do not cut validation, data-safety handling, security, accessibility, or the explicitly requested scope. Add one minimal runnable check for non-trivial new logic.
