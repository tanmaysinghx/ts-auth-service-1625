# Use Node.js as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app will run on
EXPOSE 3000

# Use ARG for environment-specific variables (default to development)
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

# Start the app
CMD ["npm", "start"]
