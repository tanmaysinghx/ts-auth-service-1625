#!/bin/sh

echo "🌱 Generating Prisma client..."
npx prisma generate

echo "🚀 Starting app..."
npm start
