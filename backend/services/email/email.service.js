// email.service.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendMail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        return info;
    } catch (error) {
        console.error(`[Email Service] Failed to send email to ${to}:`, error);
        return null;
    }
};

module.exports = { sendMail };