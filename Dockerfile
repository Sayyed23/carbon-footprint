# Stage 1: Build the Flutter web application
FROM debian:bookworm-slim AS build-stage

# Install system dependencies needed by Flutter
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    xz-utils \
    zip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Clone the specific version of Flutter SDK matching the local environment
RUN git clone --depth=1 --branch=3.44.0 https://github.com/flutter/flutter.git /flutter
ENV PATH="/flutter/bin:${PATH}"

# Pre-download development binaries
RUN flutter doctor

WORKDIR /app

# Copy dependency definition files first to leverage Docker layer caching
COPY pubspec.yaml pubspec.lock ./

# Fetch dependencies
RUN flutter pub get

# Copy the rest of the application files
COPY . .

# Build the Flutter web app in release mode
RUN flutter build web --release

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output from the builder stage
COPY --from=build-stage /app/build/web /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
