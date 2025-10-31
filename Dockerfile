## Build stage for Vite app
## Build stage: build the Vite app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

## Production stage: run a Node server that serves static files and provides the API
FROM node:18-alpine AS production
WORKDIR /app
# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built client and server code
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "server/index.js"]