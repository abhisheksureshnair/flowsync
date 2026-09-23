import express from "express";

const router = express.Router();

// Placeholder route for ETA/Map functionality
// TODO: Implement map/ETA controller and connect here
router.get("/eta", (req, res) => {
  res.status(200).json({ message: "ETA route is active. Controller not yet implemented." });
});

export default router;
