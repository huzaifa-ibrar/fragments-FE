# ============================
# Stage 1: Build React App
# ============================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies efficiently
RUN npm ci

# Copy the rest of the app
COPY . .

# ---- Inject build-time environment variables ----
# These will be baked into your React build
ARG REACT_APP_API_URL
ARG REACT_APP_AUTH_TYPE
ARG REACT_APP_BASIC_USER
ARG REACT_APP_BASIC_PASS

ENV REACT_APP_API_URL=$REACT_APP_API_URL \
    REACT_APP_AUTH_TYPE=$REACT_APP_AUTH_TYPE \
    REACT_APP_BASIC_USER=$REACT_APP_BASIC_USER \
    REACT_APP_BASIC_PASS=$REACT_APP_BASIC_PASS

# Build the React app for production
RUN npm run build

# ============================
# Stage 2: Serve with Nginx
# ============================
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Add healthcheck for container monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Expose HTTP port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
