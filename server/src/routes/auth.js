import { Router } from "express";
import { User } from "../models/User.js";
import { validateRegister, validateLogin } from "../validators/auth.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const errors = validateRegister(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    const existing = await User.findByEmail(req.body.email);
    if (existing) {
      return res.status(409).json({ success: false, message: "Email ya registrado" });
    }

    const user = await User.create({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });

    const token = User.generateToken(user);
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, user: User.toPublic(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const errors = validateLogin(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    const user = await User.findByEmail(req.body.email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const valid = await User.validatePassword(user, req.body.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const token = User.generateToken(user);
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, user: User.toPublic(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("access_token");
  res.json({ success: true });
});

router.get("/me", authenticate, async (req, res) => {
  res.json({ success: true, user: User.toPublic(req.user) });
});

export { router as authRouter };
