import { validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const formatted = errors.array().map((err) => ({ field: err.path, message: err.msg }));
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.details = formatted;
    next(error);
  };
};
