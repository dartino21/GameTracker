# AGENTS.md - GameTracker (аналог Letterboxd для видеоигр)

## Общее описание

Веб-приложение для отслеживания пройденных игр, выставления оценок и ведения игрового дневника. Пользователи могут искать игры через RAWG API, добавлять их в свой журнал с статусами («Играю», «Пройдено», «Заброшено», «В планах»), ставить оценки и писать заметки. Реализован импорт библиотеки из Steam. Приложение публичное, развёрнуто на VPS с собственным доменом, служит проектом для портфолио full-stack разработчика.

## Технологический стек

- **Фреймворк:** Next.js 14+ (App Router) + TypeScript (строгий режим)
- **Стилизация:** Tailwind CSS + shadcn/ui (компоненты на Radix UI)
- **База данных:** PostgreSQL, ORM - Prisma
- **Аутентификация:** NextAuth.js (Credentials + OAuth: Discord, Google, Steam)
- **Внешние API:** RAWG (основной источник данных об играх), IGDB (резерв), Steam Web API (импорт библиотеки)
- **Загрузка файлов:** Uploadthing (аватарки) + Next.js Image proxy для обложек
- **Тестирование:** Vitest + React Testing Library + Playwright (E2E)
- **CI/CD:** GitHub Actions (линтер, тесты, сборка Docker-образа, деплой)
- **Деплой:** Docker Compose на VPS (Ubuntu, Nginx reverse proxy, Let's Encrypt)
