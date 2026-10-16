import "dotenv/config";
import { videoQueue } from "../services/queueService.js";
import { processVideoJob } from "../services/processVideoService.js";
import { sqlite } from "../db/sqlite.js";

// Si el worker corre solo (npm run queues), abrimos SQLite aquí.
await sqlite.connect();

videoQueue.process("process-video", async (job) => {
  console.log(`Processing job ${job.id}`);
  await processVideoJob(job);
  console.log(`Finished job ${job.id}`);
});

videoQueue.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log("Video worker started");
