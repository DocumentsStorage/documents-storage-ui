### Stage 1: build ###
FROM node:17.8-alpine as builder
LABEL maintainer="Daniel Goliszewski taafeenn@gmail.com"
LABEL version="0.9.1"

# Set working directory.
WORKDIR /usr/src/app/documents-storage-ui

ENV API_URL="http://localhost:8000"
 
RUN printf "API_URL=$API_URL" > .env

# Copy app dependencies.
COPY package*.json .

# Install app dependencies.
RUN npm install

# Copy app files.
COPY . .

# Build app
RUN npm run build

### Stage 2: delivery ###
# Set user
RUN addgroup -S documents-storage && adduser -S documents-storage -G documents-storage
USER documents-storage

EXPOSE 5000
CMD ["npm", "start"]