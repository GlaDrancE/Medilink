import User from "../models/User.js";
import pkg from "jsonwebtoken";
const { sign } = pkg;
import { compare } from "bcrypt";
import { body, validationResult } from 'express-validator';

export const register = [
  // Validation rules
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('macAddress')
    .notEmpty().withMessage('MAC address is required')
    .matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
    .withMessage('Invalid MAC address format. Use the format: 6c-24-a6-2b-14-4f'),

  // Handle the request
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password, macAddress } = req.body;

    try {
      // Check if the email or MAC address is already registered
      const existingUser = await User.findOne({ $or: [{ email }, { macAddress }] });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email or MAC address is already registered' });
      }

      // Create a new user with MAC address
      const user = await User.create({ username, email, password, macAddress });

      // Generate a JWT token
      const token = sign({ id: user._id }, "cumondaddy", { expiresIn: "1d" });

      // Send success response
      res.status(201).json({ success: true, user, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
];

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid email or password");

    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = sign({ id: user._id }, "cumondaddy", { expiresIn: "1d" });

    // Include MAC address in the response
    res.status(200).json({ success: true, token, macAddress: user.macAddress });
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, error: error.message });
  }
}