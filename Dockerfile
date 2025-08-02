# Use official Node.js 18 image
FROM node:18

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package manifests
COPY package*.json ./

# Install dependencies (prod and dev in one step for better caching in dev)
RUN npm install

# Copy the rest of your app
COPY . .

# Copy CA cert into a standard path
COPY certs/ca.pem /usr/local/share/ca-certificates/ca.pem

# Update CA certificates system-wide
RUN update-ca-certificates

# Export CA cert to Node.js
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/ca.pem

# ✅ Prisma debug logging
ENV DEBUG=prisma*

# Make sure entrypoint script is executable
RUN chmod +x docker-entrypoint.sh

# Expose the app port
EXPOSE 1625

# Set entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]
