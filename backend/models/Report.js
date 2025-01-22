import { Schema, model } from 'mongoose';

const reportSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    content: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default model('Report', reportSchema);
