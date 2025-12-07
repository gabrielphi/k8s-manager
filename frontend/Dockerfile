# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build argument for API URL
ARG VITE_API_BASE_URL=http://localhost:7000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files
COPY package.json ./

# Install dependencies
# Use npm install instead of npm ci since package-lock.json may not exist
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
