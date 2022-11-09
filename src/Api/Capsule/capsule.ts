const Capsule = require('../../Model/Capsule');
const bcrypt = require('bcryptjs');
const { createCapsuleValidation } = require('../../Serialisers/Capsule/capsule');
const { comparePasswords } = require('../../Api/Auth/helper');

/**
 * api to create capsule
 */
exports.createCapsule = async (req: any, res: any) => {
  const { name, password } = req.body;
  const { error } = createCapsuleValidation({ name, password });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { _id: userId } = req.user;
  /**
   * check user isnt already admin of a capsule
   */
  try {
    bcrypt.hash(password, 10).then(async (hash: string) => {
      const capsule = await Capsule.findOne({ admin: userId });
      if (!!capsule) {
        return res.status(400).json({ message: 'capsule already owned by user' });
      }
      const newCapule = await Capsule.create({
        admin: userId,
        users: [userId],
        name,
        password: hash,
      });
      res.status(200).json({ message: 'success', capsuleId: newCapule._id, password });
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * endpoint to get capsule for admin (to be changed)
 */
exports.getCapsule = async (req: any, res: any) => {
  const { _id: userId } = req.user;
  //TODO: update this with validation
  if (!userId) {
    res.status(400).json({ message: 'Missing user' });
  }
  try {
    /**
     * for now, only admins can get their capsules (1 -> 1)
     */
    const capsule = await Capsule.findOne({ admin: userId });
    res.status(200).json({ capsule });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Basic endpoint for user to join capsule with id and password
 */
exports.joinCapsule = async (req: any, res: any) => {
  const { _id: userId } = req.user;
  const { capsuleId, password } = req.body;

  //TODO: validate data here
  if (!capsuleId) {
    return res.status(400).json({ message: 'Missing capsule' });
  }
  try {
    const capsule = await Capsule.findOne({ _id: capsuleId });
    if (!capsule) {
      return res.status(400).json({ message: 'error occcured, capsule does not exist' });
    }
    /**
     * compare capsule password with one supplied by the user
     */
    const passwordMatch = await comparePasswords(password, capsule.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'password is incorrect' });
    }
    /**
     * Add user to the requestToJoin array
     */
    await Capsule.findOneAndUpdate({ _id: capsuleId }, { $push: { requestsToJoin: userId } });
    return res.status(200).json({ message: 'success' });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
