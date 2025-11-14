# Build stage for frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source files
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps

# Copy server files
COPY server/ ./server/
COPY data/ ./data/
COPY scripts/ ./scripts/

# Copy built frontend from build stage
COPY --from=frontend-build /app/dist ./dist

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server/server.js"]
