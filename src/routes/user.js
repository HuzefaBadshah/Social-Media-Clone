const { userAuth } = require('../middleswares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

const userRouter = require('express').Router();

const USER_DETAILS = ['firstname', 'lastname', 'age', 'gender', 'photoURL', 'skills'];

userRouter.get('/user/requests/received', userAuth, async (req, res) => {
    try {
        const user = req.user;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: user._id,
            status: 'interested'
        }).populate(
            'fromUserId',
            USER_DETAILS
        );

        res.json({
            data: connectionRequests,
            message: 'Data fetched Successfully'
        })

    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }
});

userRouter.get('/user/connections', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, status: 'accepted' },
                { toUserId: loggedInUser._id, status: 'accepted' }
            ]
        }).populate('fromUserId', USER_DETAILS).populate('toUserId', USER_DETAILS);

        res.json({
            data: connections,
            message: 'Connections fetched successfully'
        })
    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }

});

userRouter.get('/feed', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        let skip = (page - 1) * limit;
        skip = skip > 50 ? 50 : skip;

        const connectionRequests = await ConnectionRequest.find({
            $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }]
        }).select("fromUserId toUserId");

        const unwantedUserIds = new Set();

        connectionRequests.forEach((req) => {
            unwantedUserIds.add(req.fromUserId.toString());
            unwantedUserIds.add(req.toUserId.toString());
        });

        const feeds = await User.find({
            $and: [
                { _id: { $nin: Array.from(unwantedUserIds) } },
                { _id: { $ne: loggedInUser._id } }
            ]
        }).select(USER_DETAILS).skip(skip).limit(limit);

        res.json({
            data: feeds,
            message: 'Connections fetched successfully!'
        });

    } catch (err) {
        res.status(400).send('ERROR: ' + err.message);
    }
});


module.exports = userRouter;