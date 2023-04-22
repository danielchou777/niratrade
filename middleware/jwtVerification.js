import { StatusCodes } from 'http-status-codes';
import Error from '../errors/index.js';
import { isTokenValid } from '../utils/util.js';

const jwtVerification = async (req, res, next) => {
  // check if authorization header is provided

  console.log(req.headers.authorization);

  if (!req.headers.authorization) {
    throw new Error.UnauthenticatedError('No Credentials Provided');
  }

  const bearerHeader = req.headers.authorization;

  // check if authorization header is valid
  let token;
  if (bearerHeader.startsWith('Bearer ')) {
    token = bearerHeader.split(' ')[1];
  } else {
    throw new Error.UnauthorizedError('Invalid Credentials');
  }

  // check if token is valid
  try {
    req.payload = isTokenValid(token);
  } catch (error) {
    throw new Error.UnauthorizedError('Invalid Credentials');
  }

  next();
};

export default jwtVerification;
