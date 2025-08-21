const express = require('express');
const profileRouter = express.Router();
const User = require('../models/user');
const { userAuth } = require('../middleswares/auth');
const { validateProfile } = require('../../utils/validation');

profileRouter.get('/profile/view', userAuth, async (req, res) => {
    try {

        res.status(200).send(req.user);

    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }
});

profileRouter.post('/profile/edit', userAuth, async (req, res) => {
    const user = req.user;
    try {
        const isValidData = validateProfile(req);
        if (isValidData) {
            Object.keys(req.body).forEach((key) => {
                user[key] = req.body[key];
            });
            await user.save();
            res.send(`${user.firstname}'s profile is updated successfully`);
        }
    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }
});

profileRouter.get('/user', userAuth, async (req, res) => {
    try {
        const user = await User.findOne({ emailId: req.body.emailId });
        if (!user) {
            res.status(404).send('User not found');
        } else {
            res.send(user);
        }
    } catch (error) {
        res.status(400).send('cannot find the user');
    }
});

profileRouter.delete('/user', userAuth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.body.userId);
        res.status(200).send('User deleted successfully');
    } catch (error) {
        res.status(400).send('Something went wrong');
    }
});

profileRouter.patch('/user/:userId', userAuth, async (req, res) => {
    const APPROVED_FIELDS = ["firstname", "lastname", "age", "gender", "photoURL", "skills"];
    const is_valid_fields = Object.keys(req.body).every((field) => APPROVED_FIELDS.includes(field));
    try {
        if (!is_valid_fields) {
            throw new Error('Field should be one of ["firstname", "lastname", "age", "gender", "photoURL", "skills"]');
        }

        if (req.body?.skills?.length > 10) {
            throw new Error("Skills cannot be more than 10");
        }
        const user = await User.findByIdAndUpdate(req.params?.userId, req.body, { returnDocument: 'before', runValidators: true });
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send('Something went wrong: ' + error.message);
    }
});

module.exports = profileRouter;