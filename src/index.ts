require('dotenv').config();
const express = require('express');
const connectDb = require('./db');
const cookieParser = require('cookie-parser');
const { userAuth } = require('./Middleware/auth');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', require('./Auth/route'));
app.use('/api/profile', userAuth, require('./Profile/route'));

connectDb();

app.listen(PORT, () => console.log(`Server Connected to port ${PORT}`));

process.on('unhandledRejection', err => console.log('err occurred', err));
