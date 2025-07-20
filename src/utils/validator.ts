import validator from 'validator';

export const validateRegisterData = (req: any, res: any) => {
    console.log("hello", req.body);
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json("Username, email and password are required");
    } else if (!validator.isEmail(email)) {
        return res.status(400).json("Email is not valid");
    } else if (!validator.isStrongPassword(password)) {
        return res.status(400).json("Please use a strong password");
    }
}
