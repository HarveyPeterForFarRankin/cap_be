export {};
const bcrypt = require('bcryptjs');
const User = require('../../Model/User');
const UserToken = require('../../Model/UserToken');
const { signUpValidation, loginValidation } = require('../../Serialisers/Auth/auth');
const { comparePasswords, generateAuthTokens, verifyRefreshToken, createJwt } = require('./helper');
const { error400, error401, success200 } = require('../../utils');

/**
 * 14 mins in milliseconds
 */
const jwtExpiry = 840000;

/**
 * Register user in the application
 */
exports.register = async (req: any, res: any) => {
  const response400 = error400(res);
  const response401 = error401(res);
  const response200 = success200(res);

  const { username, password } = req.body;
  /**
   * Validate signup data
   */
  const { error } = signUpValidation({ username, password });
  if (error) {
    return response400({
      error: true,
      message: error.details[0].message,
    });
  }
  try {
    /**x
     * encrypt password prior to storing in db
     */
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashPassword });
    const { accessToken, refreshToken } = await generateAuthTokens(user);
    /**
     * set http only refresh token
     */
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      maxAge: jwtExpiry,
    });
    /**
     * respond 200 to user
     */
    return response200({
      accessToken,
      message: 'User successfully created',
      user,
    });
  } catch (err: any) {
    /**
     * respond 401 upon any failure
     */
    return response401({
      message: 'User not successful created',
      error: err.message,
    });
  }
};

/**
 * Login route
 */
exports.login = async (req: any, res: any) => {
  const response200 = success200(res);
  const response400 = error400(res);

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
      return response400({ error: error.details[0].message });
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
          maxAge: jwtExpiry,
        });
        return response200({
          accessToken,
          message: 'success',
          user,
        });
      } else {
        /**
         * passwords dont match
         */
        return response400({ message: 'failed', error: 'error' });
      }
    } else {
      /**
       * user does not exist in db
       */
      return response400({ message: 'failed to fetch', error: 'error' });
    }
  } catch (err: any) {
    /**
     * general error
     */
    return response400({ message: 'error', error: err.message });
  }
};

/**
 * Logout User (delete refresh token from db)
 */
exports.logout = async (req: any, res: any) => {
  const response200 = success200(res);
  const response400 = error400(res);

  try {
    const token = req.cookies.jwt;
    const userToken = await UserToken.findOne({ token: token });
    if (userToken) {
      /**
       * remove refresh token in db
       */
      await userToken.remove();
    }
    return response200({ error: false, message: 'Logged Out Sucessfully' });
  } catch (err: any) {
    return response400({ error: err.message });
  }
};

/**
 * Endpoint to refresh access token with refresh token
 */
exports.refresh = async (req: any, res: any) => {
  const response200 = success200(res);
  const response400 = error400(res);

  const refreshToken = req.cookies.jwt;
  if (!refreshToken) {
    return response400({ message: 'missing refresh token' });
  }
  try {
    const { tokenDetails, error, message } = await verifyRefreshToken(refreshToken);
    if (error) {
      return response400({ message });
    }

    const { user } = tokenDetails;
    const accessToken = createJwt()(user, process.env.JWT_SECRET_KEY);
    return response200({
      error: false,
      accessToken,
      message: 'Success',
    });
  } catch (err: any) {
    return response400({ message: err.message });
  }
};
