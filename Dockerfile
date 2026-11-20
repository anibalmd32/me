# syntax=docker/dockerfile:1

FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY . .
ARG PUBLIC_CONTACT_ENDPOINT=""
ARG PUBLIC_CONTACT_ACCESS_KEY=""
ENV PUBLIC_CONTACT_ENDPOINT=$PUBLIC_CONTACT_ENDPOINT \
    PUBLIC_CONTACT_ACCESS_KEY=$PUBLIC_CONTACT_ACCESS_KEY \
    ASTRO_TELEMETRY_DISABLED=1
RUN npm run build

FROM joseluisq/static-web-server:2
COPY --from=build /app/dist /public
ENV SERVER_ROOT=/public \
    SERVER_PORT=8080 \
    SERVER_PAGE404=/public/404.html \
    SERVER_HEALTH=true \
    SERVER_CACHE_CONTROL_HEADERS=true \
    SERVER_SECURITY_HEADERS=true \
    SERVER_LOG_LEVEL=warn
USER 65534:65534
EXPOSE 8080
