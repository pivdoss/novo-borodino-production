# syntax=docker/dockerfile:1

FROM node:26-alpine AS base
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
ARG SITE_INDEXABLE=false
ARG ALLOW_LOCAL_PRODUCTION_PREVIEW=false
ENV SITE_URL=${SITE_URL}
ENV VITE_METRIKA_ID=${VITE_METRIKA_ID}
ENV SITE_INDEXABLE=${SITE_INDEXABLE}
ENV NODE_ENV=production
ENV ALLOW_LOCAL_PRODUCTION_PREVIEW=${ALLOW_LOCAL_PRODUCTION_PREVIEW}
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build && pnpm run check:seo && pnpm run check:external-links && pnpm run check:mobile-safety && pnpm run check:runtime-contracts && pnpm run check:page


# Stable Alpine 3.24 receives current security fixes; Dependabot tracks this tag.
FROM nginx:stable-alpine3.24 AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
