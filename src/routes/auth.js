const express = require('express');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { userAuth } = require('../middleswares/auth');
const { validatePassword } = require('../../utils/validation');


authRouter.post('/signup', async (req, res) => {
    const saltRounds = 10;
    try {
        const { firstname, lastname, emailId, password, age, gender, photoURL, skills } = req.body;
        const validatedPass = validatePassword(password);
        const encrypted_pass = await bcrypt.hash(validatedPass, saltRounds);

        const user = new User({ firstname, lastname, emailId, password: encrypted_pass, age, gender, photoURL, skills });

        await user.save();
        res.status(201).send("User created successfully");
    } catch (error) {
        res.status(400).send('Not able to create the user: ' + error.message);
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId });

        if (!user) {
            throw new Error("Invalid credentials");
        }
        const token = await user.validateAndSignPassword(password);

        res.status(200)
            .cookie('token', token, { expires: new Date(Date.now() + 8 * 3600000) })
            .send('Login Successfull');

    } catch (error) {
        res.status(400).send("ERROR: " + error.message);
    }
});

authRouter.patch('/forgot-password', userAuth, async (req, res) => {
    const saltRounds = 10;
    try {
        const user = req.user;
        const updatedPassword = req.body.password;
        const validatedPass = validatePassword(updatedPassword);
        const encrypted_pass = await bcrypt.hash(validatedPass, saltRounds);
        user.password = encrypted_pass;
        await user.save();
        res.send('Password is updated successfully')

    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }
});

authRouter.get('/logout', (req, res) => {
    try {
        res.clearCookie('token').send('user logged out sccessfully');
    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }    
})

module.exports = authRouter;