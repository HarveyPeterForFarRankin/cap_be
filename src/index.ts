const express = require('express');
const connectDb = require('./db');
const app = express();
const PORT = process.env.PORT || 5000;
const cookieParser = require('cookie-parser');
const { userAuth } = require('./Middleware/auth');

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', require('./Auth/route'));
app.get('/protected', userAuth, (req: any, res: any) => res.status(200).json({ message: 'success' }));

connectDb();

app.listen(PORT, () => console.log(`Server Connected to port ${PORT}`));

process.on('unhandledRejection', err => console.log('err occurred', err));
