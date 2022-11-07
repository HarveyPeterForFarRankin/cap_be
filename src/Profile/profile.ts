/**
 * Get user profile endpoint
 */
exports.profile = async (req: any, res: any) => {
  const user = req.user;
  /**
   * Delete hashed password - does not need to be sent to the client
   */
  delete user.password;
  res.status(200).json({
    message: 'success',
    user,
  });
};
