import Team from "../models/TeamName.js";

export const addTeamService = async (teamname) => {
    const team = await Team.findOne({ teamName: teamname });

    if (team) {
        const error = new Error("Team is already registered");
        error.statusCode = 400;
        throw error;
    }
    const newTeam = new Team({
        teamName: teamname,
    });
    await newTeam.save();

    return {
        team: newTeam,
    };
};