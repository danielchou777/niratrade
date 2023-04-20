import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const roundToMinute = (date) => {
  date.setSeconds(0);
  date.setMilliseconds(0);
  return Math.floor(date.getTime() / 1000);
};

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(+process.env.SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const comparePassword = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

export const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: +process.env.JWT_LIFETIME,
  });
  return token;
};

export const isTokenValid = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);
