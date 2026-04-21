FROM node:18-alpine AS base

WORKDIR /app

# Install production dependencies in a dedicated layer.
COPY package*.json ./

RUN npm ci --omit=dev

FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S app && adduser -S -G app app

COPY --from=base /app/node_modules ./node_modules
COPY . .

RUN mkdir -p logs && chown -R app:app /app

USER app

EXPOSE 5000

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
	CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["npm", "start"]