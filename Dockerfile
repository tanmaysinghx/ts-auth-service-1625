# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (production-only, to reduce image size)
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the TypeScript application
RUN npm run build

# Expose the application port
EXPOSE 1625

# Start the compiled application natively (avoids experimental ts-node crashes)
# Also syncs the database schema (useful for first-time setup or migrations)
CMD npx prisma db push --accept-data-loss && npm start