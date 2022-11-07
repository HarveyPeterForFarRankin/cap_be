import { generateAuthTokens, verifyRefreshToken } from './helper';

export {};
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const { comparePasswords } = require('./helper');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./helper');
const maxAge = 3 * 60 * 60;

/**
 * route for users to register an accoutn
 */
exports.register = async (req: any, res: any) => {
  const { username, password } = req.body;
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password less than 6 characters' });
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
          console.log(err);
          res.status(401);
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
 * Basic login route
 */
exports.login = async (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    const missingUsernamePassword = !username || !password;
    /**
     * return 400 if missing password or username
     */
    if (missingUsernamePassword) {
      return res.status(400).json({ error: 'failed to provide username or password' });
    }
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
    const accessToken = jwt.sign(tokenDetails, jwtSecret, { expiresIn: '14m' });
    res.status(200).json({
      error: false,
      accessToken,
      message: 'Access token created successfully',
    });
  } catch (err) {
    res.status(400).json(err);
  }
};
