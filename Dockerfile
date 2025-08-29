# Use the official Node.js image as the base image
FROM node:lts-slim

ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /usr/src/app

LABEL org.opencontainers.image.source=https://github.com/buddycount/buddycount-api
LABEL org.opencontainers.image.description="Buddycount API"

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]