const { userAuth } = require('../middleswares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

const requestRouter = require('express').Router();

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const toUser = await User.findById(toUserId);

    if (!toUser) {
        res.status(400).json({
            message: 'User not found'
        });
    }

    const allowedStatus = ['interested', 'ignored'];
    try {
        if (!allowedStatus.includes(status)) {
            throw new Error(`status should be one of ${allowedStatus.join('|')}`);
        }

        const isExistingConnection = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (isExistingConnection) {
            throw new Error('Connection request already exists');
        }
        const connectionRequest = new ConnectionRequest({
            fromUserId, toUserId, status
        });

        const data = await connectionRequest.save();

        res.json({
            data,
            message: `${req.user.firstname} ${status === 'interested' ? 'is' : 'has'} ${status} ${toUser.firstname}`
        });

    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }
});

requestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
    const loggedInUser = req.user;
    const status = req.params.status;
    const requestId = req.params.requestId;
    const validStatuses = ['accepted', 'rejected'];

    try {
        if (!validStatuses.includes(status)) {
            throw new Error('Status should be one of:' + validStatuses.join(', '));
        }
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            status: 'interested',
            toUserId: loggedInUser._id
        });

        if (!connectionRequest) {
            throw new Error('connection request not found');
        }

        connectionRequest.status = status;
        await connectionRequest.save();
        res.json({
            data: connectionRequest,
            message: 'connection request ' + status
        })
    } catch (error) {
        res.status(400).send('ERROR: ' + error.message);
    }
});

module.exports = requestRouter;
