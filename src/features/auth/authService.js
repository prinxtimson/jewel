import { account } from "../../lib/appwrite";

const getCurrentUser = async () => {
  const res = await account.get();

  return res;
};

const logout = async () => {
  await account.deleteSession({
    sessionId: "current",
  });

  return;
};

const login = async (userData) => {
  const res = await account.createEmailPasswordSession(userData);

  return res;
};

const forgotPass = async (email) => {
  const res = await account.createRecovery({
    email,
    url: `${import.meta.env.VITE_APP_URL}/password/reset`,
  });

  return res;
};

const resetPass = async (data) => {
  const res = await account.updateRecovery(data);

  return res;
};

const changePass = async (data) => {
  const res = await account.updatePassword(data);

  return res;
};

const changeEmail = async (data) => {
  const res = await account.updateEmail(data);
  return res;
};

const authService = {
  logout,
  login,
  forgotPass,
  resetPass,
  changePass,
  changeEmail,
  getCurrentUser,
};

export default authService;
