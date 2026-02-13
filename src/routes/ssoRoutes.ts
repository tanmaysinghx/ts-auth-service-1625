import { Router } from 'express';
import {
    authorize,
    authorizePost,
    token,
    userInfo,
    registerClientController,
    logout,
} from '../controller/ssoController';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /sso/authorize:
 *   get:
 *     summary: OAuth 2.0 Authorization endpoint (SSO entry point)
 *     description: Client apps redirect users here. If an SSO session cookie exists, auto-generates a code and redirects back. Otherwise redirects to the Angular SSO Login page.
 *     tags: [SSO]
 *     parameters:
 *       - in: query
 *         name: client_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registered OAuth client ID
 *       - in: query
 *         name: redirect_uri
 *         required: true
 *         schema:
 *           type: string
 *         description: Redirect URI registered for the client
 *       - in: query
 *         name: response_type
 *         schema:
 *           type: string
 *           enum: [code]
 *           default: code
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           default: openid
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Opaque value to maintain state between request and callback
 *     responses:
 *       302:
 *         description: Redirects to client (if session exists) OR redirects to Angular Login Page (if no session)
 *       400:
 *         description: Invalid client_id, redirect_uri, or response_type
 */
router.get('/authorize', authorize);

/**
 * @swagger
 * /sso/authorize:
 *   post:
 *     summary: Handle SSO login form submission
 *     description: Authenticates user credentials, sets SSO session cookie, generates authorization code, and returns the redirect URL in JSON.
 *     tags: [SSO]
 *     parameters:
 *       - in: query
 *         name: client_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: redirect_uri
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful, returns redirect URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 redirectUrl:
 *                   type: string
 *                   example: "http://client-app.com/callback?code=xyz"
 *       401:
 *         description: Invalid email or password
 *       400:
 *         description: Client validation error
 */
router.post('/authorize', authorizePost);

/**
 * @swagger
 * /sso/token:
 *   post:
 *     summary: Exchange authorization code for tokens
 *     description: Server-to-server call by the client app to exchange an authorization code for access and refresh tokens.
 *     tags: [SSO]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, client_id, client_secret, redirect_uri]
 *             properties:
 *               grant_type:
 *                 type: string
 *                 enum: [authorization_code]
 *                 default: authorization_code
 *               code:
 *                 type: string
 *                 description: The authorization code received from /authorize
 *               client_id:
 *                 type: string
 *               client_secret:
 *                 type: string
 *               redirect_uri:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token exchange successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 token_type:
 *                   type: string
 *                   example: Bearer
 *                 expires_in:
 *                   type: integer
 *                   example: 3600
 *                 scope:
 *                   type: string
 *       400:
 *         description: Invalid code, client credentials, or redirect_uri mismatch
 */
router.post('/token', token);

/**
 * @swagger
 * /sso/userinfo:
 *   get:
 *     summary: Get authenticated user profile
 *     description: Returns user info for the authenticated user (OIDC-style).
 *     tags: [SSO]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sub:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 roleId:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: User info fetch error
 */
router.get('/userinfo', authMiddleware, userInfo);

/**
 * @swagger
 * /sso/clients:
 *   post:
 *     summary: Register a new OAuth client (admin-only)
 *     tags: [SSO]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientId, clientSecret, appName, redirectUris]
 *             properties:
 *               clientId:
 *                 type: string
 *                 example: my-app-client
 *               clientSecret:
 *                 type: string
 *                 example: super-secret-123
 *               appName:
 *                 type: string
 *                 example: My Application
 *               redirectUris:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["http://localhost:3000/callback"]
 *               allowedScopes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["openid", "profile", "email"]
 *     responses:
 *       201:
 *         description: OAuth client registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation or duplicate client error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/clients', authMiddleware, adminOnly, registerClientController);

/**
 * @swagger
 * /sso/logout:
 *   post:
 *     summary: SSO logout (clear session cookie)
 *     tags: [SSO]
 *     parameters:
 *       - in: query
 *         name: redirect_uri
 *         schema:
 *           type: string
 *         description: Optional URI to redirect to after logout
 *     responses:
 *       302:
 *         description: Redirect to provided redirect_uri
 *       200:
 *         description: SSO session cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/logout', logout);

export default router;
