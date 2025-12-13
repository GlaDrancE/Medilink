import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, "../.env") })

console.log(process.env.DATABASE_URL)
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL || ''
});
const prisma = new PrismaClient({ adapter });

export default prisma; 