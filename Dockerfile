# Base stage
FROM node:18 AS base
WORKDIR /app
COPY package.json yarn.lock ./

# Development stage
FROM base AS development
RUN yarn install
COPY . .
CMD ["yarn", "run", "dev"]

# Build stage
FROM base AS build
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/yarn.lock ./
RUN yarn install --production --frozen-lockfile
EXPOSE 8001
CMD ["yarn", "run", "start"]
