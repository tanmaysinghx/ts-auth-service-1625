# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Set environment variables
ARG DATABASE_URL
ARG ACCESS_TOKEN_SECRET
ARG REFRESH_TOKEN_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV ACCESS_TOKEN_SECRET=$ACCESS_TOKEN_SECRET
ENV REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (production-only, to reduce image size)
RUN npm install --production
RUN npm install --save-dev @types/cors

# Copy the rest of your application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the application port
EXPOSE 1625

# Start the application
CMD ["npm", "start"]

