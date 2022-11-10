export {};
const joi = require('joi');

exports.createCapsuleValidation = (data: { name: string; password: string }) => {
  const schema = joi.object({
    name: joi.string().required().label('name'),
    password: joi.string().required().label('password'),
  });

  return schema.validate(data);
};

exports.joinCapsuleValidation = (data: { capsuleId: string; userId: string; password: string }) => {
  const schema = joi.object({
    capsuleId: joi.string().required().label('capsule'),
    userId: joi.string().required().label('userId'),
    password: joi.string().required().label('password'),
  });
  return schema.validate(data);
};

exports.getCapsuleValidation = (data: { userId: string }) => {
  const schema = joi.object({
    userId: joi.string().required().label('user'),
  });
  return schema.validate(data);
};
