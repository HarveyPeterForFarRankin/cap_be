const jwt = require('jsonwebtoken');
const maxAge = '14m';
const bcrypt = require('bcryptjs');
const UserToken = require('../Model/UserToken');
const jwtSecret = '35a6fa48a3cf7f5a02a579e3799532664e5806d7d0c6db54c5fc4096e47dc9c0c59804' || process.env.SECRET;
const jwtRefreshSectret = '35a6fa48a3cf7f5a02a579e3799532664e5806d7d0c6db54c5fc4096e47dc9c0c59805' || process.env.REFRESH_SECRET;

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
  (user: any, secret: string) => {
    const token = jwt.sign({ user }, secret, {
      expiresIn: exp, // 3hrs in sec
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
 * create access token and refresh token in db
 */
export const generateAuthTokens = async (user: any): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = createJwt()(user, jwtSecret);
  const refreshToken = createJwt('30d')(user, jwtRefreshSectret);
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
        console.log('here');
        return reject({ error: true, message: 'does not exist in db' });
      }

      if (!token) {
        console.log('here');
        return reject({ error: true, message: 'missing refresh token' });
      }

      jwt.verify(refreshToken, jwtRefreshSectret, (err: any, tokenDetails: any) => {
        if (err) {
          return reject({ error: true });
        }
        console.log('here');
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
  jwtSecret,
  jwtRefreshSectret,
};
