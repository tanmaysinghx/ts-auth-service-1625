FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port and run application
EXPOSE 3000
CMD ["npm", "start"]
