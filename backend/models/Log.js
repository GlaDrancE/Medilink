import { Schema, model } from "mongoose";

const logSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  action: {
    type: String,
    enum: ["login", "logout", "warning"],
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  details: { type: Object },
  anomaly: {
    type: Boolean,
    default: false,
    required: true,
  }
});

export default model("Log", logSchema);
