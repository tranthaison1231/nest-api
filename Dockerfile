FROM node:18-alpine

WORKDIR /app

# Install pnpm and curl for healthcheck
RUN npm install -g pnpm && \
    apk add --no-cache curl

COPY package*.json ./

RUN pnpm install

COPY . .

RUN pnpm run prisma:generate

EXPOSE 3000

# Make sure app directory has the right permissions
RUN chown -R node:node /app

# Use non-root user for better security
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

CMD ["pnpm", "run", "start:dev"] 