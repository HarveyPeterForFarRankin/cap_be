export {};
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../Auth/helper');

/**
 * Basic user auth middleware, decrypt jwt token to ensure it was hashed from the server
 */
exports.userAuth = (req: any, res: any, next: any) => {
  const token = req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, jwtSecret, (err: any, decodedToken: any) => {
      if (err) {
        return res.status(401).json({ message: 'Not authorized' });
      } else {
        /**
         * remove password
         */
        delete decodedToken.password;
        req.user = decodedToken.user;
        next();
      }
    });
  } else {
    return res.status(401).json({ message: 'Not authorized, token not available' });
  }
};
