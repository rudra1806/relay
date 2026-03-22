import { Resend } from 'resend';
import { config } from '../config/env.js';

// this is the resend client that we will use to send emails
export const resendClient = new Resend(config.resendApiKey);

// this is the sender information that we will use to send emails
export const sender = {
    email: config.senderEmail,
    name: config.senderName
};