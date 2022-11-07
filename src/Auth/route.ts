export {};
const express = require('express');
const { register, login, refresh, logout } = require('./Auth');

const router = express.Router();

router.route('/refresh').get(refresh);
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').delete(logout);

module.exports = router;
