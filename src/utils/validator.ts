import validator from 'validator';
import { Request, Response, NextFunction } from 'express';

const ALLOWED_ROLES = ['superuser', 'admin', 'editor', 'viewer', 'user', 'guest', 'moderator', 'operator', 'analyst', 'developer'];

export const validateRegisterData = (req: Request, res: Response, next: NextFunction) => {
    let { email } = req.body;
    const { password, roleName } = req.body;

    if (!email || !password || !roleName) {
        return res.status(400).json({ message: "Email, password, and roleName are required" });
    }

    // Email normalization & validation
    email = validator.trim(email);
    email = validator.normalizeEmail(email) || '';
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Email is not valid" });
    }

    // Password strength: min 8 chars, at least one uppercase, lowercase, number, special char
    if (!validator.isLength(password, { min: 8 })) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }
    if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
    }
    if (!/[a-z]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one lowercase letter" });
    }
    if (!/[0-9]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one number" });
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        return res.status(400).json({ message: "Password must contain at least one special character" });
    }

    // roleName validation: must be a known value
    if (typeof roleName !== 'string') {
        return res.status(400).json({ message: "roleName must be a string" });
    }
    if (!ALLOWED_ROLES.includes(roleName)) {
        return res.status(400).json({ message: `Invalid roleName. Allowed values are: ${ALLOWED_ROLES.join(', ')}` });
    }

    next();
};

export const validateLoginData = (req: Request, res: Response, next: NextFunction) => {
    let { email } = req.body;
    const { password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    email = validator.trim(email);
    email = validator.normalizeEmail(email) || '';
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Email is not valid" });
    }

    next();
}
