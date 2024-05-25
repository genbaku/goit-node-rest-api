import "dotenv/config";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';
import User from "../models/user.js";
import gravatar from 'gravatar';
import Jimp from "jimp";
import { registerValidationSchema, emailValidationSchema } from "../schemas/userSchemas.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const registerUser = async (req, res) => {
  try {
    const { error } = registerValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const verificationToken = uuidv4();
    const avatarURL = gravatar.url(req.body.email, { s: '200', r: 'pg', d: 'mm' });

    const newUser = new User({
      email: req.body.email,
      password: hashedPassword,
      subscription: "starter",
      avatarURL,
      verificationToken,
      verify: false
    });
    await newUser.save();

    const msg = {
      to: req.body.email,
      from: 'uselessquery@gmail.com',
      subject: 'Email Verification',
      text: `Please verify your email by clicking on the following link: http://localhost:8080/api/users/verify/${verificationToken}`,
      html: `<p>Please verify your email by clicking on the following link: <a href="http://localhost:8080/api/users/verify/${verificationToken}">Verify Email</a></p>`,
    };
    await sgMail.send(msg);

    return res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Validation error" });
    }

    const user = await User.findOne({ email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Email or password are incorrect" });
    }

    if (!user.verify) {
      return res.status(403).json({ message: "Email not verified" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.token = token;
    await user.save();

    res.status(200).json({ token, user: { email: user.email, subscription: user.subscription } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const currentUser = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
      avatarURL: user.avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;

    const allowedSubscriptions = ['starter', 'pro', 'business'];
    if (!allowedSubscriptions.includes(subscription)) {
      return res.status(400).json({ message: "Invalid subscription value" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { subscription },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Success", NewSubscription: subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadUserAvatar = async (req, res) => {
  try {
    const { path: tempPath, filename } = req.file;
    const avatarPath = `public/avatars/${filename}`;

    const image = await Jimp.read(tempPath);
    await image.resize(250, 250).writeAsync(avatarPath);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarURL: `http://localhost:8080/avatars/${filename}` },
      { new: true }
    );

    res.status(200).json({ avatarURL: user.avatarURL });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyUser = async (req, res) => {
  const {verificationToken} = req.params;

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndUpdate(user._id, {verify: true, verifyToken: null});

    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const resendVerificationEmail = async (req, res) => {
  try {
    const { error } = emailValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "missing required field email" });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res.status(400).json({ message: "Verification has already been passed" });
    }

    const msg = {
      to: email,
      from: 'uselessquery@gmail.com',
      subject: 'Email Verification',
      text: `Please verify your email by clicking on the following link: http://localhost:8080/api/users/verify/${user.verificationToken}`,
      html: `<p>Please verify your email by clicking on the following link: <a href="http://localhost:8080/api/users/verify/${user.verificationToken}">Verify Email</a></p>`,
    };

    await sgMail.send(msg);

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};