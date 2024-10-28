# Base stage
FROM node:18 AS base
WORKDIR /app
COPY package.json yarn.lock ./

# Development stage
FROM base AS development
RUN yarn install
COPY . .
CMD ["yarn", "run", "dev"]

# Production stage
FROM base AS production
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn run build
RUN yarn install --production --frozen-lockfile
EXPOSE 8001
CMD ["yarn", "run", "start"]
