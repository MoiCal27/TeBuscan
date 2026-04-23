import { validationResult } from 'express-validator';


export const runValidations = (validations) => {
  return async (req, res, next) => {

    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  };
};