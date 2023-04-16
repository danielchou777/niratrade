import { StatusCodes } from 'http-status-codes';
import CustomAPIError from './customAPIError.js';

class tooManyRequestsError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.TOO_MANY_REQUESTS;
  }
}

export default tooManyRequestsError;
