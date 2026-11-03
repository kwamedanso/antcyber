// controllers/auth/forgotPassword.js
const { requestPasswordReset } = require('../../services/auth/auth.service');

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    // requestPasswordReset already returns true on unknown email (no enumeration)
    await requestPasswordReset(email, req.ip);
    return res.status(200).json({
      message: 'If an account exists, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};