export {};
const express = require('express');
const { createCapsule, getCapsule, joinCapsule } = require('./capsule');

const router = express.Router();

router.route('/capsule').post(createCapsule);
router.route('/capsule').get(getCapsule);
router.route('/capsule/join').post(joinCapsule);
module.exports = router;
