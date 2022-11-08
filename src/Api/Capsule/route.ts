export {};
const express = require('express');
const { createCapsule, getCapsule } = require('./capsule');

const router = express.Router();

router.route('/capsule').post(createCapsule);
router.route('/capsule').get(getCapsule);

module.exports = router;
