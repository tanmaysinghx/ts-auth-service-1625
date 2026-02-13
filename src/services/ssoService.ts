import crypto from 'crypto';
import prisma from '../config/db';
import { comparePassword } from '../utils/hashPassword';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens';
import { hashPassword } from '../utils/hashPassword';
import logger from '../utils/logger';

/* ─── Client Management ─── */

/** Register a new OAuth client (admin-only) */
export const registerClient = async (data: {
    clientId: string;
    clientSecret: string;
    appName: string;
    redirectUris: string[];
    allowedScopes?: string[];
}) => {
    const { clientId, clientSecret, appName, redirectUris, allowedScopes } = data;

    if (!clientId || !clientSecret || !appName || !redirectUris?.length) {
        throw new Error('clientId, clientSecret, appName, and at least one redirectUri are required');
    }

    const existing = await prisma.oAuthClient.findUnique({ where: { clientId } });
    if (existing) {
        throw new Error('Client ID already exists');
    }

    const hashedSecret = await hashPassword(clientSecret);

    const client = await prisma.oAuthClient.create({
        data: {
            clientId,
            clientSecret: hashedSecret,
            appName,
            redirectUris: redirectUris.join(','),
            allowedScopes: allowedScopes?.join(',') || 'openid,profile,email',
        },
    });

    return {
        clientId: client.clientId,
        appName: client.appName,
        redirectUris: client.redirectUris.split(','),
        allowedScopes: client.allowedScopes.split(','),
        createdAt: client.createdAt,
    };
};

/* ─── Client Validation ─── */

/** Validate client_id and redirect_uri from authorize request */
export const validateClient = async (clientId: string, redirectUri: string) => {
    if (!clientId || !redirectUri) {
        throw new Error('client_id and redirect_uri are required');
    }

    const client = await prisma.oAuthClient.findUnique({ where: { clientId } });
    if (!client) {
        throw new Error('Invalid client_id');
    }

    const allowedUris = client.redirectUris.split(',').map((u: string) => u.trim());
    if (!allowedUris.includes(redirectUri)) {
        throw new Error('Invalid redirect_uri for this client');
    }

    return client;
};

/* ─── Authorization Code ─── */

/** Generate a one-time authorization code */
export const createAuthorizationCode = async (
    clientId: string,
    userId: string,
    redirectUri: string,
    scope: string
): Promise<string> => {
    const code = crypto.randomBytes(32).toString('hex'); // 64 char hex string
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.authorizationCode.create({
        data: {
            code,
            clientId,
            userId,
            redirectUri,
            scope: scope || 'openid',
            expiresAt,
        },
    });

    logger.info(`Authorization code created for client=${clientId}, user=${userId}`);
    return code;
};

/** Exchange authorization code for tokens */
export const exchangeCode = async (data: {
    code: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}) => {
    const { code, clientId, clientSecret, redirectUri } = data;

    if (!code || !clientId || !clientSecret || !redirectUri) {
        throw new Error('code, client_id, client_secret, and redirect_uri are required');
    }

    // 1. Verify client
    const client = await prisma.oAuthClient.findUnique({ where: { clientId } });
    if (!client) {
        throw new Error('Invalid client_id');
    }

    const secretValid = await comparePassword(clientSecret, client.clientSecret);
    if (!secretValid) {
        throw new Error('Invalid client_secret');
    }

    // 2. Verify authorization code
    const authCode = await prisma.authorizationCode.findUnique({ where: { code } });
    if (!authCode) {
        throw new Error('Invalid authorization code');
    }

    if (authCode.used) {
        throw new Error('Authorization code already used');
    }

    if (authCode.expiresAt < new Date()) {
        throw new Error('Authorization code expired');
    }

    if (authCode.clientId !== clientId) {
        throw new Error('Authorization code was not issued to this client');
    }

    if (authCode.redirectUri !== redirectUri) {
        throw new Error('redirect_uri mismatch');
    }

    // 3. Mark code as used
    await prisma.authorizationCode.update({
        where: { code },
        data: { used: true },
    });

    // 4. Generate tokens for the user
    const user = await prisma.user.findUnique({
        where: { id: authCode.userId },
        include: { role: true },
    });

    if (!user) {
        throw new Error('User not found');
    }

    const accessToken = generateAccessToken(user.id, user.roleId, user.email);
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`Token exchange successful for client=${clientId}, user=${user.id}`);

    return {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: 3600, // 1 hour in seconds
        scope: authCode.scope,
    };
};

/* ─── User Info ─── */

/** Get user info for OIDC /userinfo endpoint */
export const getUserInfo = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (!user) {
        throw new Error('User not found');
    }

    return {
        sub: user.id,
        email: user.email,
        role: user.role.roleName,
        roleId: user.roleId,
        created_at: user.createdAt,
    };
};

/* ─── SSO Session ─── */

/** Create an SSO session token (stored as a signed cookie) */
export const createSSOSessionToken = (userId: string): string => {
    // Simple signed token: base64(userId:timestamp:hmac)
    const timestamp = Date.now().toString();
    const payload = `${userId}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', process.env.ACCESS_TOKEN_SECRET!)
        .update(payload)
        .digest('hex');
    return Buffer.from(`${payload}:${hmac}`).toString('base64');
};

/** Verify an SSO session token and return userId */
export const verifySSOSessionToken = (token: string): string | null => {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const parts = decoded.split(':');
        if (parts.length !== 3) return null;

        const [userId, timestamp, hmac] = parts;
        const payload = `${userId}:${timestamp}`;
        const expectedHmac = crypto.createHmac('sha256', process.env.ACCESS_TOKEN_SECRET!)
            .update(payload)
            .digest('hex');

        if (hmac !== expectedHmac) return null;

        // Check if token is older than 30 days
        const age = Date.now() - parseInt(timestamp);
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (age > thirtyDays) return null;

        return userId;
    } catch {
        return null;
    }
};
