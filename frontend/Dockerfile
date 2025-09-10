FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for file watching
RUN apk add --no-cache inotify-tools

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Create non-root user for development
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Create .next directory with proper permissions
RUN mkdir -p /app/.next/cache && \
    mkdir -p /app/.next/trace && \
    chown -R nextjs:nodejs /app

# Set up proper permissions
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables for hot reloading
ENV PORT=3000
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Start the application with hot reload
CMD ["npm", "run", "dev"]