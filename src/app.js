const express = require('express');
const { connectDB } = require('./config/database');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Allow only a specific origin
    credentials: true, // Enable cookies and credentials
}));
app.use(express.json());
app.use(cookieParser())

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);


connectDB.then(() => {
    console.log('Database connected successfully.');
    app.listen(2000, () => {
        console.log('Server is up and running on port 2000');
    });
}).catch((err) => {
    console.log('Database connection error:', err);
    console.log('Database connection was not established.');
});
