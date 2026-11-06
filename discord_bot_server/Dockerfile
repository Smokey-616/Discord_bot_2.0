# =============================================
# DISCORD PERSONA CHATBOT - DOCKERFILE
# =============================================
# This bot runs on CLOUD SERVERS ONLY (AWS/GCP/DigitalOcean)
# NEVER deploy to your personal computer!

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set ownership
RUN chown -R appuser:appgroup /app
USER appuser

# Expose API port
EXPOSE 3001

# Health check (required for cloud load balancers)
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD node -e "process.exit(0)"

# Start the bot
CMD ["node", "index.js"]
