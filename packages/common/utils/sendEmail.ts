import nodemailer from "nodemailer";
import axios from "axios";
import { config } from "../config";

const oauth2Config = config.email.googleOauth2;

// Function to get fresh access token from refresh token
const getFreshAccessToken = async (): Promise<string> => {
    try {
        console.log('Getting fresh access token...');
        console.log('Client ID:', oauth2Config.clientId ? 'Set' : 'Not set');
        console.log('Client Secret:', oauth2Config.clientSecret ? 'Set' : 'Not set');
        console.log('Refresh Token:', oauth2Config.refreshToken ? 'Set' : 'Not set');

        const response = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: oauth2Config.clientId,
            client_secret: oauth2Config.clientSecret,
            refresh_token: oauth2Config.refreshToken,
            grant_type: 'refresh_token',
        });

        console.log('Access token received successfully');
        return response.data.access_token;
    } catch (error: any) {
        console.error('Error getting fresh access token:', error.response?.data || error.message);
        throw new Error('Failed to get fresh access token');
    }
};

export const sendEmail = async (to: string, subject: string, text: string) => {
    try {
        // Validate OAuth2 configuration
        if (!oauth2Config.clientId || !oauth2Config.clientSecret || !oauth2Config.refreshToken) {
            throw new Error('Google OAuth2 credentials are not properly configured. Please check your environment variables.');
        }

        // Get fresh access token
        const freshAccessToken = await getFreshAccessToken();

        // Create transporter with fresh access token
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: config.email.auth.user,
                clientId: oauth2Config.clientId,
                clientSecret: oauth2Config.clientSecret,
                refreshToken: oauth2Config.refreshToken,
                accessToken: freshAccessToken,
            },
        });

        const mailOptions = {
            from: config.email.auth.user,
            to,
            subject,
            text,
        };

        console.log('Sending email to:', to);
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
sendEmail('ayushr16060@gmail.com', '!Thanks for visiting', 'Hello');