// server/routes/userRoutes.js
import express from "express";
import { register, login, checkAuth, updateProfile, getUsers, getUserProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

// POST /api/users/:state  (frontend calls with 'login' or 'register')
router.post("/register", register);
router.post("/signup", register); // Add signup route that uses register controller
router.post("/login", login);

// Convenience: accept /api/users/:state pattern (login/register)
router.post("/:state", (req, res, next) => {
  const state = req.params.state;
  if (state === "login") return login(req, res, next);
  if (state === "register") return register(req, res, next);
  return res.status(404).json({ success: false, message: "Not found" });
});

router.get("/check-auth", checkAuth);
router.get("/", protectRoute, getUsers);
router.get("/profile/:userId", protectRoute, getUserProfile);
router.put("/update", protectRoute, updateProfile);

export default router;
