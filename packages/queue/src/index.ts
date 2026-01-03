import { Queue } from "bullmq";
import { redisClient } from "@repo/cache";

const queue = new Queue("otp-queue", {
    connection: redisClient,
})

export { queue, emailQueue };