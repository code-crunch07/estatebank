# Multi-stage build for Next.js application
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Accept build args (MONGODB_URI is optional during build, will be set at runtime)
ARG MONGODB_URI
# Only set MONGODB_URI if provided, otherwise use placeholder for build
ENV MONGODB_URI=${MONGODB_URI:-mongodb://build:build@localhost:27017/build?authSource=admin}

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Copy scripts directory for admin creation
COPY --from=builder /app/scripts ./scripts
# Copy lib directory for scripts (needed for cloudinary, etc.)
COPY --from=builder /app/lib ./lib
# Copy models directory for scripts (needed for migration scripts)
COPY --from=builder /app/models ./models
# Copy node_modules for scripts to work (needed for bcryptjs, mongoose, etc.)
COPY --from=builder /app/node_modules ./node_modules
# Copy package.json for reference
COPY --from=builder /app/package.json ./package.json
# Copy healthcheck script
COPY --from=builder /app/healthcheck.js ./healthcheck.js

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
