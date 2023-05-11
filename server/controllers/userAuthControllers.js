import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import emailValidator from 'email-validator';
import Error from '../errors/index.js';
import { getUserByEmail, createUser } from '../models/userAuthModels.js';
import { hashPassword, comparePassword, createJWT } from '../utils/util.js';

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new Error.BadRequestError('Name, email, password are required');
  }

  if (!emailValidator.validate(email)) {
    throw new Error.BadRequestError('Email is not valid');
  }

  if (password.length < 8) {
    throw new Error.BadRequestError('Password must be at least 8 characters');
  }

  const result = await getUserByEmail(email);

  if (result.length > 0) {
    throw new Error.UnauthorizedError('Email has been used');
  }
  const hashedPassword = await hashPassword(password);

  const userId = uuidv4();

  await createUser(userId, name, email, hashedPassword);

  // create jwt token
  const jwt = createJWT({
    payload: { name, email, userId },
  });

  res.status(StatusCodes.OK).json({
    data: {
      access_token: jwt,
      access_expired: +process.env.JWT_LIFETIME,
      userId,
      name,
      email,
    },
  });
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error.BadRequestError('Email, password are required');
  }

  if (!emailValidator.validate(email)) {
    throw new Error.BadRequestError('Email is not valid');
  }
  const result = await getUserByEmail(email);

  if (result.length === 0) {
    throw new Error.UnauthorizedError('User does not exist');
  }

  const userData = result[0];

  const isMatch = await comparePassword(password, userData.password);

  if (!isMatch) {
    throw new Error.UnauthorizedError('Password is not correct');
  }

  const { user_id, name } = result[0];

  const payload = { name, email, userId: user_id };

  const jwt = createJWT({ payload });

  res.status(StatusCodes.OK).json({
    data: {
      access_token: jwt,
      access_expired: +process.env.JWT_LIFETIME,
      userId: user_id,
      name,
      email,
    },
  });
};

export const userProfile = async (req, res) => {
  const { userId, name, email } = req.payload;
  res.status(StatusCodes.OK).json({
    data: {
      userId,
      name,
      email,
    },
  });
};
