// controllers/auth/setPassword.js
const { setPasswordWithSetupToken } = require('../../services/auth/auth.service');

const setPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await setPasswordWithSetupToken(token, password);
    return res.status(200).json({
      message: 'Password set successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};