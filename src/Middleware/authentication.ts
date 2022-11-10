export {};
const jwt = require('jsonwebtoken');

/**
 * Basic user auth middleware, decrypt jwt token to ensure it was hashed from the server
 */
exports.userAuthentication = (req: any, res: any, next: any) => {
  //TODO: double check this is the correct header to use
  const token = req.headers['x-access-token'];
  try {
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err: any, decodedToken: any) => {
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
  } catch (err) {
    console.log(err);
  }
};
