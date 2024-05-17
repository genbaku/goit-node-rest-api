import "dotenv/config";
import "./db/db.js";
import express from "express";
import morgan from "morgan";
import cors from "cors";

import authMiddleware from "./middleware/auth.js";

import contactsRouter from "./routes/contactsRouter.js";
import usersRouter from "./routes/usersRouter.js";

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", authMiddleware, contactsRouter);
app.use("/api/users", usersRouter);

app.use('/avatars', express.static('public/avatars'));

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

app.listen(8080, () => {
  console.log("Server is running. Use our API on port: 8080");
});
