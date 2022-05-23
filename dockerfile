### Stage 1: build ###
FROM node:17.8-alpine
LABEL maintainer="Daniel Goliszewski taafeenn@gmail.com"
LABEL version="0.9.1"

# Set working directory.
WORKDIR /usr/src/app/documents-storage-ui

ARG API_URL
ENV API_URL ${API_URL}

# Copy app files.
COPY . .

# Install deps
RUN npm install

### Stage 2: delivery ###
# Set user
RUN addgroup -S documents-storage && adduser -u 1500 -S documents-storage -G documents-storage
RUN chown -R 1500:1500 /usr/src/app/documents-storage-ui
USER documents-storage

EXPOSE 5000
CMD printf "API_URL=${API_URL}" > .env ; source .env ; npm run build ; npm start