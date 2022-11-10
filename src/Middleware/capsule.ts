export {};
const { error400 } = require('../utils');
const Capsule = require('../Model/Capsule');

/**
 * middleware function to check user is not part of another capsule
 */
exports.capsuleCheck = (req: any, res: any, next: any) => {
  const response400 = error400(res);

  const { _id: userId } = req.user;
  if (!userId) {
    return response400({ message: 'missing user' });
  }

  /**
   * check capsule for user
   */
  const capsule = Capsule.findOne({ users: userId });
  if (capsule) {
    return response400({ message: 'already joined a capsule' });
  }

  next();
};
