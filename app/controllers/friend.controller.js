var Friend = require('../models/friend.model');
exports.isFriend = (req, res) => {
    const data = {
        user1ID: req.query.user1ID,
        user2ID: req.query.user2ID,
    };

    Friend.isFriend(data, (response) => {
        res.send({ status: response });
    });
};
