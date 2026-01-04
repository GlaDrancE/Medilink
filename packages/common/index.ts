import dotenv from 'dotenv';
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, ".env") })

import { config } from "./config";
import { sendEmail } from "./utils/sendEmail";
export { config, sendEmail };