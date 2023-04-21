import { StatusCodes } from 'http-status-codes';
import Error from '../errors/index.js';
import { getUserByEmail, createUser } from '../models/userAuthModels.js';
import { hashPassword, comparePassword } from '../utils/util.js';
import { v4 as uuidv4 } from 'uuid';
import { createJWT } from '../utils/util.js';
import emailValidator from 'email-validator';

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
  let payload;

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

  let userData = result[0];

  const isMatch = await comparePassword(password, userData.password);

  if (!isMatch) {
    throw new Error.UnauthorizedError('Password is not correct');
  }

  const { user_id, name } = result[0];

  payload = { name, email, user_id };

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
