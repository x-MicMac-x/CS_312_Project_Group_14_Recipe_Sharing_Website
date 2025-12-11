import express from "express";
import { signupPage, signupUser, loginPage, loginUser, logout } from "../Control/login_control.js";

const router = express.Router();

router.get("/signup", signupPage);
router.post("/signup", signupUser);  // <-- This line handles the form submission

router.get("/login", loginPage);
router.post("/login", loginUser);
router.get("/logout", logout);

export default router;
