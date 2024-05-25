import express from "express";
import authMiddleware from "../middleware/auth.js";
import { registerUser, loginUser, logoutUser, currentUser, updateSubscription, uploadUserAvatar, verifyUser, resendVerificationEmail  } from "../controllers/userControllers.js";
import upload from "../middleware/upload.js";

const usersRouter = express.Router();

usersRouter.post("/register", registerUser);
usersRouter.post('/login', loginUser);
usersRouter.post("/logout", authMiddleware, logoutUser);
usersRouter.get("/current", authMiddleware, currentUser);
usersRouter.patch("/subscription", authMiddleware, updateSubscription);
usersRouter.patch("/avatars", authMiddleware, upload.single("avatar"), uploadUserAvatar);
usersRouter.get("/verify/:verificationToken", verifyUser);
usersRouter.post("/verify", resendVerificationEmail);

export default usersRouter;