import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// this is the resend client that we will use to send emails
export const resendClient = new Resend(process.env.RESEND_API_KEY);

// this is the sender information that we will use to send emails
export const sender = {
    email: process.env.SENDER_EMAIL,
    name: process.env.SENDER_NAME
};