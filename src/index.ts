require('dotenv').config();
const express = require('express');
const connectDb = require('./db');
const cookieParser = require('cookie-parser');
const { userAuthentication } = require('./Middleware/authentication');
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', require('./Api/Auth/route'));
app.use('/api/profile', userAuthentication, require('./Api/Profile/route'));
app.use('/api', userAuthentication, require('./Api/Capsule/route'));

connectDb();

app.listen(port, () => console.log(`Server Connected to port ${port}`));

process.on('unhandledRejection', err => console.log('err occurred', err));
