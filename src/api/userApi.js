import api from "./axios";

/**
 * Fetch all users in team / workspace
 */
export const allUser = () => {
  return api.get("/users");
};

/**
 * Upload profile picture file (multipart/form-data)
 * @param {FormData} formData - Contains 'profileImage' and optional 'userId'
 */
export const uploadProfileImage = (formData) => {
  return api.post("/users/profile-picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Update user profile details (name, bio, role, email)
 * @param {Object} data - Profile updates
 */
export const updateUserProfile = (data) => {
  return api.put("/users/profile", data);
};