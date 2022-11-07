const joi = require('joi');

exports.signUpValidation = (data: { username: string; password: string }) => {
  const schema = joi.object({
    username: joi.string().email().required().label('username'),
    password: joi.string().required().label('password'),
  });

  return schema.validate(data);
};

exports.loginValidation = (data: { username: string; password: string }) => {
  const schema = joi.object({
    username: joi.string().required().label('username'),
    password: joi.string().required().label('password'),
  });

  return schema.validate(data);
};
