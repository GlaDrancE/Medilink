// controllers/logController.js
import Log from "../models/Log.js";

export async function createLog(req, res) {
  console.log("Data : ", req.body);
  try {
    const log = await Log.create(req.body);
    console.log("Log created: ", log);
    res.status(201).json({ success: true, log });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function getLogs(req, res) {
  try {
    const logs = await Log.find();
    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
