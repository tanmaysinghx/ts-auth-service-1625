# ts-auth-service-1625

## Overview

This project is an authentication service built using Node.js, Express, Typescript and Prisma. It handles user registration, login, change-password, token management, OTP verification and more.

## Prerequisites

- Node.js (v18.x or later)
- MySQL (or another supported SQL database)
- Prisma CLI
- Typescript

## Setup and Installation

### 1. Clone the Repository

```bash
git clone https://github.com/tanmaysinghx/ts-auth-service-1625.git
cd ts-auth-service-1625

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Configure Environment Variables

- Rename ".env.example" to ".env"
- Create a DB cluster in SQL DB or your preferred DB

```bash
DATABASE_URL="mysql://root:root@localhost:3306/testdb2"
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

```

### 4. Run Database Migrations

```bash
npx prisma migrate deploy

```

### 5. Run scripts for roles

```bash
npm run seed

```

### 6. Start the Application

```bash
npm run dev

```

### 7. Redeploy DB changes

```bash
npx prisma migrate dev --name add_otp_table

```

## API Endpoints

### 1. User Registration

- Endpoint: POST /v2/api/auth/register
- Request Body:

```bash
{
  "email": "superuser1@gmail.com",
  "password": "password",
  "roleName": "superuserer" 
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
