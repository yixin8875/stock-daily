# ================================
# Build Stage
# ================================
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# ================================
# Production Stage
# ================================
FROM node:18-alpine AS runtime

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Install only production dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production && \
    npx prisma generate && \
    npm cache clean --force

# Copy built files from builder stage
COPY --from=builder --chown=nodeuser:nodejs /app/dist ./dist

# Copy entrypoint script
COPY --chown=nodeuser:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Health check endpoint
ENV PORT=3000

# Start application
ENTRYPOINT ["./docker-entrypoint.sh"]
