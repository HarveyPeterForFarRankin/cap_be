export {};
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const CapsuleSchema = new Mongoose.Schema({
  name: { type: String },
  admin: { type: Schema.Types.ObjectId, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  users: { type: [Schema.Types.ObjectId] },
});

const Capsule = Mongoose.model('capsule', CapsuleSchema);

module.exports = Capsule;
