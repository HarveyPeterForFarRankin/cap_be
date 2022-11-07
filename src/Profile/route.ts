export {};
const express = require('express');
const router = express.Router();
const { profile } = require('./profile');

router.route('/details').get(profile);

module.exports = router;
