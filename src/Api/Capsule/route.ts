export {};
const express = require('express');
const { createCapsule, getCapsule, joinCapsule } = require('./capsule');
const { capsuleCheck } = require('../../Middleware/capsule');

const router = express.Router();

router.route('/capsule').get(getCapsule);
router.route('/capsule').post(capsuleCheck, createCapsule);
router.route('/capsule/join').post(capsuleCheck, joinCapsule);

module.exports = router;
