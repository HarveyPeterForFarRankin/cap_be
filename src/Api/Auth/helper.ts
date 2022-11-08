const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserToken = require('../../Model/UserToken');
const maxAge = '14m';

/**
 * Function to return if hashed password is the same in db
 * @param password
 * @param passwordInDb
 * @returns {boolean}
 */
const comparePasswords = async (password: string, passwordInDb: string): Promise<boolean> => {
  const result = await bcrypt.compare(password, passwordInDb);
  return !!result;
};

/**
 * function to create jwt token
 * @param exp expiry time of token
 * @returns jwt token
 */
const createJwt =
  (exp = maxAge) =>
  (user: any, secret: string | undefined) => {
    const token = jwt.sign({ user }, secret, {
      expiresIn: exp,
    });
    return token;
  };

/**
 * pre-set function with expiry
 */
const createJwtWithExp = createJwt();

/**
 *
 * @param user
 * @returns access token and refresh token
 * create access token and create refresh token in db
 */
export const generateAuthTokens = async (user: any): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = createJwt()(user, process.env.JWT_SECRET_KEY);
  const refreshToken = createJwt('30d')(user, process.env.REFRESH_SECRET_KEY);
  const userToken = UserToken.findOne({ userId: user._id });
  if (!!userToken) {
    await userToken.remove();
  }
  await new UserToken({ userId: user._id, token: refreshToken }).save();
  return Promise.resolve({ accessToken, refreshToken });
};

export const verifyRefreshToken = async (refreshToken: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    return UserToken.findOne({ token: refreshToken }, (err: any, token: any) => {
      if (err) {
        return reject({ error: true, message: err.message });
      }

      if (!token) {
        return reject({ error: true, message: 'missing refresh token' });
      }

      jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err: any, tokenDetails: any) => {
        if (err) {
          /**
           * Cant verify - remove token from db
           */
          token.remove();
          return reject({ error: true });
        }
        return resolve({ error: false, message: 'valid', tokenDetails });
      });
    });
  });
};

module.exports = {
  comparePasswords,
  createJwtWithExp,
  generateAuthTokens,
  verifyRefreshToken,
};
