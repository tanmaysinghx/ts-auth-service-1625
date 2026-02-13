import { Request, Response } from 'express';
import path from 'path';
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

/* ─── Helper ─── */

function renderLoginError(message: string, query: Record<string, string>): string {
    const params = new URLSearchParams(query).toString();
    const version = process.env.API_VERSION || 'v2';
    return `
    <html>
    <head><meta charset="utf-8"><title>Login - Auth Service</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:'Inter',system-ui,sans-serif; background:#0f172a; color:#f1f5f9; display:flex; justify-content:center; align-items:center; min-height:100vh; }
      .card { background:#1e293b; padding:2.5rem; border-radius:1rem; width:100%; max-width:400px; box-shadow:0 25px 50px rgba(0,0,0,.3); }
      h1 { font-size:1.5rem; margin-bottom:.5rem; }
      .subtitle { color:#94a3b8; margin-bottom:1.5rem; font-size:.9rem; }
      .error { background:#7f1d1d; color:#fca5a5; padding:.75rem 1rem; border-radius:.5rem; margin-bottom:1rem; font-size:.85rem; }
      label { display:block; font-size:.85rem; color:#94a3b8; margin-bottom:.25rem; }
      input { width:100%; padding:.75rem 1rem; border:1px solid #334155; border-radius:.5rem; background:#0f172a; color:#f1f5f9; font-size:1rem; margin-bottom:1rem; outline:none; transition:border-color .2s; }
      input:focus { border-color:#3b82f6; }
      button { width:100%; padding:.75rem; border:none; border-radius:.5rem; background:linear-gradient(135deg,#3b82f6,#8b5cf6); color:#fff; font-size:1rem; font-weight:600; cursor:pointer; transition:transform .1s; }
      button:hover { transform:translateY(-1px); }
    </style></head>
    <body>
      <div class="card">
        <h1>🔐 Sign In</h1>
        <p class="subtitle">Auth Service SSO</p>
        <div class="error">${message}</div>
        <form method="POST" action="/${version}/api/sso/authorize?${params}">
          <label>Email</label><input type="email" name="email" required autofocus>
          <label>Password</label><input type="password" name="password" required>
          <button type="submit">Sign In</button>
        </form>
      </div>
    </body></html>
  `;
}
