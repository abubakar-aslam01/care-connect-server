import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = '7d';

export const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not set');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
