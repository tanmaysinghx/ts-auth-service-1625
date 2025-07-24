# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production
RUN npm install --save-dev @types/cors

# Copy the rest of your application code
COPY . .

# Make the entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Expose the application port
EXPOSE 1625

# Set entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]
