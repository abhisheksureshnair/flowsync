import Team from "../models/TeamName.js";
import {
    addTeamService
} from "../services/team.services.js";

export const fetchteam = async (req, res) => {
    try {
        const fetchTeam = await Team.find();
        if (!fetchTeam || fetchTeam.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "No team is registered",
            });
        }
        return res.status(200).json({
            success: true,
            data: fetchTeam,
        });
    } catch (error) {
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message,
        });
    }
};

export const addteamName = async (req, res) => {
    try {
        const { teamName } = req.body;
        const addteam = await addTeamService(teamName);
        return res.status(200).json({
            success: true,
            message: "Registration Success",
            ...addteam,
        });
    } catch (e) {
        return res.status(e.statusCode || 400).json({
            success: false,
            message: e.message,
        });
    }
};