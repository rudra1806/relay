import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.jss";

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