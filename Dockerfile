FROM node:24-alpine AS deps

WORKDIR /app

ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gametracker?schema=public"
ENV DATABASE_URL=$DATABASE_URL

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

FROM node:24-alpine AS development

WORKDIR /app

ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gametracker?schema=public"
ENV DATABASE_URL=$DATABASE_URL
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
