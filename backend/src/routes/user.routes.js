import express from "express";
import {
  getAllUsers,
  uploadProfilePicture,
  updateUserProfile,
} from "../controllers/user.controller.js";
import auth from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// Flexible multer handler accepting single file under any field name
const uploadProfileMiddleware = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload error",
      });
    }
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

router.get("/", auth, getAllUsers);
router.post("/profile-picture", auth, uploadProfileMiddleware, uploadProfilePicture);
router.put("/profile-picture", auth, uploadProfileMiddleware, uploadProfilePicture);
router.put("/profile", auth, updateUserProfile);
router.patch("/profile", auth, updateUserProfile);

export default router;
