# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 4173
CMD ["pnpm", "run", "dev:docker"]

FROM base AS build
ARG SITE_URL
ARG VITE_METRIKA_ID
ARG ALLOW_LOCAL_PRODUCTION_PREVIEW=false
ENV SITE_URL=${SITE_URL}
ENV VITE_METRIKA_ID=${VITE_METRIKA_ID}
ENV NODE_ENV=production
ENV ALLOW_LOCAL_PRODUCTION_PREVIEW=${ALLOW_LOCAL_PRODUCTION_PREVIEW}
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build && pnpm run check:seo && pnpm run check:registry-sync && pnpm run check:external-links && pnpm run check:mobile-safety && pnpm run check:runtime-contracts

FROM node:22-alpine AS api
WORKDIR /app
RUN addgroup -S -g 10001 app && adduser -S -D -H -u 10001 -G app app
COPY --chown=app:app server ./server
COPY --chown=app:app scripts/check-registry-sync.mjs ./scripts/check-registry-sync.mjs
COPY --chown=app:app data/plots.json ./seed/plots.json
USER app
EXPOSE 8787
CMD ["node", "server/registry-api.mjs"]

# Stable Alpine 3.24 receives current security fixes; Dependabot tracks this tag.
FROM nginx:stable-alpine3.24 AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
