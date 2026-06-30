import {
  loginService,
  registrationService,
} from "../services/auth.services.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await loginService(username, password);
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      ...data,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    const data = await registrationService(
      name,
      username,
      email,
      password,
      role
    );
    return res.status(200).json({
      success: true,
      message: "Registration Success",
      ...data,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};
