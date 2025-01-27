import { Schema, model } from 'mongoose';
import { genSalt, hash } from 'bcrypt';

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    bluetoothAddress: { type: String, unique: true },
    macAddress: { type: String, unique: true }
});


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
    next();
});

export default model('User', userSchema);
