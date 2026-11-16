FROM node:20-alpine
# Prisma potrzebuje OpenSSL
RUN apk add --no-cache openssl
WORKDIR /quiz-api
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
ENV NODE_ENV=production
EXPOSE 4000
# przy każdym starcie dociąga brakujące migracje, potem uruchamia serwer
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
