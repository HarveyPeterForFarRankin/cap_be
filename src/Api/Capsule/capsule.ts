export {};
const Capsule = require('../../Model/Capsule');
const bcrypt = require('bcryptjs');
const { createCapsuleValidation, joinCapsuleValidation, getCapsuleValidation } = require('../../Serialisers/Capsule/capsule');
const { comparePasswords } = require('../../Api/Auth/helper');
const { error400, success200 } = require('../../utils');

/**
 * api to create capsule - can only create if user is not part of other capsule
 */
exports.createCapsule = async (req: any, res: any) => {
  const response400 = error400(res);
  const response200 = success200(res);

  const { name, password } = req.body;
  const { error } = createCapsuleValidation({ name, password });
  if (error) {
    return response400({ message: error.details[0].message });
  }

  const { _id: userId } = req.user;
  /**
   * check user isnt already admin of a capsule
   */
  try {
    bcrypt.hash(password, 10).then(async (hash: string) => {
      const newCapule = await Capsule.create({
        admin: userId,
        users: [userId],
        name,
        password: hash,
      });
      return response200({ message: 'success', capsuleId: newCapule._id, password });
    });
  } catch (err: any) {
    return response400({ message: err.message });
  }
};

/**
 * endpoint to get capsule for admin (to be changed)
 */
exports.getCapsule = async (req: any, res: any) => {
  const response400 = error400(res);
  const response200 = success200(res);

  const { _id: userId } = req.user;

  const { error } = getCapsuleValidation({ userId });
  if (error) {
    return response400({ message: error.details[0].message });
  }
  try {
    /**
     * user can get the capsule they are part of
     */
    const capsule = await Capsule.findOne({ users: userId });
    return response200({ capsule });
  } catch (err: any) {
    return response400({ message: err.message });
  }
};

/**
 * Basic endpoint for user to join capsule with id and password
 */
exports.joinCapsule = async (req: any, res: any) => {
  const response400 = error400(res);
  const response200 = success200(res);

  const { _id: userId } = req.user;
  const { capsule: capsuleId } = req.query;
  const { password } = req.body;
  try {
    const { error } = joinCapsuleValidation({ capsuleId, userId, password });

    if (error) {
      return response400({
        message: error.details[0].message,
      });
    }

    const capsule = await Capsule.findOne({ _id: capsuleId });
    if (!capsule) {
      return response400({ message: 'error occcured, capsule does not exist' });
    }
    /**
     * compare capsule password with one supplied by the user
     */
    const passwordMatch = await comparePasswords(password, capsule.password);
    if (!passwordMatch) {
      return response400({ message: 'password is incorrect' });
    }
    /**
     * Add user to the requestToJoin array
     */
    await Capsule.findOneAndUpdate({ _id: capsuleId }, { $push: { requestsToJoin: userId } });
    return response200({ message: 'success' });
  } catch (err: any) {
    return response400({ message: err.message });
  }
};
