<img width="903" height="696" alt="chrome-capture-2026-07-13" src="https://github.com/user-attachments/assets/b9462d77-edbc-45f4-8fe3-33cd0218145c" />


# GameTracker

GameTracker - веб-приложение для ведения игрового дневника: поиск игр через RAWG, добавление игр в личный журнал, статусы прохождения, оценки, заметки, профили пользователей и базовая социальная активность.

Проект сделан как full-stack портфолио-приложение на Next.js, PostgreSQL и Prisma.

## Возможности

- Регистрация и вход по email/паролю.
- OAuth-вход через Google и Discord.
- Поиск игр через RAWG API с серверным кешем.
- Страницы игр с обложкой, описанием, жанрами, платформами, скриншотами, рейтингом RAWG и ссылками на магазины.
- Добавление игр в журнал со статусами `Playing`, `Completed`, `Dropped`, `PlanToPlay`.
- Оценка игры от 1 до 10, дата прохождения и заметки.
- Публичные профили пользователей с журналом игр.
- Фильтрация журнала по статусу и сортировка по дате или оценке.
- Загрузка и удаление аватара в настройках профиля.
- Модель друзей в базе данных и блок активности друзей на главной/страницах игр.
- Docker Compose окружение с приложением и PostgreSQL.
- CI для lint, тестов при наличии и сборки приложения/Docker-образа.


<img width="1133" height="909" alt="image" src="https://github.com/user-attachments/assets/e0aacdfa-3b5a-4894-aeb1-4ecf52c3ffad" />



## Стек

- Next.js 16, App Router, TypeScript
- React 19
- Tailwind CSS 4
- shadcn/ui, Radix UI, lucide-react
- NextAuth.js 4
- Prisma 7
- PostgreSQL 16
- RAWG API
- Docker, Docker Compose
- GitHub Actions

## Требования

- Node.js 24.x
- npm 11.x или совместимая версия npm
- PostgreSQL 16+ для локального запуска без Docker
- Docker Desktop для запуска через Docker Compose
- RAWG API key

## Переменные окружения

Создайте `.env` на основе `.env.example`.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gametracker?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
RAWG_API_KEY=""
```

Обязательные для базового запуска:

- `DATABASE_URL` - строка подключения к PostgreSQL.
- `NEXTAUTH_URL` - URL приложения, локально обычно `http://localhost:3000`.
- `NEXTAUTH_SECRET` - секрет для NextAuth.
- `RAWG_API_KEY` - ключ RAWG API для поиска и страниц игр.

OAuth-переменные нужны только если вы хотите включить вход через Google или Discord.

Сгенерировать локальный `NEXTAUTH_SECRET` можно так:

```bash
openssl rand -base64 32
```

Если `openssl` недоступен на Windows, можно использовать PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Запуск на Windows

### Вариант 1: через Docker Compose

Самый простой способ, если установлен Docker Desktop.

```powershell
copy .env.example .env
```

Заполните `RAWG_API_KEY` и при необходимости OAuth-переменные в `.env`.

```powershell
npm install
npm run docker:dev
```

Приложение будет доступно на `http://localhost:3000`.

Остановить контейнеры:

```powershell
npm run docker:down
```

### Вариант 2: локальный Node.js + PostgreSQL

1. Установите Node.js 24 и PostgreSQL.
2. Создайте базу данных `gametracker`.
3. Создайте `.env`:

```powershell
copy .env.example .env
```

4. Проверьте `DATABASE_URL`, например:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gametracker?schema=public"
```

5. Установите зависимости и подготовьте Prisma:

```powershell
npm install
npm run prisma:generate
npm run db:push
```

6. Запустите dev-сервер:

```powershell
npm run dev
```

Откройте `http://localhost:3000`.

## Запуск на macOS

### Вариант 1: через Docker Compose

```bash
cp .env.example .env
```

Заполните `RAWG_API_KEY` и при необходимости OAuth-переменные в `.env`.

```bash
npm install
npm run docker:dev
```

Приложение будет доступно на `http://localhost:3000`.

Остановить контейнеры:

```bash
npm run docker:down
```

### Вариант 2: локальный Node.js + PostgreSQL

Установить зависимости удобно через Homebrew:

```bash
brew install node postgresql@16
brew services start postgresql@16
```

Создайте базу данных:

```bash
createdb gametracker
```

Создайте `.env`:

```bash
cp .env.example .env
```

Проверьте `DATABASE_URL`. Для локального PostgreSQL без пароля он может выглядеть так:

```env
DATABASE_URL="postgresql://localhost:5432/gametracker?schema=public"
```

Установите зависимости, примените схему и запустите проект:

```bash
npm install
npm run prisma:generate
npm run db:push
npm run dev
```

Откройте `http://localhost:3000`.

## Основные команды

```bash
npm run dev              # dev-сервер Next.js
npm run build            # production-сборка
npm run start            # запуск production-сборки
npm run lint             # ESLint
npm run prisma:generate  # генерация Prisma Client
npm run prisma:migrate   # создание и применение dev-миграции
npm run db:push          # синхронизация схемы с БД без миграции
npm run prisma:studio    # Prisma Studio
npm run docker:dev       # запуск приложения и PostgreSQL в Docker
npm run docker:down      # остановка Docker Compose окружения
```

## Работа с базой данных

Схема находится в `prisma/schema.prisma`.

Основные модели:

- `User` - пользователь, OAuth-аккаунты, email/password, аватар.
- `Game` - игра из RAWG, локально кешируется по `rawgId`.
- `UserGame` - запись в журнале пользователя.
- `Review` - текстовый отзыв к игре.
- `Friendship` - связь между пользователями.
- `Account`, `Session`, `VerificationToken` - модели NextAuth.

Для локальной разработки сейчас чаще всего достаточно:

```bash
npm run db:push
```

Если нужна история изменений схемы, используйте:

```bash
npm run prisma:migrate
```

Открыть интерфейс базы:

```bash
npm run prisma:studio
```

## Структура проекта

```text
src/
  app/                    # страницы и route handlers App Router
  app/api/auth/           # NextAuth route
  app/api/search/         # поиск игр через RAWG
  app/api/journal/        # API журнала пользователя
  components/             # UI и доменные компоненты
  generated/prisma/       # сгенерированный Prisma Client
  lib/                    # Prisma, RAWG helpers, validation
  types/                  # расширения типов
prisma/
  schema.prisma           # схема базы данных
.github/workflows/
  ci.yml                  # CI pipeline
```

## API приложения

- `GET /api/search?q=<query>` - поиск игр в RAWG.
- `POST /api/journal` - добавить игру в журнал текущего пользователя.
- `PUT /api/journal/:id` - обновить запись журнала.
- `DELETE /api/journal/:id` - удалить запись журнала.
- `GET/POST /api/auth/*` - NextAuth.

`/api/journal/*` требует авторизованную сессию.

## Качество и CI

Локально перед коммитом полезно запускать:

```bash
npm run lint
npm run build
```

В GitHub Actions настроены:

- установка зависимостей через `npm ci`;
- lint;
- `npm test --if-present`;
- `npm run build`;
- сборка Docker-образа.

В проекте пока нет отдельного test script, поэтому CI не падает на отсутствии тестов.

## Docker

`docker-compose.yml` поднимает два сервиса:

- `app` - Next.js dev-сервер на `3000`;
- `db` - PostgreSQL 16 на `5432`.

Внутри Docker используется строка подключения:

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/gametracker?schema=public"
```

Снаружи контейнеров, например для локальных Prisma-команд, используйте:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gametracker?schema=public"
```

## Полезные заметки

- RAWG API обязателен для поиска, популярных игр и страниц игр.
- Обложки и скриншоты грузятся через `next/image`; в `next.config.ts` разрешены HTTPS-источники.
- Аватар сейчас сохраняется в базе как `data:` URL, ограничение файла - 700 KB.
- Prisma Client генерируется в `src/generated/prisma`.
- После изменения `prisma/schema.prisma` запускайте `npm run prisma:generate` и синхронизируйте БД через `db:push` или миграции.
- Если порт `3000` занят, можно запустить Next.js на другом порту:

```bash
npm run dev -- --port 3001
```

## Roadmap

- Импорт библиотеки Steam.
- Steam OAuth.
- Загрузка аватаров через внешний storage.
- Полноценные отзывы и лайки на UI.
- Управление друзьями в интерфейсе.
- Unit, integration и E2E тесты.
- Production Docker image и деплой на VPS через Nginx/Let's Encrypt.
