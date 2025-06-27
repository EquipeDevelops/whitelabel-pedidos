import express from "express";
import { autenticarToken } from "../middleware/authMiddleware.js";
import {
  getMyProfile,
  updateMyProfile,
  updateMyPassword,
} from "../controllers/profileController.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

router.use(autenticarToken);

router.get("/profile/me", getMyProfile);
router.put("/profile/me", upload.single("avatar"), updateMyProfile);
router.put("/profile/me/password", updateMyPassword);

export default router;
