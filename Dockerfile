# Base stage
FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lockb ./

# Development stage
FROM base AS development
RUN bun install
COPY . .
CMD ["bun", "run", "dev"]

# Build stage
FROM base AS build
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/bun.lockb ./
RUN bun install --production --frozen-lockfile
EXPOSE 3000
CMD ["bun", "run", "start"]
