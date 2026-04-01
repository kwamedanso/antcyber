require('dotenv').config();
const nodemailer = require('nodemailer')
const { userQueries, passwordResetQueries } = require('../utils/database/queries');
const crypto = require('crypto');



async function sendPasswordResetEmail(email, resetUrl, first_name) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: `CatchNode <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
                <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #2F6BFF 0%, #1E4FCC 100%); padding: 40px 0; text-align: center;">
                <div style="display: inline-flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.2);">
                <div style="width: 32px; height: 32px; background: rgba(255, 255, 255, 0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #ffffff; font-size: 16px;">🔐</span>
                </div>
                <span style="color: #ffffff; font-size: 20px; font-weight: 800;">CatchNode</span>
                </div>
                </div>

                <!-- Content -->
                <div style="padding: 60px 40px;">
            <!-- Title -->
            <h1 style="font-size: 36px; font-weight: 800; color: #000000; margin: 0 0 16px 0; text-align: center;">Password Reset Request</h1>
        
            <!-- Greeting -->
            <p style="font-size: 16px; color: #666666; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
            Hi ${first_name},
            </p>
        
            <!-- Main Message -->
            <p style="font-size: 16px; color: #666666; line-height: 1.6; margin: 0 0 32px 0; text-align: center;">
            You requested to reset your password for your CatchNode account. Click the button below to create a new secure password:
            </p>

            <!-- Reset Button -->
            <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" target="_blank"
               style="background: linear-gradient(135deg, #2F6BFF, #1E4FCC); color: #ffffff; padding: 16px 32px; 
                      text-decoration: none; border-radius: 12px; display: inline-block; font-size: 16px; 
                      font-weight: 700; font-family: 'Montserrat', Arial, sans-serif; border: none; 
                      cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 16px rgba(47, 107, 255, 0.3);
                      position: relative; overflow: hidden;">
                <span style="position: relative; z-index: 1;">Reset Password</span>
            </a>
            </div>

            <!-- Alternative Link -->
            <div style="background: #F8F9FA; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin: 32px 0;">
            <p style="font-size: 14px; color: #666666; font-weight: 600; margin: 0 0 12px 0; text-align: center;">
                Or copy this link into your browser:
            </p>
            <p style="font-size: 14px; color: #2F6BFF; word-break: break-all; text-align: center; margin: 0; 
                      padding: 12px 16px; background: rgba(47, 107, 255, 0.05); border-radius: 8px; border: 1px solid rgba(47, 107, 255, 0.1);">
                ${resetUrl}
            </p>
            </div>

            <!-- Security Information -->
            <div style="margin-top: 40px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 16px; 
                       background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); 
                       border-radius: 12px;">
                <div style="width: 24px; height: 24px; background: #F59E0B; border-radius: 50%; display: flex; 
                           align-items: center; justify-content: center; flex-shrink: 0;">
                    <span style="color: #ffffff; font-size: 12px; font-weight: bold;">!</span>
                </div>
                <p style="font-size: 14px; color: #666666; margin: 0; font-weight: 500;">
                    This link will expire in <strong style="color: #F59E0B;">1 hour</strong> for security reasons.
                </p>
            </div>

            <div style="display: flex; align-items: center; gap: 12px; padding: 16px; 
                       background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); 
                       border-radius: 12px;">
                <div style="width: 24px; height: 24px; background: #10B981; border-radius: 50%; display: flex; 
                           align-items: center; justify-content: center; flex-shrink: 0;">
                    <span style="color: #ffffff; font-size: 12px; font-weight: bold;">✓</span>
                </div>
                <p style="font-size: 14px; color: #666666; margin: 0; font-weight: 500;">
                    If you didn't request this password reset, please ignore this email. Your account remains secure.
                </p>
            </div>
            </div>

            <!-- Support Info -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
            <p style="font-size: 14px; color: #666666; text-align: center; margin: 0 0 8px 0;">
                Need help or have questions?
            </p>
            <p style="font-size: 14px; color: #666666; text-align: center; margin: 0;">
                Contact our support team at <a href="mailto:support@catchnode.com" 
                style="color: #2F6BFF; text-decoration: none; font-weight: 600;">support@catchnode.com</a>
            </p>
            </div>
            </div>

            <!-- Footer -->
            <div style="background: #F8F9FA; padding: 24px 40px; border-top: 1px solid #E5E7EB;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
            <p style="font-size: 13px; color: #666666; margin: 0;">
                Copyright © 2025 CatchNode. All rights reserved.
            </p>
            <a href="#" style="font-size: 13px; color: #2F6BFF; text-decoration: none; font-weight: 600;">
                Privacy Policy
            </a>
            </div>
            </div>
        </div>
                    `
    };

    await transporter.sendMail(mailOptions);

    console.log('📧 Password reset email sent to:', email);
}

module.exports = { sendPasswordResetEmail };