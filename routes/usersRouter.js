import express from "express";
import authMiddleware from "../middelware/aurh.js";
import { registerUser, loginUser, logoutUser, currentUser, updateSubscription } from "../controllers/userControllers.js";

const usersRouter = express.Router();

usersRouter.post("/register", registerUser);
usersRouter.post('/login', loginUser);
usersRouter.post("/logout", authMiddleware, logoutUser);
usersRouter.get("/current", authMiddleware, currentUser);
usersRouter.patch("/subscription", authMiddleware, updateSubscription);

export default usersRouter;
