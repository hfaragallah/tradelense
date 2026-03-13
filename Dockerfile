# Build stage
FROM oven/bun:latest AS builder

ARG VITE_GEMINI_API_KEY
ARG VITE_AI_BACKEND_URL
ARG VITE_APPWRITE_ENDPOINT
ARG VITE_APPWRITE_PROJECT_ID
ARG VITE_GA_MEASUREMENT_ID

ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_AI_BACKEND_URL=$VITE_AI_BACKEND_URL
ENV VITE_APPWRITE_ENDPOINT=$VITE_APPWRITE_ENDPOINT
ENV VITE_APPWRITE_PROJECT_ID=$VITE_APPWRITE_PROJECT_ID
ENV VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID

WORKDIR /app
COPY package.json bun.lockb* package-lock.json* ./
RUN if [ -f bun.lockb ]; then bun install; else npm install; fi
COPY . .
RUN bun run build || npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
