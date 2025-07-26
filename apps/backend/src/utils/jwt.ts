import dotenv from 'dotenv'
import jwt from "jsonwebtoken";
import path from 'path'

dotenv.config({ path: path.join(__dirname, "../../../../.env") });
console.log(path.join(__dirname, "../../../../.env"))
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "your-secret-key"; // Use env in production

console.log(JWT_SECRET)

export function generateToken(payload: Record<string, any>, expiresIn = "1d") {

    return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
}
