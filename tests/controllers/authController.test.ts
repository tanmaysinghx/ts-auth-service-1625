import request from 'supertest';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import * as authController from '../../src/controller/authController';
import * as authService from '../../src/services/authService';
jest.mock('../../src/services/authService');

const mockedAuthService = authService as jest.Mocked<typeof authService>;

let app: Express;

beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());

    app.post('/register', authController.register);
    app.post('/login', authController.login);
    app.post('/change-password', authController.changePasswordController);
    app.post('/refresh-token', authController.handleRefreshToken);
    app.post('/verify-token', authController.verifyTokenController);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('Auth Controllers', () => {

    describe('POST /register', () => {
        it('should register user and respond 201 with success message', async () => {
            const mockUser = {
                id: '123',
                email: 'test@mail.com',
                password: 'hashedpassword',
                roleId: 'role-1',
                createdAt: new Date('2023-01-01T00:00:00.000Z'),
                updatedAt: new Date('2023-01-01T00:00:00.000Z'),
                lastLoginAt: null,
            };
            mockedAuthService.registerUser.mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/register')
                .send({ email: 'test@mail.com', password: 'password123' });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);

            expect(res.body.data).toEqual({
                ...mockUser,
                createdAt: mockUser.createdAt.toISOString(),
                updatedAt: mockUser.updatedAt.toISOString(),
            });

        });

        it('should return 400 with error message on failure', async () => {
            mockedAuthService.registerUser.mockRejectedValue(new Error('Registration failed'));

            const res = await request(app)
                .post('/register')
                .send({ email: 'fail@mail.com', password: 'password123' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/registration error/i);
        });
    });

    describe('POST /login', () => {
        it('should login user, set cookies, and respond 201 with tokens', async () => {
            const mockTokens = {
                refreshToken: 'refresh-token',
                accessToken: 'access-token',
                email: 'test@mail.com',
                roleId: 'role-1',
                roleName: 'user',
                userId: '123'
            };
            mockedAuthService.loginUser.mockResolvedValue(mockTokens);

            const res = await request(app)
                .post('/login')
                .send({ email: 'test@mail.com', password: 'password123' });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual(mockTokens);

            const setCookieHeader = res.headers['set-cookie'];
            const cookies = Array.isArray(setCookieHeader) ? setCookieHeader.join(' ') : (setCookieHeader || '');
            expect(cookies).toContain('refreshToken=refresh-token');
            expect(cookies).toContain('HttpOnly');
            expect(cookies).toContain('accessToken=access-token');
        });

        it('should return 401 with error message on login failure', async () => {
            mockedAuthService.loginUser.mockRejectedValue(new Error('Invalid credentials'));

            const res = await request(app)
                .post('/login')
                .send({ email: 'fail@mail.com', password: 'wrongpass' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/login error/i);
        });
    });

    describe('POST /change-password', () => {
        it('should change password and respond 201 with success message', async () => {
            mockedAuthService.changePasswordService.mockResolvedValue('Password changed successfully');

            const res = await request(app)
                .post('/change-password')
                .send({ oldPassword: 'oldpass', newPassword: 'newpass' });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBe('Password changed successfully');
        });

        it('should return 401 with error message on failure', async () => {
            mockedAuthService.changePasswordService.mockRejectedValue(new Error('Change password failed'));

            const res = await request(app)
                .post('/change-password')
                .send({ oldPassword: 'wrong', newPassword: 'newpass' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/password change error/i);
        });
    });

    describe('POST /refresh-token', () => {
        it('should refresh token and respond with new accessToken', async () => {
            mockedAuthService.refreshToken.mockResolvedValue('new-access-token');

            const res = await request(app)
                .post('/refresh-token')
                .send({ refreshToken: 'refresh-token' });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual({ accessToken: 'new-access-token' });
        });

        it('should return 403 on invalid refresh token', async () => {
            mockedAuthService.refreshToken.mockRejectedValue(new Error('Invalid token'));

            const res = await request(app)
                .post('/refresh-token')
                .send({ refreshToken: 'bad-refresh-token' });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/refresh token error/i);
        });
    });

    describe('POST /verify-token', () => {
        it('should verify token and respond with success', async () => {
            const validResult = { success: true, message: 'Token is valid', userId: '123' };
            mockedAuthService.verifyTokenService.mockResolvedValue(validResult);

            const res = await request(app)
                .post('/verify-token')
                .send({ token: 'valid-jwt-token' });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual(validResult);
        });

        it('should return 403 on invalid token verification', async () => {
            mockedAuthService.verifyTokenService.mockRejectedValue(new Error('Invalid token'));

            const res = await request(app)
                .post('/verify-token')
                .send({ token: 'invalid-jwt-token' });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/refresh token error/i);
        });
    });
});
