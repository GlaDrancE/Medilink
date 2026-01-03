import dotenv from "dotenv";
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

console.log(process.env.JWT_SECRET)

export const config = {
    port: process.env.PORT || 3000,
    db: {
        url: process.env.DB_URL || 'postgresql://postgres:postgres@localhost:5432/medilink',
    },
    jwt: {
        secret: process.env.JWT_SECRET || `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Y3P652bje91yxYTzg4g
sLzFmsZCrfnPBYcb/MFh9GswqtNMadIdbvtzJuNibYiyC5MizlIFCxBvbDfNE8oE
otxAeJF2r3HLPT9nMAFkJcEASUte8RzlsqLX2jieb7uKohGvXaI3QRxQuLb2wtUx
OBwJIFF8PYxIXO7Mxt/SkxkdxmMjMW67qaljR1U/hLDp5Oc6vAbz4uj+D30jkw76
QABs8Zp/fosd+2yoJfA3+S+SKnX4QSiot6/NUmNTnI7qqhrhFGDR84CZqgwfKqT4
moiJt/YJKnUJ1htz0xT/shYwzlP5Bz1pN66X19v++0zTc5DUlfYzrElpHgsishqN
EwIDAQAB
-----END PUBLIC KEY-----
`,
    },

    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE || false,
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'your-password',
        },
        googleOauth2: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
        }
    }
}