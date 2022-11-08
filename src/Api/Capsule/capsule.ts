const Capsule = require('../../Model/Capsule');

/**
 * api to create capsule
 */
exports.createCapsule = async (req: any, res: any) => {
  const { name } = req.body;
  /**
   * user from auth middleware
   */
  const { _id: userId } = req.user;
  /**
   * check user isnt already admin of a capsule
   */
  try {
    const capsule = await Capsule.findOne({ admin: userId });
    console.log(capsule);
    if (!!capsule) {
      return res.status(400).json({ message: 'capsule already owned by user' });
    }
    const newCapule = await Capsule.create({
      admin: userId,
      users: [userId],
      name,
    });
    res.status(200).json({ message: 'success', capsuleId: newCapule._id });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
