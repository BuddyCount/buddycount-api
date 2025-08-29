# We use a multi-stage build to optimize the docker image size
# 1st stage: build the application
# 2nd stage: build the actual docker image needed for deployment

### 1st stage
FROM node:lts-slim AS app_builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

### 2nd stage
FROM node:lts-slim AS image_builder

ENV NODE_ENV=production

# Labels to tell github this image is related to the buddycount-api repo
LABEL org.opencontainers.image.source=https://github.com/buddycount/buddycount-api
LABEL org.opencontainers.image.description="Buddycount API"

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY --from=app_builder /usr/src/app/node_modules ./node_modules

# Expose the application port
EXPOSE 3000

COPY --from=app_builder /usr/src/app/dist ./dist

# Command to run the application
CMD ["node", "dist/main"]