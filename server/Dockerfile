FROM node:18-alpine As deps

WORKDIR /app

COPY package*.json  ./

COPY . .

#BUILD PRODUCTION STAGE

FROM node:18-alpine

WORKDIR /app

RUN addgroup -S app && adduser -S -G app app

COPY --from=deps /app/node_modules ./node_modules

COPY src ./src

RUN mkdir -p logs && chown -R app:app /app

USER app

EXPOSE 5000

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
 CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

 CMD [ "node","src/server.js" ]