export {};
const express = require('express');
const router = express.Router();
const { register, login, refresh } = require('./Auth');

router.route('/refresh').get(refresh);
router.route('/register').post(register);
router.route('/login').post(login);

module.exports = router;
