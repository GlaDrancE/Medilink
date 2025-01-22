import User from "../models/User.js";
import pkg from "jsonwebtoken";
const { sign } = pkg;
import { compare } from "bcrypt";

export async function register(req, res) {
  const { username, email, password } = req.body;
  try {
    const user = await User.create({ username, email, password });
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid email or password");

    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = sign({ id: user._id }, "ayush", { expiresIn: "1d" });
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
}
