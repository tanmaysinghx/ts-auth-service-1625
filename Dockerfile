# Use official Node.js 18 image
FROM node:18

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package manifests first for better caching
COPY package*.json ./

# Install dependencies (prod + dev for development stage)
RUN npm install

# Copy the rest of your application code
COPY . .

# ✅ Copy .env so Prisma can read DATABASE_URL and other vars
COPY .env ./

# ✅ Copy CA cert into system-wide trusted certs directory
COPY certs/ca.pem /usr/local/share/ca-certificates/ca.pem

# ✅ Update system to trust the CA cert (Debian/Ubuntu base)
RUN update-ca-certificates

# ✅ Export CA cert to Node.js explicitly (optional but recommended)
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/ca.pem

# ✅ Enable Prisma debug logs
ENV DEBUG=prisma*

# ✅ Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Expose your application port
EXPOSE 1625

# ✅ Run entrypoint script (which can run migrations, generate client, then start app)
ENTRYPOINT ["./docker-entrypoint.sh"]
