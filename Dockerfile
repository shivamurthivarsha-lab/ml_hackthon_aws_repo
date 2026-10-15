# Multi-stage Dockerfile for Smart Campus Resource Hub
# Stage 1: Build the React frontend
FROM node:20-alpine AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy backend dependencies and files
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Copy built frontend from Stage 1 into /app/frontend/dist
COPY --from=build-frontend /app/frontend/dist /app/frontend/dist

EXPOSE 5000

CMD ["node", "server.js"]
