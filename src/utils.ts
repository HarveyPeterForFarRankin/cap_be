/**
 *
 * @param status response number
 * @returns void
 * util funciton to abstract the response details
 */
const responseHandler =
  (status: number) =>
  (res: any) =>
  <T>(data: T) => {
    return res.status(status).json(data);
  };

const error400 = responseHandler(400);
const error401 = responseHandler(401);
const success200 = responseHandler(200);

module.exports = {
  error400,
  error401,
  success200,
};
