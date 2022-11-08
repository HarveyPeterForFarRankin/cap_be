export {};
const express = require('express');
const { createCapsule } = require('./capsule');

const router = express.Router();

router.route('/capsule').post(createCapsule);

module.exports = router;
