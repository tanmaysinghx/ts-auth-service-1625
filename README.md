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
    "success": true,
    "transactionId": "a43282df-dd89-4245-8eaf-da2e9c7af870",
    "message": "User is successfully registered",
    "data": {
        "id": "c3e70bd9",
        "email": "testSuperuser8@gmail.com",
        "password": "$2b$10$eYVguUurokQK.d0NwnhZNe4LnE4F5TxwNmUF.NNDL9mUA4.tjgpYu",
        "roleId": "0001",
        "createdAt": "2024-09-13T20:12:09.808Z",
        "updatedAt": "2024-09-13T20:12:09.808Z",
        "lastLoginAt": null
    }
}

```

### 2. User Login

- Endpoint: POST /v2/api/auth/login
- Request Body:

```bash
{
  "email": "testSuperuser8@gmail.com",
  "password": "password"
}

```

- Response Body:
  
```bash
{
    "success": true,
    "transactionId": "f206b71c-1878-4a65-be9c-d468bbd4a504",
    "message": "User is successfully loggedin",
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjM2U3MGJkOSIsInJvbGVJZCI6IjAwMDEiLCJpYXQiOjE3MjYzMDU1OTgsImV4cCI6MTcyNjMwNjQ5OH0.XSgJ1IcETIRbeslmTNguogETrkCkoD54yieF177-JBs",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjM2U3MGJkOSIsImlhdCI6MTcyNjMwNTU5OCwiZXhwIjoxNzI2OTEwMzk4fQ.D_KZSteHtFvr4ovBZtOL-DP0a4SqmARylebZ4M0e2Kc",
        "email": "testSuperuser8@gmail.com",
        "roleId": "0001",
        "roleName": "Superuser"
    }
}

```

### 3. Refresh Token

- Endpoint: POST /v2/api/auth/refresh-token
- Request Body:

```bash
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjM2U3MGJkOSIsImlhdCI6MTcyNjMwNTU5OCwiZXhwIjoxNzI2OTEwMzk4fQ.D_KZSteHtFvr4ovBZtOL-DP0a4SqmARylebZ4M0e2Kc" 
}

```

- Response Body:
  
```bash
{
    "success": true,
    "transactionId": "d4facde5-c0fc-413b-8e6c-65750a5f8f3a",
    "message": "Refresh token generated",
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjM2U3MGJkOSIsInJvbGVJZCI6IjAwMDEiLCJpYXQiOjE3MjYzMDU3MDgsImV4cCI6MTcyNjMwNjYwOH0.VzQIlfQ3ChnHB_R1-OEtbAsOTQWc69IY4E_tLVJf1mM"
    }
}

```

### 4. Verify JWT Token

- Endpoint: POST /v2/api/auth/verify/verify-token
- Request Body: (In Request Headers)

```bash
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjM2U3MGJkOSIsInJvbGVJZCI6IjAwMDEiLCJpYXQiOjE3MjYzMDU3MDgsImV4cCI6MTcyNjMwNjYwOH0.VzQIlfQ3ChnHB_R1-OEtbAsOTQWc69IY4E_tLVJf1mM"
}

```

- Response Body:
  
```bash
{
    "success": true,
    "transactionId": "9249ae6a-396b-41d0-a8cd-861b13d749d4",
    "message": "Refresh token generated",
    "data": {
        "success": true,
        "message": "Token is valid",
        "userId": "c3e70bd9",
        "roleId": "0001",
        "iat": 1726305708,
        "exp": 1726306608
    }
}
```

### 5. Change Password

- Endpoint: POST /v2/api/auth/change-password
- Request Body: (In Request Headers)

```bash
{
  "email": "testSuperuser8@gmail.com",
  "currentPassword": "password",
  "newPassword": "passwordnew"
}


```

- Response Body:
  
```bash
{
    "success": true,
    "transactionId": "6809f54b-d67f-4c2b-95a0-48bff6e74373",
    "message": "Password chnaged succesfully",
    "data": "Password updated successfully"
}

```