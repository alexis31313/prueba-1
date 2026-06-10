
# ── Etapa 1: Build ──────────────────────────────────────────────
FROM node:22-alpine AS builder
 
WORKDIR /app
 
COPY package*.json ./
RUN npm install --include=dev
 
COPY . .
RUN npm run build
 
# ── Etapa 2: Producción ─────────────────────────────────────────
FROM node:22-alpine AS production
 
WORKDIR /app
 
COPY package*.json ./
RUN npm install --omit=dev
 
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/ca-cert.pem ./ca-cert.pem
 
EXPOSE 3000
 
CMD ["node", "dist/main"]