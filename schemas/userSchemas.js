import Joi from "joi";

export const registerValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const emailValidationSchema = Joi.object({
  email: Joi.string().email().required(),
});
