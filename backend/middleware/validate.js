import { errorHandler } from "../utils/error.js";

export const validateSchema = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    next();
  } catch (error) {
    if (error.inner) {
      const errorMessages = error.inner.map((e) => e.message).join(", ");
      return next(errorHandler(400, errorMessages));
    }
    return next(errorHandler(400, error.message));
  }
};
