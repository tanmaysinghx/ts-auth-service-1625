import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* Function to send OTP email */
export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your One-Time Password (OTP) Code',
    text: `Your OTP code is ${otp}. It is valid for the next 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4A90E2;">Hello,</h2>
        <p style="font-size: 1.1em;">Here is your one-time password (OTP) for completing your login:</p>
        <p style="font-size: 2em; font-weight: bold; color: #4A90E2; margin: 10px 0;">${otp}</p>
        <p>This code is valid for the next <strong>10 minutes</strong>.</p>
        <p style="margin-top: 20px;">If you didn't request this, please ignore this email or contact support.</p>
        <p style="margin-top: 30px; font-size: 0.9em;">Best regards,<br />Your Support Team</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/* Function to send Welcome email */
export const sendWelcomeEmail = async (email: string, username: string) => {
  const mailOptions = {
    from: `"Welcome Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Our Platform!',
    text: `Dear ${username}, welcome to our platform! We're thrilled to have you join us.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4A90E2;">Welcome, ${username}!</h2>
        <p style="font-size: 1.1em;">We're thrilled to have you on board. Thank you for registering!</p>
        <p>To get started, log in to your account and explore the features we’ve crafted just for you.</p>
        <div style="margin: 20px 0;">
          <a href="http://localhost:4200/ui-testing/" style="background-color: #4A90E2; color: #ffffff; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">Log In Now</a>
        </div>
        <p>If you have any questions, feel free to reach out to our support team. We're here to help!</p>
        <p style="margin-top: 30px; font-size: 0.9em;">Best regards,<br />The Welcome Team</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
