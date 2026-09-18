FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend ./backend
COPY frontend/package.json ./frontend/package.json

RUN npm ci
RUN npm run build --workspace @paroquia/backend

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend ./backend

RUN chmod +x /app/backend/docker-entrypoint.sh

WORKDIR /app/backend
EXPOSE 3000
ENTRYPOINT ["/app/backend/docker-entrypoint.sh"]