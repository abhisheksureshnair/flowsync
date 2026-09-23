import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Check Bearer token
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If decoded payload lacks team info, hydrate from DB
    let userTeam = decoded.team;
    let userTeamId = decoded.teamId;

    if (!userTeam && !userTeamId) {
      const userDoc = await User.findById(decoded.id).select("team teamId role");
      if (userDoc) {
        userTeam = userDoc.team || "";
        userTeamId = userDoc.teamId || null;
      }
    }

    // Store decoded user
    req.user = {
      ...decoded,
      team: userTeam || "",
      teamId: userTeamId || null,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default auth;
