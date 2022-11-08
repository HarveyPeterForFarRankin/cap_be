export {};
const joi = require('joi');

exports.createCapsuleValidation = (data: { name: string; password: string }) => {
  const schema = joi.object({
    name: joi.string().required().label('name'),
    password: joi.string().required().label('password'),
  });

  return schema.validate(data);
};
