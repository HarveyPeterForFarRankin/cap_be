const jwt = require('jsonwebtoken');
const maxAge = 3 * 60 * 60;
const bcrypt = require('bcryptjs');
const jwtSecret = '35a6fa48a3cf7f5a02a579e3799532664e5806d7d0c6db54c5fc4096e47dc9c0c59804' || process.env.SECRET;
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
  (user: any) => {
    const token = jwt.sign({ user }, jwtSecret, {
      expiresIn: exp, // 3hrs in sec
    });
    return token;
  };

/**
 *
 * @param res node response object
 * @param user user object to pass to jwt encryption
 */
const setJwtCookie = (res: any, user: any) => {
  const token = createJwtWithExp(user);
  res.cookie('jwt', token, {
    httpOnly: true,
    maxAge: maxAge * 1000,
  });
};

/**
 * pre-set function with expiry
 */
const createJwtWithExp = createJwt();

module.exports = {
  comparePasswords,
  createJwtWithExp,
  setJwtCookie,
  jwtSecret,
};
