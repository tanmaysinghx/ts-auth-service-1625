import { Request, Response } from 'express';

import {
    validateClient,
    createAuthorizationCode,
    exchangeCode,
    getUserInfo,
    registerClient,
    verifySSOSessionToken,
    createSSOSessionToken,
} from '../services/ssoService';
import { comparePassword } from '../utils/hashPassword';
import prisma from '../config/db';
import { errorResponse, successResponse } from '../utils/responseUtils';
import logger from '../utils/logger';

const SSO_COOKIE_NAME = 'sso_session';
const SSO_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * GET /authorize
 * Entry point for SSO. Client apps redirect users here.
 * If SSO session cookie exists → auto-generate code and redirect back.
 * If not → render login page.
 */
/**
 * GET /authorize
 * Entry point for SSO. Client apps redirect users here.
 * If SSO session cookie exists → auto-generate code and redirect back.
 * If not → redirect to Angular Login Page.
 */
export const authorize = async (req: Request, res: Response) => {
    try {
        const { client_id, redirect_uri, scope, state, response_type } = req.query as Record<string, string>;

        if (response_type && response_type !== 'code') {
            return res.status(400).json(errorResponse('Only response_type=code is supported', 'OAuth Error', req.transactionId));
        }

        // Validate client and redirect URI
        await validateClient(client_id, redirect_uri);

        // Check for existing SSO session
        const ssoToken = req.cookies?.[SSO_COOKIE_NAME];
        if (ssoToken) {
            const userId = verifySSOSessionToken(ssoToken);
            if (userId) {
                // User already logged in — generate code and redirect
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (user) {
                    const code = await createAuthorizationCode(client_id, userId, redirect_uri, scope || 'openid');
                    const redirectUrl = new URL(redirect_uri);
                    redirectUrl.searchParams.set('code', code);
                    if (state) redirectUrl.searchParams.set('state', state);
                    logger.info(`SSO auto-login: user=${userId}, client=${client_id}`);
                    return res.redirect(302, redirectUrl.toString());
                }
            }
        }

        // No SSO session — redirect to Angular Login Page
        // We pass the original query params to the Angular app so it can preserve them
        const angularUrl = new URL('http://localhost:4200/auth/sso-login');
        angularUrl.searchParams.set('client_id', client_id);
        angularUrl.searchParams.set('redirect_uri', redirect_uri);
        if (scope) angularUrl.searchParams.set('scope', scope);
        if (state) angularUrl.searchParams.set('state', state);
        if (response_type) angularUrl.searchParams.set('response_type', response_type);

        return res.redirect(302, angularUrl.toString());
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Authorization failed';
        return res.status(400).json(errorResponse(errorMessage, 'Authorization Error', req.transactionId));
    }
};

/**
 * POST /authorize
 * Handle login form submission from the SSO Angular login page.
 * Authenticates user → sets SSO cookie → generates code → returns redirect URL in JSON.
 */
export const authorizePost = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const { client_id, redirect_uri, scope, state } = req.query as Record<string, string>;

        if (!email || !password) {
            return res.status(400).json(errorResponse('Email and password are required', 'Validation Error', req.transactionId));
        }

        // Validate client
        await validateClient(client_id, redirect_uri);

        // Authenticate user (reusing existing logic)
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json(errorResponse('Invalid email or password', 'Auth Error', req.transactionId));
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            return res.status(401).json(errorResponse('Invalid email or password', 'Auth Error', req.transactionId));
        }

        // Update last login
        await prisma.user.update({ where: { email }, data: { lastLoginAt: new Date() } });

        // Set SSO session cookie
        const ssoToken = createSSOSessionToken(user.id);
        res.cookie(SSO_COOKIE_NAME, ssoToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: SSO_COOKIE_MAX_AGE,
        });

        // Generate authorization code and return redirect URL
        const code = await createAuthorizationCode(client_id, user.id, redirect_uri, scope || 'openid');
        const redirectUrl = new URL(redirect_uri);
        redirectUrl.searchParams.set('code', code);
        if (state) redirectUrl.searchParams.set('state', state);

        logger.info(`SSO login: user=${user.id}, client=${client_id}`);

        // Return JSON with redirect URL for the frontend to handle
        return res.status(200).json({ success: true, redirectUrl: redirectUrl.toString() });

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        return res.status(400).json(errorResponse(errorMessage, 'SSO Login Error', req.transactionId));
    }
};

/**
 * POST /token
 * Exchange authorization code for access + refresh tokens.
 * This is called server-to-server by the client app.
 */
export const token = async (req: Request, res: Response) => {
    const transactionId = req.transactionId;
    try {
        const { code, client_id, client_secret, redirect_uri, grant_type } = req.body;

        if (grant_type && grant_type !== 'authorization_code') {
            return res.status(400).json(errorResponse('Only grant_type=authorization_code is supported', 'Token Error', transactionId));
        }

        const tokens = await exchangeCode({ code, clientId: client_id, clientSecret: client_secret, redirectUri: redirect_uri });

        return res.status(200).json(tokens);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Token exchange failed';
        return res.status(400).json(errorResponse(errorMessage, 'Token Error', transactionId));
    }
};

/**
 * GET /userinfo
 * Returns user profile for the authenticated user.
 * Requires Bearer token.
 */
export const userInfo = async (req: Request, res: Response) => {
    const transactionId = req.transactionId;
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json(errorResponse('Not authenticated', 'Auth Error', transactionId));
        }

        const info = await getUserInfo(userId);
        return res.status(200).json(info);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get user info';
        return res.status(400).json(errorResponse(errorMessage, 'UserInfo Error', transactionId));
    }
};

/**
 * POST /clients
 * Register a new OAuth client. Admin-only.
 */
export const registerClientController = async (req: Request, res: Response) => {
    const transactionId = req.transactionId;
    try {
        const client = await registerClient(req.body);
        return res.status(201).json(successResponse(client, 'OAuth client registered', transactionId));
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Client registration failed';
        return res.status(400).json(errorResponse(errorMessage, 'Client Error', transactionId));
    }
};

/**
 * POST /logout
 * Clear SSO session cookie.
 */
export const logout = async (req: Request, res: Response) => {
    res.clearCookie(SSO_COOKIE_NAME, { path: '/' });
    const redirectUri = req.query.redirect_uri as string;
    if (redirectUri) {
        return res.redirect(302, redirectUri);
    }
    return res.status(200).json({ success: true, message: 'SSO session cleared' });
};


