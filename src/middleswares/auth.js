const User = require('../models/user');
const jwt = require('jsonwebtoken');

async function userAuth(req, res, next) {
    try {
        const cookies = req.cookies;
        const { token } = cookies;
        let user = null;
        if (!token) {
            return res.status(401).send("Please login!");
        }
        const decoded = jwt.verify(token, 'mySuperSecretToken@123');

        if (!decoded?._id) {
            throw new Error("token not found");
        } else {
            user = await User.findById(decoded._id);
        }
        if (!user) {
            throw new Error('User not found');
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }

}

module.exports = { userAuth }
