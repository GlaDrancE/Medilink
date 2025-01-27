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

export async function getEmail(req, res)
{
  const { macAddress } = req.body;

  try {
    const user = await User.findOne({ macAddress: macAddress });
    if (user) {
      return res.json({ email: user.email });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
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

export async function getUser (req, res) {
  try {
      const email = req.params.email;
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ success: false, error: "User not found" });
      }

      // Return the user's ObjectId
      res.status(200).json({ success: true, userId: user._id, bluetoothAddress: user.bluetoothAddress });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


export async function getLogCounts(req, res) {
    try {
        const userId = req.user.id; 

        // Get the current date and calculate the dates for 5, 10, 15, and 30 days ago
        const currentDate = new Date();
        const fiveDaysAgo = new Date(currentDate);
        fiveDaysAgo.setDate(currentDate.getDate() - 5);

        const tenDaysAgo = new Date(currentDate);
        tenDaysAgo.setDate(currentDate.getDate() - 10);

        const fifteenDaysAgo = new Date(currentDate);
        fifteenDaysAgo.setDate(currentDate.getDate() - 15);

        const thirtyDaysAgo = new Date(currentDate);
        thirtyDaysAgo.setDate(currentDate.getDate() - 30);

        const getCounts = async (startDate) => {
            const logs = await Log.find({
                userId: userId,
                timestamp: { $gte: startDate, $lte: currentDate },
            });

            const logins = logs.filter(log => log.action === "login").length;
            const logouts = logs.filter(log => log.action === "logout").length;
            const anomalies = logs.filter(log => log.anomaly === true).length;

            return { logins, logouts, anomalies };
        };

        const fiveDaysCounts = await getCounts(fiveDaysAgo);
        const tenDaysCounts = await getCounts(tenDaysAgo);
        const fifteenDaysCounts = await getCounts(fifteenDaysAgo);
        const thirtyDaysCounts = await getCounts(thirtyDaysAgo);

        res.status(200).json({
            success: true,
            counts: {
                "5_days": fiveDaysCounts,
                "10_days": tenDaysCounts,
                "15_days": fifteenDaysCounts,
                "30_days": thirtyDaysCounts,
            },
        });
    } catch (error) {
        console.error(`Error fetching log counts: ${error.message}`);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}