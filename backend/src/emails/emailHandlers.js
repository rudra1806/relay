import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate, createOTPEmailTemplate, createResetPasswordEmailTemplate } from "./emailTemplates.js";

// this is the email handler that we will use to send welcome emails to new users
export const sendWelcomeEmail = async (name, email, clientURL) =>  {
    const htmlContent = createWelcomeEmailTemplate(name, clientURL);
    try {
        await resendClient.emails.send({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Welcome to Relay! 🎉",
            html: htmlContent,
        });
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send welcome email to ${email}:`, error);
    }
};

// this is the email handler that we will use to send OTP verification emails
export const sendOTPEmail = async (name, email, otp) => {
    const htmlContent = createOTPEmailTemplate(name, otp);
    try {
        await resendClient.emails.send({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Verify Your Email - Relay",
            html: htmlContent,
        });
        console.log(`OTP email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send OTP email to ${email}:`, error);
        throw error; // Re-throw to handle in controller
    }
};

// this is the email handler that we will use to send password reset OTP emails
export const sendResetPasswordEmail = async (name, email, otp) => {
    const htmlContent = createResetPasswordEmailTemplate(name, otp);
    try {
        await resendClient.emails.send({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Reset Your Password - Relay",
            html: htmlContent,
        });
        console.log(`Reset password email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send reset password email to ${email}:`, error);
        throw error; // Re-throw to handle in controller
    }
};