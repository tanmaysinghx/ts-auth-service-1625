# ts-auth-service-1818

## Overview

This project is an authentication service built using Node.js, Express, and Prisma. It handles user registration, login, token management, and more.

## Prerequisites

- Node.js (v18.x or later)
- PostgreSQL (or another supported SQL database)
- Prisma CLI

## Setup and Installation

### 1. Clone the Repository

```bash
git clone https://github.com/tanmaysinghx/ts-auth-service-1818.git
cd ts-auth-service-1818

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Configure Environment Variables

- Rename ".env.example" to ".env"
- Create a DB cluster in mongo DB or your preferred DB

```bash
DATABASE_URL=your_database_connection_string
PORT=your_port_number
JWT_SECRET=your_jwt_secret

```

### 4. Run Database Migrations

```bash
npx prisma migrate deploy

```

### 5. Start the Application

```bash
npm run dev

```

## API Endpoints

### 1. User Registration

- Endpoint: POST /auth/register
- Request Body:

```bash
{
  "email": "user@example.com",
  "password": "yourpassword",
  "username": "username"
}

```

- Response Body:
  
```bash
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username"
}

```

### 2. User Login

- Endpoint: POST /auth/login
- Request Body:

```bash
{
  "email": "user@example.com",
  "password": "yourpassword"
}


```

- Response Body:
  
```bash
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzIxNDk2NjY4LCJleHAiOjE3MjE1MDAyNjh9.O1LFevtBac6kNYckZ7tTZNX4eh2Cpzc440nAbysgomg",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzIxNDk2NjY4LCJleHAiOjE3MjIxMDE0Njh9.QpliaY1pH8AQ6xWVVuFiEvE6ChLlAuKuhUF3sd9Tgi8"
}

```

### 3. Refresh Token

- Endpoint: POST /refresh-token
- Request Body:

```bash
{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzIxNDk2NjY4LCJleHAiOjE3MjIxMDE0Njh9.QpliaY1pH8AQ6xWVVuFiEvE6ChLlAuKuhUF3sd9Tgi8"
}

```

- Response Body:
  
```bash
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzIxNDk2NzI4LCJleHAiOjE3MjE1MDAzMjh9.S6QfdqsGBnfJo2Y-GRgvaSs1-HaULXnDBwyIW_pWV-Y",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzIxNDk2NzI4LCJleHAiOjE3MjIxMDE1Mjh9.eFgBWomAe8ItkUrrskrHjhsPW75_HJRt9jYxa7gdFVE"
}

```

### 4. Verify JWT Token

- Endpoint: POST /check-token
- Request Body: (In Request Headers)

```bash
{
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzIxNDk2NzI4LCJleHAiOjE3MjE1MDAzMjh9.S6QfdqsGBnfJo2Y-GRgvaSs1-HaULXnDBwyIW_pWV-Y"
}

```

- Response Body:
  
```bash
{
    "user": {
        "id": 3,
        "email": "tester3@gmail.com",
        "username": "tester3"
}
    }

```"# ts-auth-service-1625" 
