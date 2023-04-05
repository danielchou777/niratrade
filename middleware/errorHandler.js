import { StatusCodes } from 'http-status-codes';

const errorHandlerMiddleWare = (err, req, res, next) => {
  console.log(err);

  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Internal Server Error',
  };

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

export default errorHandlerMiddleWare;
