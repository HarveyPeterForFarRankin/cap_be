export {};
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../Model/User');
const UserToken = require('../../Model/UserToken');
const { signUpValidation, loginValidation } = require('../../Serialisers/Auth/auth');
const { comparePasswords, generateAuthTokens, verifyRefreshToken } = require('./helper');

const maxAge = 3 * 60 * 60;

/**
 * Register user in the application
 */
exports.register = async (req: any, res: any) => {
  const { username, password } = req.body;
  /**
   * Validate signup data
   */
  const { error } = signUpValidation({ username, password });
  if (error) {
    return res.status(400).json({
      error: true,
      message: error.details[0].message,
    });
  }

  try {
    /**x
     * encrypt password prior to storing in db
     */
    bcrypt.hash(password, 10).then(async (hash: any) => {
      await User.create({
        username,
        password: hash,
      })
        .then(async (user: any) => {
          const { accessToken, refreshToken } = await generateAuthTokens(user);
          /**
           * set http only refresh token
           */
          res.cookie('jwt', refreshToken, {
            httpOnly: true,
            maxAge: maxAge * 1000,
          });
          /**
           * return access token
           */
          res.status(200).json({
            accessToken,
            message: 'User successfully created',
            user,
          });
        })
        .catch((err: any) => {
          res.status(401).json({ message: err.message });
        });
    });
  } catch (err: any) {
    res.status(401).json({
      message: 'User not successful created',
      error: err.message,
    });
  }
};

/**
 * Login route
 */
exports.login = async (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    /**
     * Validate login data
     */
    const { error } = loginValidation({ username, password });
    /**
     * return 400 if missing password or username
     */
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    /**
     * Check for user
     */
    const user = await User.findOne({ username });
    const userExists = !!user;
    if (userExists) {
      /**
       * check password math in db (hash decrypt)
       */
      const passwordMatch = await comparePasswords(password, user.password);
      if (passwordMatch) {
        const { accessToken, refreshToken } = await generateAuthTokens(user);
        /**
         * set http only refresh token
         */
        res.cookie('jwt', refreshToken, {
          httpOnly: true,
          maxAge: maxAge * 1000,
        });
        return res.status(200).json({
          accessToken,
          message: 'success',
          user,
        });
      } else {
        /**
         * passwords dont match
         */
        return res.status(400).json({ message: 'failed', error: 'error' });
      }
    } else {
      /**
       * user does not exist in db
       */
      return res.status(400).json({ message: 'failed to fetch', error: 'error' });
    }
  } catch (err: any) {
    /**
     * general error
     */
    res.status(400).json({ message: 'error', error: err.message });
  }
};

/**
 * Logout User
 */
exports.logout = async (req: any, res: any) => {
  try {
    const token = req.cookies.jwt;
    const userToken = await UserToken.findOne({ token: token });
    if (!userToken) {
      return res.status(200).json({ error: false, message: 'Logged Out Sucessfully' });
    }
    await userToken.remove();
    res.status(200).json({ error: false, message: 'Logged Out Sucessfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Refresh token
 */
exports.refresh = async (req: any, res: any) => {
  const refreshToken = req.cookies.jwt;
  if (!refreshToken) {
    res.status(400).json({ message: 'missing refresh token' });
  }
  try {
    const { tokenDetails, error, message } = await verifyRefreshToken(refreshToken);
    if (error) {
      res.status(400).json({ message });
    }
    /**
     * Remove tokenDetails expiry
     */
    delete tokenDetails.exp;
    const accessToken = jwt.sign(tokenDetails, process.env.JWT_SECRET_KEY, { expiresIn: '14m' });
    res.status(200).json({
      error: false,
      accessToken,
      message: 'Success',
    });
  } catch (err) {
    res.status(400).json(err);
  }
};
