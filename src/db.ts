const Mongoose = require('mongoose');

const connectDB = async () => {
  // change to env variable
  await Mongoose.connect(`mongodb://mongo:27017/Capsule`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
module.exports = connectDB;
