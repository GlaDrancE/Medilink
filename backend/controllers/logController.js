// controllers/logController.js
import Log from "../models/Log.js";
import sendEmail from '../config/email.js';
import User from "../models/User.js";

export async function createLog(req, res) {
  console.log("Data: ", req.body);
  try {
      const log = await Log.create(req.body);
      console.log("Log created: ", log);

      if (log.anomaly) {
          console.log("Anomaly detected, preparing to send an email...");

          const user = await User.findById(log.userId);
          if (user) {
              const subject = "Anomaly Detected in Your Account Activity";
              const text = `Hello ${user.username},\n\nWe detected unusual activity on your account. Please review your login activity and ensure the security of your account.\n\nDetails:\nAction: ${log.action}\nTimestamp: ${log.timestamp}\n\nRegards,\nAI Login Tracker Team`;
              const html = `<p>Hello ${user.username},</p>
                  <p>We detected <strong>unusual activity</strong> on your account. Please review your login activity and ensure the security of your account.</p>
                  <p><strong>Details:</strong></p>
                  <ul>
                      <li><strong>Action:</strong> ${log.action}</li>
                      <li><strong>Timestamp:</strong> ${log.timestamp}</li>
                  </ul>
                  <p>Regards,<br>AI Login Tracker Team</p>`;

              await sendEmail({
                  to: user.email,
                  subject,
                  text,
                  html,
              });

              console.log(`Anomaly email sent to user: ${user.email}`);
          } else {
              console.log("User not found for the provided userId.");
          }
      }

      res.status(201).json({ success: true, log });
  } catch (error) {
      console.error(`Error: ${error.message}`);
      res.status(400).json({ success: false, error: error.message });
  }
}

export async function getLogs(req, res) {
  try {
    const userId = req.user.id; 
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    
    const logs = await Log.find({
      userId: userId, 
      timestamp: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error(`Error fetching logs: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function getSummary(req, res) {
  try {
    const userId = req.user.id; 
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    
    const logins = await Log.countDocuments({ userId: userId, action: "login", timestamp: { $gte: thirtyDaysAgo } });
    const logouts = await Log.countDocuments({ userId: userId, action: "logout", timestamp: { $gte: thirtyDaysAgo } });
    const warnings = await Log.countDocuments({ userId: userId, action: "warning", timestamp: { $gte: thirtyDaysAgo } });
    const anomalies = await Log.countDocuments({ userId: userId, anomaly: true, timestamp: { $gte: thirtyDaysAgo } });

    res.status(200).json({ success: true, logins, logouts, warnings, anomalies });
  } catch (error) {
    console.error(`Error fetching summary: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
}