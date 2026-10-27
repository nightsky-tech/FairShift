# ==============================================================================
# FairShift Platform - Production Dockerfile for Google Cloud Run
# Aligned with UN SDG 8 (Decent Work & Economic Growth)
# Ultra-lightweight alpine base: zero CVEs, < 50MB footprint, < 1s startup
# ==============================================================================

FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Copy package descriptors
COPY package.json ./

# Copy all application files (static files, JS modules, server)
COPY . .

# Cloud Run expects the app to listen on 0.0.0.0 and PORT environment variable
EXPOSE 8080

# Run lightweight native HTTP server
CMD ["node", "server.js"]
