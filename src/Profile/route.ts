export {};
const express = require('express');
const { profile } = require('./profile');

const router = express.Router();

router.route('/details').get(profile);

module.exports = router;
